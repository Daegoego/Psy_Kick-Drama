//effects.js      
const patternBPMs = {
  A1: 120
};  

let currentPattern = "A1";
let patterns = ["A1"];
const maxPatterns = 128;
const allPatterns = [
  "A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1", "J1", "K1", "L1", "M1", "N1", "O1", "P1",
  "A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2", "I2", "J2", "K2", "L2", "M2", "N2", "O2", "P2",
  "A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3", "I3", "J3", "K3", "L3", "M3", "N3", "O3", "P3",
  "A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4", "I4", "J4", "K4", "L4", "M4", "N4", "O4", "P4",
  "A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5", "I5", "J5", "K5", "L5", "M5", "N5", "O5", "P5",
  "A6", "B6", "C6", "D6", "E6", "F6", "G6", "H6", "I6", "J6", "K6", "L6", "M6", "N6", "O6", "P6",
  "A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7", "I7", "J7", "K7", "L7", "M7", "N7", "O7", "P7",
  "A8", "B8", "C8", "D8", "E8", "F8", "G8", "H8", "I8", "J8", "K8", "L8", "M8", "N8", "O8", "P8"
];

const patternTexts = {};

const samplers = {
  kick: new Tone.Sampler({ urls: {}, voices: 8 }),
  snare: new Tone.Sampler({ urls: {}, voices: 8 }),
  hihat: new Tone.Sampler({ urls: {}, voices: 8 }),
  clap: new Tone.Sampler({ urls: {}, voices: 8 }),
  tom: new Tone.Sampler({ urls: {}, voices: 8 }),
  rimshot: new Tone.Sampler({ urls: {}, voices: 8 }),
  crash: new Tone.Sampler({ urls: {}, voices: 8 }),
  cowbell: new Tone.Sampler({ urls: {}, voices: 8 }),
  extra: new Tone.Sampler({ urls: {}, voices: 8 })
};

const sequence = {
  kick: { A1: Array(32).fill(false) },
  snare: { A1: Array(32).fill(false) },
  hihat: { A1: Array(32).fill(false) },
  clap: { A1: Array(32).fill(false) },
  tom: { A1: Array(32).fill(false) },
  rimshot: { A1: Array(32).fill(false) },
  crash: { A1: Array(32).fill(false) },
  cowbell: { A1: Array(32).fill(false) },
  extra: { A1: Array(32).fill(false) }
};

const mainSubSequences = {
  kick: { A1: Array(32).fill(false) },
  snare: { A1: Array(32).fill(false) },
  hihat: { A1: Array(32).fill(false) },
  clap: { A1: Array(32).fill(false) },
  tom: { A1: Array(32).fill(false) },
  rimshot: { A1: Array(32).fill(false) },
  crash: { A1: Array(32).fill(false) },
  cowbell: { A1: Array(32).fill(false) },
  extra: { A1: Array(32).fill(false) }
};
Object.keys(mainSubSequences).forEach(track => mainSubSequences[track].A1[0] = true);

const variationSubSequences = {
  kick: { A1: Array(32).fill(false) },
  snare: { A1: Array(32).fill(false) },
  hihat: { A1: Array(32).fill(false) },
  clap: { A1: Array(32).fill(false) },
  tom: { A1: Array(32).fill(false) },
  rimshot: { A1: Array(32).fill(false) },
  crash: { A1: Array(32).fill(false) },
  cowbell: { A1: Array(32).fill(false) },
  extra: { A1: Array(32).fill(false) }
};

const extraSamples = {
  kick: { A1: Array(32).fill(false) },
  snare: { A1: Array(32).fill(false) },
  hihat: { A1: Array(32).fill(false) },
  clap: { A1: Array(32).fill(false) },
  tom: { A1: Array(32).fill(false) },
  rimshot: { A1: Array(32).fill(false) },
  crash: { A1: Array(32).fill(false) },
  cowbell: { A1: Array(32).fill(false) },
  extra: { A1: Array(32).fill(false) }
};

const tracks = ["kick", "snare", "hihat", "clap", "tom", "rimshot", "crash", "cowbell", "extra"];
// Initialize audio nodes for each track and mode
const mainPanners = {}, variationPanners = {}, mainGains = {}, variationGains = {},
      mainDistortions = {}, variationDistortions = {}, mainDelayGains = {}, variationDelayGains = {},
      mainDelayFilters = {}, variationDelayFilters = {}, mainDelays = {}, variationDelays = {},
      mainPitchShifters = {}, variationPitchShifters = {};

