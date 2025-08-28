async function exportPatternToWav() {
  if (!audioStarted) {
    alert("Please click 'Start Audio' first!");
    return;
  }

  const bpm = patternBPMs[currentPattern] || 120;
  const maxSteps = Math.max(...tracks.map(track => trackStepCounts[track] || 16));
  const quarterNoteDuration = 60 / bpm;
  const patternDuration = maxSteps * quarterNoteDuration;

  // Store the original context before switching to offline context
  const originalContext = Tone.getContext();

  // Create offline context for rendering
  const offlineContext = new Tone.OfflineContext(2, patternDuration, 44100);
  Tone.setContext(offlineContext);

  const offlineSamplers = {};
  const offlineExtraSamplers = {};

  // Load samplers for regular tracks
  tracks.forEach((track, i) => {
    const note = notes[i];
    if (track !== "extra" && loadedSamples[note]) {
      offlineSamplers[track] = new Tone.Sampler({
        urls: { [note]: loadedSamples[note] },
      }).toDestination();
    }
  });

  // Load extra track samplers
  tracks.forEach(track => {
    if (track === "extra") {
      offlineExtraSamplers[track] = {};
      const sequenceData = sequence[track][currentPattern] || [];
      sequenceData.forEach((state, stepIndex) => {
        if (state && extraStepSamplers[track]?.[currentPattern]?.[stepIndex]?.buffer?._buffer) {
          try {
            offlineExtraSamplers[track][stepIndex] = new Tone.Player({
              url: extraStepSamplers[track][currentPattern][stepIndex].buffer, // Use the existing buffer
              onload: () => {
                console.log(`Loaded extra track sample for step ${stepIndex}`);
              },
              onerror: (error) => {
                console.error(`Failed to load extra track sample for step ${stepIndex}: ${error}`);
                offlineExtraSamplers[track][stepIndex] = null; // Mark as null to skip playback
              }
            });
            // Rebuild audio chain for the extra track sample
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
            const delayFilter = new Tone.Filter({
              frequency: extraDelayFilterFreq[track][currentPattern]?.[stepIndex] || 5000,
              type: "lowpass"
            });
            const panner = new Tone.Panner(extraPanning[track][currentPattern]?.[stepIndex] || 0);
            const gain = new Tone.Gain(extraVolumes[track][currentPattern]?.[stepIndex] || 0.8);
            offlineExtraSamplers[track][stepIndex].chain(pitchShift, distortion, delay, delayFilter, panner, gain, offlineContext.destination);
          } catch (error) {
            console.error(`Error creating Tone.Player for extra track, step ${stepIndex}: ${error}`);
            offlineExtraSamplers[track][stepIndex] = null; // Mark as null to skip playback
          }
        } else if (state) {
          console.warn(`No valid sample buffer for extra track, step ${stepIndex}`);
          offlineExtraSamplers[track][stepIndex] = null; // Skip if no valid buffer
        }
      });
    }
  });

  // Wait for all samplers to load or fail
  await Promise.all([
    ...Object.values(offlineSamplers).map(sampler => 
      new Promise(resolve => {
        if (sampler.loaded) return resolve();
        sampler.on('load', resolve);
        sampler.on('error', () => resolve());
      })
    ),
    ...Object.values(offlineExtraSamplers.extra || {}).map(player => 
      new Promise(resolve => {
        if (!player || player.loaded) return resolve();
        player.onload = () => resolve();
        player.onerror = () => resolve();
      })
    )
  ]);

  // Check for active steps
  const hasActiveSteps = tracks.some((track, i) => {
    if (trackMuteStates[track] || (tracks.some(t => trackSoloStates[t]) && !trackSoloStates[track])) return false;
    return sequence[track][currentPattern]?.some(state => state);
  });
  if (!hasActiveSteps) {
    alert("No active steps in the pattern! Please enable some steps or load samples.");
    return;
  }

  const anySolo = tracks.some(track => trackSoloStates[track]);
  tracks.forEach((track, i) => {
    const stepCount = trackStepCounts[track] || 16;
    if (stepCount === 0) return;
    if (trackMuteStates[track] || (anySolo && !trackSoloStates[track])) return;

    if (track === "extra") {
      sequence[track][currentPattern]?.forEach((state, stepIndex) => {
        // Check if the step is active and the sampler exists and is loaded
        if (state && offlineExtraSamplers[track][stepIndex] && offlineExtraSamplers[track][stepIndex].loaded && offlineExtraSamplers[track][stepIndex].buffer?.loaded) {
          const subSequence = extraSubSequences[track][currentPattern]?.[stepIndex] || Array(32).fill(false);
          const substepCount = extraSubstepCounts[track][currentPattern]?.[stepIndex] || 1;
          const substepDuration = quarterNoteDuration / substepCount;
          const stepTime = stepIndex * quarterNoteDuration;

          for (let j = 0; j < substepCount; j++) {
            if (subSequence[j]) {
              try {
                offlineExtraSamplers[track][stepIndex].start(stepTime + j * substepDuration);
              } catch (error) {
                console.error(`Error playing extra track sample for step ${stepIndex} at substep ${j}: ${error}`);
              }
            }
          }
        } else if (state && (!offlineExtraSamplers[track][stepIndex] || !offlineExtraSamplers[track][stepIndex].loaded || !offlineExtraSamplers[track][stepIndex].buffer?.loaded)) {
          console.warn(`Skipping playback for extra track step ${stepIndex}: sampler not loaded or invalid`);
        }
      });
    } else {
      const note = notes[i];
      sequence[track][currentPattern]?.forEach((stepState, stepIndex) => {
        if (stepState) {
          const playMain = stepState === true || stepState === "both";
          const playVariation = stepState === "variation" || stepState === "both";
          const modes = [];
          if (playMain) modes.push(false);
          if (playVariation) modes.push(true);

          modes.forEach(isVariation => {
            const subSequence = isVariation ? variationSubSequences[track][currentPattern] : mainSubSequences[track][currentPattern];
            const substepCount = isVariation ? variationSubstepCounts[track][currentPattern] : mainSubstepCounts[track][currentPattern];
            const playMode = isVariation ? variationMonoPoly[track][currentPattern] : mainMonoPoly[track][currentPattern];
            if (substepCount > 0 && offlineSamplers[track]) {
              const substepDuration = quarterNoteDuration / substepCount;
              const stepTime = stepIndex * quarterNoteDuration;
              const noteDuration = substepCount === 3 ? "8t" : substepCount === 8 ? "32n" : substepCount === 16 ? "64n" : `${substepCount * 4}n`;

              for (let j = 0; j < substepCount; j++) {
                if (subSequence?.[j]) {
                  const subTime = stepTime + j * substepDuration;
                  if (playMode === "mono") {
                    offlineSamplers[track].triggerAttackRelease(note, noteDuration, subTime);
                  } else if (playMode === "poly") {
                    offlineSamplers[track].triggerAttack(note, subTime);
                  } else if (playMode === "full") {
                    offlineSamplers[track].triggerAttackRelease(note, noteDuration, subTime);
                  }
                }
              }
            }
          });
        }
      });
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
    }
  }

  const buffer = await offlineContext.render();

  // After rendering, restore the original context and reconnect samplers
  Tone.setContext(originalContext);

  // Reconnect regular track samplers to the original context
  tracks.forEach((track, i) => {
    if (track !== "extra" && samplers[track]) {
      samplers[track].toDestination();
    }
  });

  // Reconnect extra track samplers to the original context
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
          const delayFilter = new Tone.Filter({
            frequency: extraDelayFilterFreq[track][currentPattern]?.[stepIndex] || 5000,
            type: "lowpass"
          });
          const panner = new Tone.Panner(extraPanning[track][currentPattern]?.[stepIndex] || 0);
          const gain = new Tone.Gain(extraVolumes[track][currentPattern]?.[stepIndex] || 0.8);
          player.chain(pitchShift, distortion, delay, delayFilter, panner, gain, originalContext.destination);
        }
      });
    }
  });

  // Convert AudioBuffer to WAV
  const wavBuffer = await audioBufferToWav(buffer);
  const blob = new Blob([wavBuffer], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pattern_${currentPattern}.wav`;
  a.click();
  URL.revokeObjectURL(url);
}

// Helper function to convert AudioBuffer to WAV
async function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const wavLength = length * numChannels * 2 + 44;
  const wavBuffer = new ArrayBuffer(wavLength);
  const view = new DataView(wavBuffer);

  // Write WAV header
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

  // Write interleaved PCM data
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      const value = Math.max(-1, Math.min(1, sample)) * 32767;
      view.setInt16(44 + (i * numChannels + channel) * 2, value, true);
    }
  }

  return wavBuffer;
}