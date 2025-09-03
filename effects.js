const trackToggleStates = {};

function toggleTrackPad(track) {
  const pad = document.querySelector(`.track-toggle[data-track="${track}"]`);
  const newState = pad.dataset.state === "on" ? "off" : "on";
  pad.dataset.state = newState;
  pad.classList.toggle("active", newState === "on");
  trackToggleStates[track] = newState; // Save the toggle state
}
function toggleSavePad(pad) {
  const saveAllPad = document.querySelector('.saveAllPad');
  const saveSelPad = document.querySelector('.saveSelPad');
  const trackToggles = document.querySelectorAll('.track-toggle');

  if (pad === 'saveAllPad' && saveAllPad.dataset.state === 'off') {
    saveAllPad.dataset.state = 'on';
    saveSelPad.dataset.state = 'off';
    trackToggles.forEach(toggle => {
      const track = toggle.dataset.track;
      const currentState = trackToggleStates[track] || 'off'; // Use saved state
      toggle.dataset.state = currentState;
      toggle.classList.toggle('active', currentState === 'on');
    });
  } else if (pad === 'saveSelPad' && saveSelPad.dataset.state === 'off') {
    saveSelPad.dataset.state = 'on';
    saveAllPad.dataset.state = 'off';
    trackToggles.forEach(toggle => {
      const track = toggle.dataset.track;
      const currentState = trackToggleStates[track] || 'off'; // Use saved state
      toggle.dataset.state = currentState;
      toggle.classList.toggle('active', currentState === 'on');
    });
  }
}