const mainSubstepCounts = {
  kick: { A1: 1 },
  snare: { A1: 1 },
  hihat: { A1: 1 },
  clap: { A1: 1 },
  tom: { A1: 1 },
  rimshot: { A1: 1 },
  crash: { A1: 1 },
  cowbell: { A1: 1 },
  extra: { A1: 1 }
};
const variationSubstepCounts = {
  kick: { A1: 1 },
  snare: { A1: 1 },
  hihat: { A1: 1 },
  clap: { A1: 1 },
  tom: { A1: 1 },
  rimshot: { A1: 1 },
  crash: { A1: 1 },
  cowbell: { A1: 1 },
  extra: { A1: 1 }
};

const patternStepCounts = {
  kick: { A1: 16 },
  snare: { A1: 16 },
  hihat: { A1: 16 },
  clap: { A1: 16 },
  tom: { A1: 16 },
  rimshot: { A1: 16 },
  crash: { A1: 16 },
  cowbell: { A1: 16 },
  extra: { A1: 16 }
};  

const trackStepCounts = {
  kick: 16,
  snare: 16,
  hihat: 16,
  clap: 16,
  tom: 16,
  rimshot: 16,
  crash: 16,
  cowbell: 16,
  extra: 16
};
const trackStepLocks = {
  kick: false,
  snare: false,
  hihat: false,
  clap: false,
  tom: false,
  rimshot: false,
  crash: false,
  cowbell: false,
  extra: false
};
const trackSoloStates = {
  kick: false,
  snare: false,
  hihat: false,
  clap: false,
  tom: false,
  rimshot: false,
  crash: false,
  cowbell: false,
  extra: false
};
const trackMuteStates = {
  kick: false,
  snare: false,
  hihat: false,
  clap: false,
  tom: false,
  rimshot: false,
  crash: false,
  cowbell: false,
  extra: false
};

let isPlaying = false;
const trackStepIndices = {
  kick: 0,
  snare: 0,
  hihat: 0,
  clap: 0,
  tom: 0,
  rimshot: 0,
  crash: 0,
  cowbell: 0,
  extra: 0
};

const loadedSamples = {
  C1: null,
  D1: null,
  E1: null,
  F1: null,
  G1: null,
  A1: null,
  B1: null,
  C2: null,
  D2: null
};
const soundNames = {
  C1: "Empty 1",
  D1: "Empty 2",
  E1: "Empty 3",
  F1: "Empty 4",
  G1: "Empty 5",
  A1: "Empty 6",
  B1: "Empty 7",
  C2: "Empty 8",
  D2: "Sampler 1"
};

tracks.forEach(track => {
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
  mainDelays[track] = new Tone.FeedbackDelay({ delayTime: "4n", feedback: 0.3, wet: 0, maxDelay: 2 });
  variationDelays[track] = new Tone.FeedbackDelay({ delayTime: "4n", feedback: 0.3, wet: 0, maxDelay: 2 });
});

// Sync all delays with current BPM
Object.keys(mainDelays).forEach(track => {
  mainDelays[track].delayTime.value = "4n";
  variationDelays[track].delayTime.value = "4n";
});

// Delay settings
const mainDelayMix = {}, variationDelayMix = {}, mainDelayFeedback = {}, variationDelayFeedback = {},
      mainDelayTime = {}, variationDelayTime = {}, mainDelayFilterFreq = {}, variationDelayFilterFreq = {};

tracks.forEach(track => {
  mainDelayMix[track] = { A1: 0 };
  variationDelayMix[track] = { A1: 0 };
  mainDelayFeedback[track] = { A1: 0.3 };
  variationDelayFeedback[track] = { A1: 0.3 };
  mainDelayTime[track] = { A1: 3 };
  variationDelayTime[track] = { A1: 3 };
  mainDelayFilterFreq[track] = { A1: 5000 };
  variationDelayFilterFreq[track] = { A1: 5000 };
});

// Pitch settings
const mainPitch = {}, variationPitch = {}, mainPitchMix = {}, variationPitchMix = {};

tracks.forEach(track => {
  mainPitch[track] = { A1: 0 };
  variationPitch[track] = { A1: 0 };
  mainPitchMix[track] = { A1: 0 };
  variationPitchMix[track] = { A1: 0 };
});

// Mono/Poly settings
const mainMonoPoly = {
  kick: { A1: "mono" },
  snare: { A1: "mono" },
  hihat: { A1: "mono" },
  clap: { A1: "mono" },
  tom: { A1: "mono" },
  rimshot: { A1: "mono" },
  crash: { A1: "mono" },
  cowbell: { A1: "mono" },
  extra: { A1: "mono" }
};
const variationMonoPoly = {
  kick: { A1: "mono" },
  snare: { A1: "mono" },
  hihat: { A1: "mono" },
  clap: { A1: "mono" },
  tom: { A1: "mono" },
  rimshot: { A1: "mono" },
  crash: { A1: "mono" },
  cowbell: { A1: "mono" },
  extra: { A1: "mono" }
};

