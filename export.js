async function exportPatternToWav() {
  if (!audioStarted) {
    alert("Please click 'Start Audio' first!");
    console.log("Export aborted: Audio not started");
    return;
  }

  console.log("Starting export process...");
  const bpm = patternBPMs[currentPattern] || 120;
  const maxSteps = Math.max(...tracks.map(track => trackStepCounts[track] || 16));
  const quarterNoteDuration = 60 / bpm;
  const patternDuration = maxSteps * quarterNoteDuration;
  console.log(`Pattern duration: ${patternDuration}s, BPM: ${bpm}, Max steps: ${maxSteps}`);

  const originalContext = Tone.getContext();
  const offlineContext = new Tone.OfflineContext(2, patternDuration, 44100);
  Tone.setContext(offlineContext);
  console.log("Offline context created");

  const offlineSamplers = {};
  const offlineExtraSamplers = {};

  // Timeout promise to prevent hanging
  const timeoutPromise = (promise, time, errorMsg) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), time))
    ]);
  };

  // Load samplers for non-extra tracks
  const samplerPromises = tracks.map((track, i) => {
    const note = notes[i] || "C3";
    if (track !== "extra" && loadedSamples[note]) {
      console.log(`Creating sampler for track ${track} with note ${note}`);
      return timeoutPromise(
        new Promise(resolve => {
          try {
            offlineSamplers[track] = new Tone.Sampler({
              urls: { [note]: loadedSamples[note] },
              onload: () => {
                console.log(`Sampler loaded for track ${track} with note ${note}`);
                ["main", "variation"].forEach(mode => {
                  const isVariation = mode === "variation";
                  const panner = new Tone.Panner(
                    isVariation ? variationPanning[track][currentPattern] || 0 : mainPanning[track][currentPattern] || 0
                  );
                  const gain = new Tone.Gain(
                    isVariation ? variationVolumes[track][currentPattern] || 0.8 : mainVolumes[track][currentPattern] || 0.8
                  );
                  const pitchShift = new Tone.PitchShift({
                    pitch: isVariation ? variationPitch[track][currentPattern] || 0 : mainPitch[track][currentPattern] || 0,
                    wet: isVariation ? variationPitchMix[track][currentPattern] || 0 : mainPitchMix[track][currentPattern] || 0
                  });
                  const distortion = new Tone.Distortion({
                    distortion: 0.5,
                    wet: isVariation ? variationDistortionWet[track][currentPattern] || 0 : mainDistortionWet[track][currentPattern] || 0
                  });
                  const delay = new Tone.FeedbackDelay({
                    delayTime: subdivisions[
                      isVariation ? variationDelayTime[track][currentPattern] || 3 : mainDelayTime[track][currentPattern] || 3
                    ]?.time || "4n",
                    feedback: isVariation ? variationDelayFeedback[track][currentPattern] || 0.3 : mainDelayFeedback[track][currentPattern] || 0.3,
                    wet: isVariation ? variationDelayMix[track][currentPattern] || 0 : mainDelayMix[track][currentPattern] || 0
                  });
                  const filter = new Tone.Filter({
                    frequency: isVariation ? variationDelayFilterFreq[track][currentPattern] || 5000 : mainDelayFilterFreq[track][currentPattern] || 5000,
                    type: "lowpass"
                  });
                  offlineSamplers[track].chain(pitchShift, distortion, delay, filter, panner, gain, offlineContext.destination);
                });
                resolve();
              },
              onerror: (error) => {
                console.error(`Failed to load sample for track ${track} with note ${note}: ${error}`);
                offlineSamplers[track] = null;
                resolve();
              }
            });
          } catch (error) {
            console.error(`Error creating sampler for track ${track} with note ${note}: ${error}`);
            offlineSamplers[track] = null;
            resolve();
          }
        }),
        5000,
        `Timeout loading sampler for track ${track} with note ${note}`
      );
    } else if (track !== "extra") {
      console.warn(`No valid sample for track ${track} with note ${note}`);
      return Promise.resolve();
    }
    return Promise.resolve();
  });

  // Load extra track players using Tone.Player
  const extraPromises = [];
  tracks.forEach(track => {
    if (track === "extra") {
      offlineExtraSamplers[track] = {};
      const sequenceData = sequence[track][currentPattern] || [];
      sequenceData.forEach((state, stepIndex) => {
        const buffer = extraStepSamplers[track]?.[currentPattern]?.[stepIndex]?.buffer?._buffer;
        if (state && buffer) {
          console.log(`Validating buffer for extra track, step ${stepIndex}`);
          try {
            // Check if buffer is a valid AudioBuffer
            if (!(buffer instanceof AudioBuffer) || buffer.length === 0 || !buffer.sampleRate) {
              console.warn(`Invalid buffer for extra track, step ${stepIndex}: length=${buffer.length}, sampleRate=${buffer.sampleRate}, duration=${buffer.duration}`);
              offlineExtraSamplers[track][stepIndex] = null;
              return;
            }
            console.log(`Buffer details for extra track, step ${stepIndex}: length=${buffer.length}, sampleRate=${buffer.sampleRate}, duration=${buffer.duration}s`);
            // Log first 10 samples to check buffer data
            console.log(`First 10 samples of extra track, step ${stepIndex}: ${buffer.getChannelData(0).slice(0, 10).join(', ')}`);

            extraPromises.push(
              timeoutPromise(
                (async () => {
                  let offlineBuffer = buffer;
                  const targetRate = offlineContext.sampleRate;
                  if (buffer.sampleRate !== targetRate) {
                    const targetLength = Math.ceil(buffer.duration * targetRate);
                    const tempContext = new OfflineAudioContext(buffer.numberOfChannels, targetLength, targetRate);
                    const source = tempContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(tempContext.destination);
                    source.start(0);
                    try {
                      offlineBuffer = await tempContext.startRendering();
                      console.log(`Resampled buffer for extra track, step ${stepIndex} to ${targetRate}Hz`);
                    } catch (error) {
                      console.error(`Error resampling buffer for extra track, step ${stepIndex}: ${error}`);
                      offlineBuffer = buffer; // Fallback to original
                    }
                  } else {
                    console.log(`Sample rate matches for extra track, step ${stepIndex}; using original buffer`);
                  }

                  offlineExtraSamplers[track][stepIndex] = new Tone.Player(offlineBuffer);
                  console.log(`Created Tone.Player for extra track, step ${stepIndex}`);

                  const pitchShift = new Tone.PitchShift({
                    pitch: extraPitch[track][currentPattern]?.[stepIndex] || 0,
                    wet: extraPitchMix[track][currentPattern]?.[stepIndex] || 1
                  });
                  const distortion = new Tone.Distortion({
                    distortion: 0.5,
                    wet: extraDistortionWet[track][currentPattern]?.[stepIndex] || 0
                  });
                  const delay = new Tone.FeedbackDelay({
                    delayTime: subdivisions[extraDelayTime[track][currentPattern]?.[stepIndex] || 3]?.time || "4n",
                    feedback: extraDelayFeedback[track][currentPattern]?.[stepIndex] || 0.3,
                    wet: extraDelayMix[track][currentPattern]?.[stepIndex] || 0
                  });
                  const filter = new Tone.Filter({
                    frequency: extraDelayFilterFreq[track][currentPattern]?.[stepIndex] || 5000,
                    type: "lowpass"
                  });
                  const panner = new Tone.Panner(extraPanning[track][currentPattern]?.[stepIndex] || 0);
                  const gain = new Tone.Gain(extraVolumes[track][currentPattern]?.[stepIndex] || 0.8);
                  offlineExtraSamplers[track][stepIndex].chain(pitchShift, distortion, delay, filter, panner, gain, offlineContext.destination);
                  console.log(`Chained effects for extra track, step ${stepIndex}`);
                })(),
                60000,
                `Timeout loading extra track Player for step ${stepIndex}`
              )
            );
          } catch (error) {
            console.error(`Error validating buffer for extra track, step ${stepIndex}: ${error}`);
            offlineExtraSamplers[track][stepIndex] = null;
          }
        } else if (state) {
          console.warn(`No valid sample buffer for extra track, step ${stepIndex}`);
          offlineExtraSamplers[track][stepIndex] = null;
        }
      });
    }
  });

  console.log("Waiting for all samplers and players to load...");
  try {
    await Promise.all([...samplerPromises, ...extraPromises]);
    console.log("All samplers and players loaded");
  } catch (error) {
    console.error("Error loading samplers or players:", error);
    console.log("Continuing export with available samplers...");
  }

  const hasActiveSteps = tracks.some((track, i) => {
    if (trackMuteStates[track] || (tracks.some(t => trackSoloStates[t]) && !trackSoloStates[track])) return false;
    const active = sequence[track][currentPattern]?.some(state => state);
    if (active) console.log(`Active steps found for track ${track}: ${sequence[track][currentPattern].filter(s => s).length}`);
    return active;
  });
  if (!hasActiveSteps) {
    alert("No active steps in the pattern! Please enable some steps or load samples.");
    console.log("Export aborted: No active steps");
    Tone.setContext(originalContext);
    return;
  }

  console.log("Scheduling samples for offline rendering...");
  const anySolo = tracks.some(track => trackSoloStates[track]);
  tracks.forEach((track, i) => {
    const stepCount = trackStepCounts[track] || 16;
    if (stepCount === 0) {
      console.warn(`No steps for track ${track}. Skipping.`);
      return;
    }
    if (trackMuteStates[track] || (anySolo && !trackSoloStates[track])) {
      console.log(`Track ${track} is muted or not soloed. Skipping.`);
      return;
    }

    if (track === "extra") {
      sequence[track][currentPattern]?.forEach((state, stepIndex) => {
        if (state && offlineExtraSamplers[track][stepIndex]) {
          const subSequence = extraSubSequences[track][currentPattern]?.[stepIndex] || Array(32).fill(false);
          const substepCount = extraSubstepCounts[track][currentPattern]?.[stepIndex] || 1;
          const substepDuration = quarterNoteDuration / substepCount;
          const stepTime = stepIndex * quarterNoteDuration;

          let activeSubsteps = 0;
          for (let j = 0; j < substepCount; j++) {
            if (subSequence[j]) {
              try {
                console.log(`Scheduling extra track sample for step ${stepIndex} at substep ${j}, time: ${stepTime + j * substepDuration}s`);
                offlineExtraSamplers[track][stepIndex].start(stepTime + j * substepDuration);
                activeSubsteps++;
              } catch (error) {
                console.error(`Error playing extra track sample for step ${stepIndex} at substep ${j}: ${error}`);
              }
            }
          }
          if (activeSubsteps > 0) {
            console.log(`Active players for extra track, step ${stepIndex}: ${activeSubsteps}`);
          }
        } else if (state) {
          console.warn(`Skipping playback for extra track step ${stepIndex}: sampler not loaded or invalid`);
        }
      });
    } else {
      const note = notes[i] || "C3";
      if (!offlineSamplers[track] || !loadedSamples[note]) {
        console.warn(`No sampler or sample for track ${track} with note ${note}. Skipping.`);
        return;
      }
      let activeSteps = 0;
      sequence[track][currentPattern].forEach((state, stepIndex) => {
        if (state && stepIndex < stepCount) {
          const isVariation = state === "variation" || state === "both";
          const stepTime = stepIndex * quarterNoteDuration;
          const noteDuration = "16n";
          try {
            offlineSamplers[track].triggerAttackRelease(note, noteDuration, stepTime);
            activeSteps++;
            console.log(`Triggered sample for track ${track} at step ${stepIndex}, note ${note}`);
          } catch (error) {
            console.error(`Error triggering sample for track ${track} at step ${stepIndex}: ${error}`);
          }
        }
      });
      if (activeSteps > 0) {
        console.log(`Active steps triggered for track ${track}: ${activeSteps}`);
      }
    }
  });

  if (clickActive) {
    for (let i = 0; i < maxSteps; i++) {
      const time = i * quarterNoteDuration;
      const offlineClickSynth = new Tone.MetalSynth({
        frequency: i % 4 === 0 ? 200 : 1200,
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
        harmonicity: i % 4 === 0 ? 5.1 : 2,
      }).toDestination();
      offlineClickSynth.triggerAttackRelease("C3", "8n", time);
      console.log(`Click triggered at step ${i}`);
    }
  }

  console.log("Rendering offline context...");
  let buffer;
  try {
    buffer = await offlineContext.render();
    console.log("Offline context rendered successfully");
  } catch (error) {
    console.error("Error rendering offline context:", error);
    Tone.setContext(originalContext);
    return;
  }

  Tone.setContext(originalContext);
  console.log("Restored original context");

  // Reconnect original samplers to the live context
  tracks.forEach((track, i) => {
    if (track !== "extra" && samplers[track]) {
      const note = notes[i] || "C3";
      if (loadedSamples[note]) {
        const panner = new Tone.Panner(mainPanning[track][currentPattern] || 0);
        const gain = new Tone.Gain(mainVolumes[track][currentPattern] || 0.8);
        const pitchShift = new Tone.PitchShift({
          pitch: mainPitch[track][currentPattern] || 0,
          wet: mainPitchMix[track][currentPattern] || 0
        });
        const distortion = new Tone.Distortion({
          distortion: 0.5,
          wet: mainDistortionWet[track][currentPattern] || 0
        });
        const delay = new Tone.FeedbackDelay({
          delayTime: subdivisions[mainDelayTime[track][currentPattern] || 3]?.time || "4n",
          feedback: mainDelayFeedback[track][currentPattern] || 0.3,
          wet: mainDelayMix[track][currentPattern] || 0
        });
        const filter = new Tone.Filter({
          frequency: mainDelayFilterFreq[track][currentPattern] || 5000,
          type: "lowpass"
        });
        samplers[track].chain(pitchShift, distortion, delay, filter, panner, gain, originalContext.destination);
      }
    }
  });

  // Reconnect extra track players
  tracks.forEach(track => {
    if (track === "extra" && extraStepSamplers[track]?.[currentPattern]) {
      extraStepSamplers[track][currentPattern].forEach((player, stepIndex) => {
        if (player && player.buffer?._buffer) {
          const pitchShift = new Tone.PitchShift({
            pitch: extraPitch[track][currentPattern]?.[stepIndex] || 0,
            wet: extraPitchMix[track][currentPattern]?.[stepIndex] || 1
          });
          const distortion = new Tone.Distortion({
            distortion: 0.5,
            wet: extraDistortionWet[track][currentPattern]?.[stepIndex] || 0
          });
          const delay = new Tone.FeedbackDelay({
            delayTime: subdivisions[extraDelayTime[track][currentPattern]?.[stepIndex] || 3]?.time || "4n",
            feedback: extraDelayFeedback[track][currentPattern]?.[stepIndex] || 0.3,
            wet: extraDelayMix[track][currentPattern]?.[stepIndex] || 0
          });
          const filter = new Tone.Filter({
            frequency: extraDelayFilterFreq[track][currentPattern]?.[stepIndex] || 5000,
            type: "lowpass"
          });
          const panner = new Tone.Panner(extraPanning[track][currentPattern]?.[stepIndex] || 0);
          const gain = new Tone.Gain(extraVolumes[track][currentPattern]?.[stepIndex] || 0.8);
          player.chain(pitchShift, distortion, delay, filter, panner, gain, originalContext.destination);
        }
      });
    }
  });

  console.log("Converting buffer to WAV...");
  let wavBuffer;
  try {
    wavBuffer = await audioBufferToWav(buffer);
    console.log("WAV buffer created");
  } catch (error) {
    console.error("Error converting to WAV:", error);
    return;
  }

  console.log("Creating download link...");
  try {
    const blob = new Blob([wavBuffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pattern_${currentPattern}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Download triggered successfully");
  } catch (error) {
    console.error("Error triggering download:", error);
  }
}

async function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const wavLength = length * numChannels * 2 + 44;
  const wavBuffer = new ArrayBuffer(wavLength);
  const view = new DataView(wavBuffer);

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length * numChannels * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, length * numChannels * 2, true);

  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      const value = Math.max(-1, Math.min(1, sample)) * 32767;
      view.setInt16(44 + (i * numChannels + channel) * 2, value, true);
    }
  }

  return wavBuffer;
}

// Add event listener for the export button
document.getElementById("exportWav").addEventListener("click", exportPatternToWav);