// Refresh panner connections
function refreshPannerConnections(track, isVariation) {
  if (!tracks.includes(track)) {
    console.error(`Invalid track: ${track}`);
    return;
  }

  // Ensure settings exist for the current pattern, use defaults if not
  if (!isVariation) {
    mainPanning[track] = mainPanning[track] || {};
    mainVolumes[track] = mainVolumes[track] || {};
    mainPitch[track] = mainPitch[track] || {};
    mainPitchMix[track] = mainPitchMix[track] || {};
    mainDistortionWet[track] = mainDistortionWet[track] || {};
    mainDelayMix[track] = mainDelayMix[track] || {};
    mainDelayFeedback[track] = mainDelayFeedback[track] || {};
    mainDelayTime[track] = mainDelayTime[track] || {};
    mainDelayFilterFreq[track] = mainDelayFilterFreq[track] || {};
    mainMonoPoly[track] = mainMonoPoly[track] || {};
    mainPanning[track][currentPattern] = mainPanning[track][currentPattern] ?? 0;
    mainVolumes[track][currentPattern] = mainVolumes[track][currentPattern] ?? 0.8;
    mainPitch[track][currentPattern] = mainPitch[track][currentPattern] ?? 0;
    mainPitchMix[track][currentPattern] = mainPitchMix[track][currentPattern] ?? 0;
    mainDistortionWet[track][currentPattern] = mainDistortionWet[track][currentPattern] ?? 0;
    mainDelayMix[track][currentPattern] = mainDelayMix[track][currentPattern] ?? 0;
    mainDelayFeedback[track][currentPattern] = mainDelayFeedback[track][currentPattern] ?? 0.3;
    mainDelayTime[track][currentPattern] = mainDelayTime[track][currentPattern] ?? 3;
    mainDelayFilterFreq[track][currentPattern] = mainDelayFilterFreq[track][currentPattern] ?? 5000;
    mainMonoPoly[track][currentPattern] = mainMonoPoly[track][currentPattern] ?? "mono";
  } else {
    variationPanning[track] = variationPanning[track] || {};
    variationVolumes[track] = variationVolumes[track] || {};
    variationPitch[track] = variationPitch[track] || {};
    variationPitchMix[track] = variationPitchMix[track] || {};
    variationDistortionWet[track] = variationDistortionWet[track] || {};
    variationDelayMix[track] = variationDelayMix[track] || {};
    variationDelayFeedback[track] = variationDelayFeedback[track] || {};
    variationDelayTime[track] = variationDelayTime[track] || {};
    variationDelayFilterFreq[track] = variationDelayFilterFreq[track] || {};
    variationMonoPoly[track] = variationMonoPoly[track] || {};
    variationPanning[track][currentPattern] = variationPanning[track][currentPattern] ?? 0;
    variationVolumes[track][currentPattern] = variationVolumes[track][currentPattern] ?? 0.8;
    variationPitch[track][currentPattern] = variationPitch[track][currentPattern] ?? 0;
    variationPitchMix[track][currentPattern] = variationPitchMix[track][currentPattern] ?? 0;
    variationDistortionWet[track][currentPattern] = variationDistortionWet[track][currentPattern] ?? 0;
    variationDelayMix[track][currentPattern] = variationDelayMix[track][currentPattern] ?? 0;
    variationDelayFeedback[track][currentPattern] = variationDelayFeedback[track][currentPattern] ?? 0.3;
    variationDelayTime[track][currentPattern] = variationDelayTime[track][currentPattern] ?? 3;
    variationDelayFilterFreq[track][currentPattern] = variationDelayFilterFreq[track][currentPattern] ?? 5000;
    variationMonoPoly[track][currentPattern] = variationMonoPoly[track][currentPattern] ?? "mono";
  }

  const sampler = samplers[track];
  const panner = isVariation ? variationPanners[track] : mainPanners[track];
  const gain = isVariation ? variationGains[track] : mainGains[track];
  const pitchShift = isVariation ? variationPitchShifters[track] : mainPitchShifters[track];
  const distortion = isVariation ? variationDistortions[track] : mainDistortions[track];
  const delay = isVariation ? variationDelays[track] : mainDelays[track];
  const delayGain = isVariation ? variationDelayGains[track] : mainDelayGains[track];
  const filter = isVariation ? variationDelayFilters[track] : mainDelayFilters[track];

  sampler.disconnect();
  const note = notes[tracks.indexOf(track)];
  if (loadedSamples[note] && sampler.loaded) {
    sampler.connect(panner);
  }

  const panValue = Math.max(-1, Math.min(1, isVariation ? variationPanning[track][currentPattern] : mainPanning[track][currentPattern]));
  const volumeValue = Math.max(0, Math.min(1, isVariation ? variationVolumes[track][currentPattern] : mainVolumes[track][currentPattern]));
  const pitchValue = Math.max(-24, Math.min(24, isVariation ? variationPitch[track][currentPattern] : mainPitch[track][currentPattern]));
  const pitchMixValue = Math.max(0, Math.min(1, isVariation ? variationPitchMix[track][currentPattern] : mainPitchMix[track][currentPattern]));
  const distortionValue = Math.max(0, Math.min(1, isVariation ? variationDistortionWet[track][currentPattern] : mainDistortionWet[track][currentPattern]));
  const mix = Math.max(0, Math.min(1, isVariation ? variationDelayMix[track][currentPattern] : mainDelayMix[track][currentPattern]));
  const wetGainValue = mix * 0.8;
  const feedback = Math.max(0, Math.min(0.9, isVariation ? variationDelayFeedback[track][currentPattern] : mainDelayFeedback[track][currentPattern]));
  const timeIndex = Math.max(0, Math.min(15, isVariation ? variationDelayTime[track][currentPattern] : mainDelayTime[track][currentPattern]));
  const filterFreq = Math.max(100, Math.min(10000, isVariation ? variationDelayFilterFreq[track][currentPattern] : mainDelayFilterFreq[track][currentPattern]));
  const delayTimeValue = subdivisions[timeIndex]?.time || "4n";

  panner.pan.setValueAtTime(panValue !== undefined ? panValue : 0, Tone.now());
  gain.gain.setValueAtTime(volumeValue !== undefined ? volumeValue : 0.8, Tone.now());
  pitchShift.pitch = pitchValue !== undefined ? pitchValue : 0;
  pitchShift.wet.value = pitchMixValue !== undefined ? pitchMixValue : 0;
  distortion.wet.setValueAtTime(distortionValue !== undefined ? distortionValue : 0, Tone.now());
  delay.wet.setValueAtTime(delayMixValue, Tone.now());
  delayGain.gain.setValueAtTime(wetGainValue !== undefined ? wetGainValue : 0, Tone.now());
  delay.feedback.setValueAtTime(feedback !== undefined ? feedback : 0.3, Tone.now());

  try {
    delay.delayTime.setValueAtTime(delayTimeValue, Tone.now());
  } catch (e) {
    console.warn(`Failed to set delayTime for ${track}, reinitializing delay (${isVariation ? "variation" : "main"})`);
    delay.dispose();
    const newDelay = new Tone.FeedbackDelay({
      delayTime: delayTimeValue,
      feedback: feedback !== undefined ? feedback : 0.3,
      wet: 1,
      maxDelay: 2
    });

    if (isVariation) {
      variationDistortions[track].connect(newDelay);
      newDelay.connect(variationDelayFilters[track]);
      variationDelays[track] = newDelay;
    } else {
      mainDistortions[track].connect(newDelay);
      newDelay.connect(mainDelayFilters[track]);
      mainDelays[track] = newDelay;
    }
  }

  if (filter && filter.frequency) {
    filter.frequency.setValueAtTime(filterFreq !== undefined ? filterFreq : 5000, Tone.now());
  } else {
    console.warn(`Filter for ${track} (${isVariation ? "variation" : "main"}) is undefined or lacks frequency property`);
  }
}