const extraMonoPoly = {
  kick: { A1: "step" },
  snare: { A1: "step" },
  hihat: { A1: "step" },
  clap: { A1: "step" },
  tom: { A1: "step" },
  rimshot: { A1: "step" },
  crash: { A1: "step" },
  cowbell: { A1: "step" },
  extra: { A1: "step" }
};

// Panning values
const mainPanning = {
  kick: { A1: 0 },
  snare: { A1: 0 },
  hihat: { A1: 0 },
  clap: { A1: 0 },
  tom: { A1: 0 },
  rimshot: { A1: 0 },
  crash: { A1: 0 },
  cowbell: { A1: 0 },
  extra: { A1: 0 }
};
const variationPanning = {
  kick: { A1: 0 },
  snare: { A1: 0 },
  hihat: { A1: 0 },
  clap: { A1: 0 },
  tom: { A1: 0 },
  rimshot: { A1: 0 },
  crash: { A1: 0 },
  cowbell: { A1: 0 },
  extra: { A1: 0 }
};

// Volume values
const mainVolumes = {
  kick: { A1: 0.8 },
  snare: { A1: 0.8 },
  hihat: { A1: 0.8 },
  clap: { A1: 0.8 },
  tom: { A1: 0.8 },
  rimshot: { A1: 0.8 },
  crash: { A1: 0.8 },
  cowbell: { A1: 0.8 },
  extra: { A1: 0.8 }
};
const variationVolumes = {
  kick: { A1: 0.8 },
  snare: { A1: 0.8 },
  hihat: { A1: 0.8 },
  clap: { A1: 0.8 },
  tom: { A1: 0.8 },
  rimshot: { A1: 0.8 },
  crash: { A1: 0.8 },
  cowbell: { A1: 0.8 },
  extra: { A1: 0.8 }
};

// Distortion wet values
const mainDistortionWet = {
  kick: { A1: 0 },
  snare: { A1: 0 },
  hihat: { A1: 0 },
  clap: { A1: 0 },
  tom: { A1: 0 },
  rimshot: { A1: 0 },
  crash: { A1: 0 },
  cowbell: { A1: 0 },
  extra: { A1: 0 }
};
const variationDistortionWet = {
  kick: { A1: 0 },
  snare: { A1: 0 },
  hihat: { A1: 0 },
  clap: { A1: 0 },
  tom: { A1: 0 },
  rimshot: { A1: 0 },
  crash: { A1: 0 },
  cowbell: { A1: 0 },
  extra: { A1: 0 }
};