const tracks = ["kick", "snare", "hihat", "clap", "tom", "rimshot", "crash", "cowbell", "extra", "extra2", "extra3", "extra4"];
const patternTexts = {};
const variationSubSequences = {};
const mainSubSequences = {};
const mainSubstepCounts = {};
const variationSubstepCounts = {};
const mainPanning = {};
const variationPanning = {};
const mainVolumes = {};
const variationVolumes = {};
const mainDistortionWet = {};
const variationDistortionWet = {};
const mainDelayMix = {};
const variationDelayMix = {};
const mainDelayFeedback = {};
const variationDelayFeedback = {};
const mainDelayTime = {};
const variationDelayTime = {};
const mainDelayFilterFreq = {};
const variationDelayFilterFreq = {};
const mainMonoPoly = {};
const variationMonoPoly = {};
const mainPitch = {};
const variationPitch = {};
const mainPitchMix = {};
const variationPitchMix = {};
const mainPanners = {};
const variationPanners = {};
const mainGains = {};
const variationGains = {};
const mainDistortions = {};
const variationDistortions = {};
const mainDelays = {};
const variationDelays = {};
const mainDelayGains = {};
const variationDelayGains = {};
const mainDelayFilters = {};
const variationDelayFilters = {};
const mainPitchShifters = {};
const variationPitchShifters = {};
const extraStepSamples = {};
const extraStepSamplers = {};
const extraPanning = {};
const extraVolumes = {};
const extraPitch = {};
const extraPitchMix = {};
const extraDistortionWet = {};
const extraDelayMix = {};
const extraDelayFeedback = {};
const extraDelayTime = {};
const extraDelayFilterFreq = {};
const extraMonoPoly = {};
const trackStepCounts = {};
const trackStepLocks = {};
const trackMuteStates = {};
const samplers = {};
const sequence = {};
const extraSamples = {};
const patternStepCounts = {};
const trackSoloStates = {};
const trackStepIndices = {};
extraSubstepCounts[track] = {};

// Initialize data structures for all tracks
tracks.forEach(track => {
  samplers[track] = new Tone.Sampler({ urls: {}, voices: 8 });
  sequence[track] = { A1: Array(32).fill(false) };
  mainSubSequences[track] = { A1: Array(32).fill(false) };
  mainSubSequences[track].A1[0] = true;
  variationSubSequences[track] = { A1: Array(32).fill(false) };
  extraSamples[track] = { A1: Array(32).fill(false) };
  variationSubstepCounts[track] = { A1: 1 };
  patternStepCounts[track] = { A1: 16 };
  trackStepCounts[track] = 16;
  trackStepLocks[track] = false;
  trackSoloStates[track] = false;
  trackMuteStates[track] = false;
  trackStepIndices[track] = 0;
  mainPanners[track] = new Tone.Panner(0);
  variationPanners[track] = new Tone.Panner(0);
  mainGains[track] = new Tone.Gain(0.8);
  variationGains[track] = new Tone.Gain(0.8);
  mainPitchShifters[track] = new Tone.PitchShift({ pitch: 0, wet: 0 });
  variationPitchShifters[track] = new Tone.PitchShift({ pitch: 0, wet: 0 });
  mainDistortions[track] = new Tone.Distortion({ distortion: 0.4, wet: 0 });
  variationDistortions[track] = new Tone.Distortion({ distortion: 0.4, wet: 0 });
  mainDelayGains[track] = new Tone.Gain(0);
  variationDelayGains[track] = new Tone.Gain(0);
  mainDelayFilters[track] = new Tone.Filter({ frequency: 5000, type: "lowpass" });
  variationDelayFilters[track] = new Tone.Filter({ frequency: 5000, type: "lowpass" });
mainDelays[track] = new Tone.FeedbackDelay({ delayTime: subdivisions[4].time, feedback: 0.3, wet: 0 }).toDestination();
variationDelays[track] = new Tone.FeedbackDelay({ delayTime: subdivisions[4].time, feedback: 0.3, wet: 1 }).toDestination();
  mainDelayMix[track] = { A1: 0 };
  variationDelayMix[track] = { A1: 0 };
  mainDelayFeedback[track] = { A1: 0.3 };
  variationDelayFeedback[track] = { A1: 0.3 };
  mainDelayTime[track] = { A1: 3 };
  variationDelayTime[track] = { A1: 3 };
  mainDelayFilterFreq[track] = { A1: 5000 };
  variationDelayFilterFreq[track] = { A1: 5000 };
  mainPitch[track] = { A1: 0 };
  variationPitch[track] = { A1: 0 };
  mainPitchMix[track] = { A1: 0 };
  variationPitchMix[track] = { A1: 0 };
  mainMonoPoly[track] = { A1: "mono" };
  variationMonoPoly[track] = { A1: "mono" };
  extraMonoPoly[track] = { A1: "step" };
  extraStepSamples[track] = { A1: Array(32).fill(null) };
  extraPanning[track] = { A1: Array(32).fill(0) };
  extraVolumes[track] = { A1: Array(32).fill(0.8) };
  extraPitch[track] = { A1: Array(32).fill(0) };
  extraPitchMix[track] = { A1: Array(32).fill(1) };
  extraDistortionWet[track] = { A1: Array(32).fill(0) };
  extraDelayMix[track] = { A1: Array(32).fill(0) };
  extraDelayFeedback[track] = { A1: Array(32).fill(0.3) };
  extraDelayTime[track] = { A1: Array(32).fill(3) };
  extraDelayFilterFreq[track] = { A1: Array(32).fill(5000) };
  extraStepSamplers[track] = { A1: Array(32).fill(null) };
  extraSubSequences[track] = { A1: Array(32).fill(null) };
  extraSubstepCounts[track] = { A1: Array(32).fill(1) };
  extraEffectNodesCache[track] = {};
});

// Sync all delays with current BPM
Object.keys(mainDelays).forEach(track => {
  mainDelays[track].delayTime.value = "4n";
  variationDelays[track].delayTime.value = "4n";
});

// Connect panners to gains to distortions, split to dry path (to speakers) and wet path (to delay and filter)
Object.keys(mainPanners).forEach(track => {
  if (!mainDelayFilters[track] || !variationDelayFilters[track] || !mainDelayGains[track] || !variationDelayGains[track]) {
    console.error(`Filter or gain initialization failed for track: ${track}`);
    mainDelayFilters[track] = new Tone.Filter({ frequency: 5000, type: "lowpass" });
    variationDelayFilters[track] = new Tone.Filter({ frequency: 5000, type: "lowpass" });
    mainDelayGains[track] = new Tone.Gain(0);
    variationDelayGains[track] = new Tone.Gain(0);
  }
  // Dry path: Panner → Gain → PitchShift → Distortion → Speakers
  mainPanners[track].connect(mainGains[track]);
  mainGains[track].connect(mainPitchShifters[track]);
  mainPitchShifters[track].connect(mainDistortions[track]);
  mainDistortions[track].toDestination();

  variationPanners[track].connect(variationGains[track]);
  variationGains[track].connect(variationPitchShifters[track]);
  variationPitchShifters[track].connect(variationDistortions[track]);
  variationDistortions[track].toDestination();

  // Wet path: Distortion → Delay → Filter → Wet Gain → Speakers
  mainDistortions[track].connect(mainDelays[track]);
  mainDelays[track].connect(mainDelayFilters[track]);
  mainDelayFilters[track].connect(mainDelayGains[track]);
  mainDelayGains[track].toDestination();

  variationDistortions[track].connect(variationDelays[track]);
  variationDelays[track].connect(variationDelayFilters[track]);
  variationDelayFilters[track].connect(variationDelayGains[track]);
  variationDelayGains[track].toDestination();
});