const extraStepSamples = {
  kick: { A1: Array(32).fill(null) },
  snare: { A1: Array(32).fill(null) },
  hihat: { A1: Array(32).fill(null) },
  clap: { A1: Array(32).fill(null) },
  tom: { A1: Array(32).fill(null) },
  rimshot: { A1: Array(32).fill(null) },
  crash: { A1: Array(32).fill(null) },
  cowbell: { A1: Array(32).fill(null) },
  extra: { A1: Array(32).fill(null) }
};
const extraPanning = {
  kick: { A1: Array(32).fill(0) },
  snare: { A1: Array(32).fill(0) },
  hihat: { A1: Array(32).fill(0) },
  clap: { A1: Array(32).fill(0) },
  tom: { A1: Array(32).fill(0) },
  rimshot: { A1: Array(32).fill(0) },
  crash: { A1: Array(32).fill(0) },
  cowbell: { A1: Array(32).fill(0) },
  extra: { A1: Array(32).fill(0) }
};  
const extraVolumes = {
  kick: { A1: Array(32).fill(0.8) },
  snare: { A1: Array(32).fill(0.8) },
  hihat: { A1: Array(32).fill(0.8) },
  clap: { A1: Array(32).fill(0.8) },
  tom: { A1: Array(32).fill(0.8) },
  rimshot: { A1: Array(32).fill(0.8) },
  crash: { A1: Array(32).fill(0.8) },
  cowbell: { A1: Array(32).fill(0.8) },
  extra: { A1: Array(32).fill(0.8) }
};
const extraPitch = {
  kick: { A1: Array(32).fill(0) },
  snare: { A1: Array(32).fill(0) },
  hihat: { A1: Array(32).fill(0) },
  clap: { A1: Array(32).fill(0) },
  tom: { A1: Array(32).fill(0) },
  rimshot: { A1: Array(32).fill(0) },
  crash: { A1: Array(32).fill(0) },
  cowbell: { A1: Array(32).fill(0) },
  extra: { A1: Array(32).fill(0) }
};
const extraPitchMix = {
  kick: { A1: Array(32).fill(1) },
  snare: { A1: Array(32).fill(1) },
  hihat: { A1: Array(32).fill(1) },
  clap: { A1: Array(32).fill(1) },
  tom: { A1: Array(32).fill(1) },
  rimshot: { A1: Array(32).fill(1) },
  crash: { A1: Array(32).fill(1) },
  cowbell: { A1: Array(32).fill(1) },
  extra: { A1: Array(32).fill(1) }
};
const extraDistortionWet = {
  kick: { A1: Array(32).fill(0) },
  snare: { A1: Array(32).fill(0) },
  hihat: { A1: Array(32).fill(0) },
  clap: { A1: Array(32).fill(0) },
  tom: { A1: Array(32).fill(0) },
  rimshot: { A1: Array(32).fill(0) },
  crash: { A1: Array(32).fill(0) },
  cowbell: { A1: Array(32).fill(0) },
  extra: { A1: Array(32).fill(0) }
};  
const extraStepSamplers = {
  kick: { A1: Array(32).fill(null) },
  snare: { A1: Array(32).fill(null) },
  hihat: { A1: Array(32).fill(null) },
  clap: { A1: Array(32).fill(null) },
  tom: { A1: Array(32).fill(null) },
  rimshot: { A1: Array(32).fill(null) },
  crash: { A1: Array(32).fill(null) },
  cowbell: { A1: Array(32).fill(null) },
  extra: { A1: Array(32).fill(null) }
};
const extraDelayMix = {
  kick: { A1: Array(32).fill(0) },
  snare: { A1: Array(32).fill(0) },
  hihat: { A1: Array(32).fill(0) },
  clap: { A1: Array(32).fill(0) },
  tom: { A1: Array(32).fill(0) },
  rimshot: { A1: Array(32).fill(0) },
  crash: { A1: Array(32).fill(0) },
  cowbell: { A1: Array(32).fill(0) },
  extra: { A1: Array(32).fill(0) }
};
const extraDelayFeedback = {
  kick: { A1: Array(32).fill(0.3) },
  snare: { A1: Array(32).fill(0.3) },
  hihat: { A1: Array(32).fill(0.3) },
  clap: { A1: Array(32).fill(0.3) },
  tom: { A1: Array(32).fill(0.3) },
  rimshot: { A1: Array(32).fill(0.3) },
  crash: { A1: Array(32).fill(0.3) },
  cowbell: { A1: Array(32).fill(0.3) },
  extra: { A1: Array(32).fill(0.3) }
};
const extraDelayTime = {
  kick: { A1: Array(32).fill(3) },
  snare: { A1: Array(32).fill(3) },
  hihat: { A1: Array(32).fill(3) },
  clap: { A1: Array(32).fill(3) },
  tom: { A1: Array(32).fill(3) },
  rimshot: { A1: Array(32).fill(3) },
  crash: { A1: Array(32).fill(3) },
  cowbell: { A1: Array(32).fill(3) },
  extra: { A1: Array(32).fill(3) }
};
const extraDelayFilterFreq = {
  kick: { A1: Array(32).fill(5000) },
  snare: { A1: Array(32).fill(5000) },
  hihat: { A1: Array(32).fill(5000) },
  clap: { A1: Array(32).fill(5000) },
  tom: { A1: Array(32).fill(5000) },
  rimshot: { A1: Array(32).fill(5000) },
  crash: { A1: Array(32).fill(5000) },
  cowbell: { A1: Array(32).fill(5000) },
  extra: { A1: Array(32).fill(5000) }
};

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
  delay.wet.setValueAtTime(1, Tone.now());
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
    
function toggleSavePad(pad) {
  const saveAllPad = document.querySelector('.saveAllPad');
  const saveSelPad = document.querySelector('.saveSelPad');
  if (pad === 'saveAllPad' && saveAllPad.dataset.state === 'off') {
    saveAllPad.dataset.state = 'on';
    saveSelPad.dataset.state = 'off';
  } else if (pad === 'saveSelPad' && saveSelPad.dataset.state === 'off') {
    saveSelPad.dataset.state = 'on';
    saveAllPad.dataset.state = 'off';
  }
}   
    
function toggleTrackPad(track) {
  const pad = document.querySelector(`.track-toggle[data-track="${track}"]`);
  const newState = pad.dataset.state === "on" ? "off" : "on";
  pad.dataset.state = newState;
  pad.classList.toggle("active", newState === "on");
}    