// Refresh panner connections
function refreshPannerConnections(track, isVariation) {
  if (!tracks.includes(track)) {
    console.error(`Invalid track: ${track}`);
    return;
  }

  // Ensure settings exist for the current pattern, use defaults if not
  if (!isVariation) {
    mainPanning[track] = mainPanning[track] || {};
    mainVolumes[track] = mainVolumes[track] || {};
    mainPitch[track] = mainPitch[track] || {};
    mainPitchMix[track] = mainPitchMix[track] || {};
    mainDistortionWet[track] = mainDistortionWet[track] || {};
    mainDelayMix[track] = mainDelayMix[track] || {};
    mainDelayFeedback[track] = mainDelayFeedback[track] || {};
    mainDelayTime[track] = mainDelayTime[track] || {};
    mainDelayFilterFreq[track] = mainDelayFilterFreq[track] || {};
    mainMonoPoly[track] = mainMonoPoly[track] || {};
    mainPanning[track][currentPattern] = mainPanning[track][currentPattern] ?? 0;
    mainVolumes[track][currentPattern] = mainVolumes[track][currentPattern] ?? 0.8;
    mainPitch[track][currentPattern] = mainPitch[track][currentPattern] ?? 0;
    mainPitchMix[track][currentPattern] = mainPitchMix[track][currentPattern] ?? 0;
    mainDistortionWet[track][currentPattern] = mainDistortionWet[track][currentPattern] ?? 0;
    mainDelayMix[track][currentPattern] = mainDelayMix[track][currentPattern] ?? 0;
    mainDelayFeedback[track][currentPattern] = mainDelayFeedback[track][currentPattern] ?? 0.3;
    mainDelayTime[track][currentPattern] = mainDelayTime[track][currentPattern] ?? 3;
    mainDelayFilterFreq[track][currentPattern] = mainDelayFilterFreq[track][currentPattern] ?? 5000;
    mainMonoPoly[track][currentPattern] = mainMonoPoly[track][currentPattern] ?? "mono";
  } else {
    variationPanning[track] = variationPanning[track] || {};
    variationVolumes[track] = variationVolumes[track] || {};
    variationPitch[track] = variationPitch[track] || {};
    variationPitchMix[track] = variationPitchMix[track] || {};
    variationDistortionWet[track] = variationDistortionWet[track] || {};
    variationDelayMix[track] = variationDelayMix[track] || {};
    variationDelayFeedback[track] = variationDelayFeedback[track] || {};
    variationDelayTime[track] = variationDelayTime[track] || {};
    variationDelayFilterFreq[track] = variationDelayFilterFreq[track] || {};
    variationMonoPoly[track] = variationMonoPoly[track] || {};
    variationPanning[track][currentPattern] = variationPanning[track][currentPattern] ?? 0;
    variationVolumes[track][currentPattern] = variationVolumes[track][currentPattern] ?? 0.8;
    variationPitch[track][currentPattern] = variationPitch[track][currentPattern] ?? 0;
    variationPitchMix[track][currentPattern] = variationPitchMix[track][currentPattern] ?? 0;
    variationDistortionWet[track][currentPattern] = variationDistortionWet[track][currentPattern] ?? 0;
    variationDelayMix[track][currentPattern] = variationDelayMix[track][currentPattern] ?? 0;
    variationDelayFeedback[track][currentPattern] = variationDelayFeedback[track][currentPattern] ?? 0.3;
    variationDelayTime[track][currentPattern] = variationDelayTime[track][currentPattern] ?? 3;
    variationDelayFilterFreq[track][currentPattern] = variationDelayFilterFreq[track][currentPattern] ?? 5000;
    variationMonoPoly[track][currentPattern] = variationMonoPoly[track][currentPattern] ?? "mono";
  }

  const sampler = samplers[track];
  const panner = isVariation ? variationPanners[track] : mainPanners[track];
  const gain = isVariation ? variationGains[track] : mainGains[track];
  const pitchShift = isVariation ? variationPitchShifters[track] : mainPitchShifters[track];
  const distortion = isVariation ? variationDistortions[track] : mainDistortions[track];
  const delay = isVariation ? variationDelays[track] : mainDelays[track];
  const delayGain = isVariation ? variationDelayGains[track] : mainDelayGains[track];
  const filter = isVariation ? variationDelayFilters[track] : mainDelayFilters[track];

  sampler.disconnect();
  const note = notes[tracks.indexOf(track)];
  if (loadedSamples[note] && sampler.loaded) {
    sampler.connect(panner);
  }

  const panValue = Math.max(-1, Math.min(1, isVariation ? variationPanning[track][currentPattern] : mainPanning[track][currentPattern]));
  const volumeValue = Math.max(0, Math.min(1, isVariation ? variationVolumes[track][currentPattern] : mainVolumes[track][currentPattern]));
  const pitchValue = Math.max(-24, Math.min(24, isVariation ? variationPitch[track][currentPattern] : mainPitch[track][currentPattern]));
  const pitchMixValue = Math.max(0, Math.min(1, isVariation ? variationPitchMix[track][currentPattern] : mainPitchMix[track][currentPattern]));
  const distortionValue = Math.max(0, Math.min(1, isVariation ? variationDistortionWet[track][currentPattern] : mainDistortionWet[track][currentPattern]));
  const mix = Math.max(0, Math.min(1, isVariation ? variationDelayMix[track][currentPattern] : mainDelayMix[track][currentPattern]));
  const wetGainValue = mix * 0.8;
  const feedback = Math.max(0, Math.min(0.9, isVariation ? variationDelayFeedback[track][currentPattern] : mainDelayFeedback[track][currentPattern]));
  const timeIndex = Math.max(0, Math.min(15, isVariation ? variationDelayTime[track][currentPattern] : mainDelayTime[track][currentPattern]));
  const filterFreq = Math.max(100, Math.min(10000, isVariation ? variationDelayFilterFreq[track][currentPattern] : mainDelayFilterFreq[track][currentPattern]));
  const delayTimeValue = subdivisions[timeIndex]?.time || "4n";

  panner.pan.setValueAtTime(panValue !== undefined ? panValue : 0, Tone.now());
  gain.gain.setValueAtTime(volumeValue !== undefined ? volumeValue : 0.8, Tone.now());
  pitchShift.pitch = pitchValue !== undefined ? pitchValue : 0;
  pitchShift.wet.value = pitchMixValue !== undefined ? pitchMixValue : 0;
  distortion.wet.setValueAtTime(distortionValue !== undefined ? distortionValue : 0, Tone.now());
  delay.wet.setValueAtTime(mix !== undefined ? mix : 0, Tone.now());
  delayGain.gain.setValueAtTime(wetGainValue !== undefined ? wetGainValue : 0, Tone.now());
  delay.feedback.setValueAtTime(feedback !== undefined ? feedback : 0.3, Tone.now());

  try {
    delay.delayTime.setValueAtTime(delayTimeValue, Tone.now());
  } catch (e) {
    console.warn(`Failed to set delayTime for ${track}, reinitializing delay (${isVariation ? "variation" : "main"})`);
    delay.dispose();
    const newDelay = new Tone.FeedbackDelay({
      delayTime: delayTimeValue,
      feedback: feedback !== undefined ? feedback : 0.3,
      wet: 1,
      maxDelay: 2
    });

    if (isVariation) {
      variationDistortions[track].connect(newDelay);
      newDelay.connect(variationDelayFilters[track]);
      variationDelays[track] = newDelay;
    } else {
      mainDistortions[track].connect(newDelay);
      newDelay.connect(mainDelayFilters[track]);
      mainDelays[track] = newDelay;
    }
  }

  if (filter && filter.frequency) {
    filter.frequency.setValueAtTime(filterFreq !== undefined ? filterFreq : 5000, Tone.now());
  } else {
    console.warn(`Filter for ${track} (${isVariation ? "variation" : "main"}) is undefined or lacks frequency property`);
  }
}
  
