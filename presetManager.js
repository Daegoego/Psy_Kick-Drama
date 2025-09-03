//presetManager.js
const savePreset = (state) => {
  try {
    const preset = {
      sequence: state.sequence,
      soundNames: state.soundNames,
      trackStepCounts: state.trackStepCounts,
      trackStepLocks: state.trackStepLocks,
      trackSoloStates: state.trackSoloStates,
      trackMuteStates: state.trackMuteStates,
      mainSubSequences: state.mainSubSequences,
      variationSubSequences: state.variationSubSequences,
      mainSubstepCounts: state.mainSubstepCounts,
      variationSubstepCounts: state.variationSubstepCounts,
      mainPanning: state.mainPanning,
      variationPanning: state.variationPanning,
      mainVolumes: state.mainVolumes,
      variationVolumes: state.variationVolumes,
      mainDistortionWet: state.mainDistortionWet,
      variationDistortionWet: state.variationDistortionWet,
      mainMonoPoly: state.mainMonoPoly,
      variationMonoPoly: state.variationMonoPoly,
      mainDelayMix: state.mainDelayMix,
      variationDelayMix: state.variationDelayMix,
      mainDelayFeedback: state.mainDelayFeedback,
      variationDelayFeedback: state.variationDelayFeedback,
      mainDelayTime: state.mainDelayTime,
      variationDelayTime: state.variationDelayTime,
      mainDelayFilterFreq: state.mainDelayFilterFreq,
      variationDelayFilterFreq: state.variationDelayFilterFreq,
      patterns: state.patterns,
      currentPattern: state.currentPattern,
      measures: state.measures,
      clickActive: state.clickActive,
      globalStepIndex: state.globalStepIndex
    };
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Psy_Kick_Drama_Preset_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log("Preset saved as JSON");
  } catch (error) {
    console.error("Error saving preset:", error);
    alert("Failed to save preset. Check the console for details.");
  }
};

function copyPatternData(fromPattern, toPattern) {
  patternBPMs[toPattern] = patternBPMs[fromPattern] || 120;
  patternMeasures[toPattern] = patternMeasures[fromPattern] || 4;
  patternTexts[toPattern] = patternTexts[fromPattern] || '';
  tracks.forEach(track => {
    sequence[track][toPattern] = [...(sequence[track][fromPattern] || Array(32).fill(false))];
    patternStepCounts[track][toPattern] = patternStepCounts[track][fromPattern] || 16;
    mainSubSequences[track][toPattern] = [...(mainSubSequences[track][fromPattern] || Array(16).fill(false))];
    variationSubSequences[track][toPattern] = [...(variationSubSequences[track][fromPattern] || Array(16).fill(false))];
    mainSubstepCounts[track][toPattern] = mainSubstepCounts[track][fromPattern] || 1;
    variationSubstepCounts[track][toPattern] = variationSubstepCounts[track][fromPattern] || 1;
    mainPanning[track][toPattern] = mainPanning[track][fromPattern] || 0;
    variationPanning[track][toPattern] = variationPanning[track][fromPattern] || 0;
    mainVolumes[track][toPattern] = mainVolumes[track][fromPattern] || 0.8;
    variationVolumes[track][toPattern] = variationVolumes[track][fromPattern] || 0.8;
    mainDistortionWet[track][toPattern] = mainDistortionWet[track][fromPattern] || 0;
    variationDistortionWet[track][toPattern] = variationDistortionWet[track][fromPattern] || 0;
    mainDelayMix[track][toPattern] = mainDelayMix[track][fromPattern] || 0;
    variationDelayMix[track][toPattern] = variationDelayMix[track][fromPattern] || 0;
    mainDelayFeedback[track][toPattern] = mainDelayFeedback[track][fromPattern] || 0.3;
    variationDelayFeedback[track][toPattern] = variationDelayFeedback[track][fromPattern] || 0.3;
    mainDelayTime[track][toPattern] = mainDelayTime[track][fromPattern] || 3;
    variationDelayTime[track][toPattern] = variationDelayTime[track][fromPattern] || 3;
    mainDelayFilterFreq[track][toPattern] = mainDelayFilterFreq[track][fromPattern] || 5000;
    variationDelayFilterFreq[track][toPattern] = variationDelayFilterFreq[track][fromPattern] || 5000;
    mainMonoPoly[track][toPattern] = mainMonoPoly[track][fromPattern] ?? true;
    variationMonoPoly[track][toPattern] = variationMonoPoly[track][fromPattern] ?? true;
    mainPitch[track][toPattern] = mainPitch[track][fromPattern] || 0;
    variationPitch[track][toPattern] = variationPitch[track][fromPattern] || 0;
    mainPitchMix[track][toPattern] = mainPitchMix[track][fromPattern] || 0;
    variationPitchMix[track][toPattern] = variationPitchMix[track][fromPattern] || 0;
    if (track === "extra") {
      extraStepSamples[track][toPattern] = [...(extraStepSamples[track][fromPattern] || Array(32).fill(null))];
      extraPanning[track][toPattern] = [...(extraPanning[track][fromPattern] || Array(32).fill(0))];
      extraVolumes[track][toPattern] = [...(extraVolumes[track][fromPattern] || Array(32).fill(0.8))];
      extraPitch[track][toPattern] = [...(extraPitch[track][fromPattern] || Array(32).fill(0))];
      extraPitchMix[track][toPattern] = [...(extraPitchMix[track][fromPattern] || Array(32).fill(1))];
      extraDistortionWet[track][toPattern] = [...(extraDistortionWet[track][fromPattern] || Array(32).fill(0))];
      extraDelayMix[track][toPattern] = [...(extraDelayMix[track][fromPattern] || Array(32).fill(0))];
      extraDelayFeedback[track][toPattern] = [...(extraDelayFeedback[track][fromPattern] || Array(32).fill(0.3))];
      extraDelayTime[track][toPattern] = [...(extraDelayTime[track][fromPattern] || Array(32).fill(3))];
      extraDelayFilterFreq[track][toPattern] = [...(extraDelayFilterFreq[track][fromPattern] || Array(32).fill(5000))];
      extraStepSamplers[track][toPattern] = [...(extraStepSamplers[track][fromPattern] || Array(32).fill(null))];
    }
  });
}
const loadPreset = async (preset, state) => {
  try {
    if (!preset || typeof preset !== "object") {
      throw new Error("Invalid preset data");
    }
    const {
      samplers, loadedSamples, soundNames, tracks, notes, sequence,
      trackStepCounts, trackStepLocks, trackSoloStates, trackMuteStates,
      mainSubSequences, variationSubSequences, mainSubstepCounts,
      variationSubstepCounts, mainPanning, variationPanning, mainVolumes,
      variationVolumes, mainDistortionWet, variationDistortionWet,
      mainMonoPoly, variationMonoPoly, mainPanners, variationPanners,
      mainGains, variationGains, mainDistortions, variationDistortions,
      mainDelays, variationDelays, mainDelayFilters, variationDelayFilters,
      mainDelayGains, variationDelayGains, mainDelayMix, variationDelayMix,
      mainDelayFeedback, variationDelayFeedback, mainDelayTime, variationDelayTime,
      mainDelayFilterFreq, variationDelayFilterFreq, selectedSound,
      isVariationSubsequencer, measures, clickActive, globalStepIndex,
      isPlaying, toggleSequencer, updateTrackSteps, updateSubSteps,
      updateSoundSettingsUI, updateClickUI, updateTrackUI,
      refreshPannerConnections, subsequencerToggles, clickMeasuresInput,
      extraStepSamples, extraPanning, extraVolumes, extraPitch, extraPitchMix,
      extraDistortionWet, extraDelayMix, extraDelayFeedback, extraDelayTime,
      extraDelayFilterFreq, extraStepSamplers, extraMonoPoly
    } = state;

    // Stop sequencer if playing
    if (isPlaying) {
      await toggleSequencer();
    }

    // Update patterns with validation
    window.patterns = preset.patterns && Array.isArray(preset.patterns) ? preset.patterns : ["A1"];
    window.currentPattern = preset.currentPattern && typeof preset.currentPattern === "string" ? preset.currentPattern : "A1";
    updatePatternDisplay();
    updatePatternsList();

    // Ensure preset.sequence and other structures exist for all tracks
    preset.sequence = preset.sequence && typeof preset.sequence === "object" ? preset.sequence : {};
    preset.mainSubSequences = preset.mainSubSequences && typeof preset.mainSubSequences === "object" ? preset.mainSubSequences : {};
    preset.variationSubSequences = preset.variationSubSequences && typeof preset.variationSubSequences === "object" ? preset.variationSubSequences : {};
    preset.mainSubstepCounts = preset.mainSubstepCounts && typeof preset.mainSubstepCounts === "object" ? preset.mainSubstepCounts : {};
    preset.variationSubstepCounts = preset.variationSubstepCounts && typeof preset.variationSubstepCounts === "object" ? preset.variationSubstepCounts : {};
    preset.mainPanning = preset.mainPanning && typeof preset.mainPanning === "object" ? preset.mainPanning : {};
    preset.variationPanning = preset.variationPanning && typeof preset.variationPanning === "object" ? preset.variationPanning : {};
    preset.mainVolumes = preset.mainVolumes && typeof preset.mainVolumes === "object" ? preset.mainVolumes : {};
    preset.variationVolumes = preset.variationVolumes && typeof preset.variationVolumes === "object" ? preset.variationVolumes : {};
    preset.mainDistortionWet = preset.mainDistortionWet && typeof preset.mainDistortionWet === "object" ? preset.mainDistortionWet : {};
    preset.variationDistortionWet = preset.variationDistortionWet && typeof preset.variationDistortionWet === "object" ? preset.variationDistortionWet : {};
    preset.mainMonoPoly = preset.mainMonoPoly && typeof preset.mainMonoPoly === "object" ? preset.mainMonoPoly : {};
    preset.variationMonoPoly = preset.variationMonoPoly && typeof preset.variationMonoPoly === "object" ? preset.variationMonoPoly : {};
    preset.mainDelayMix = preset.mainDelayMix && typeof preset.mainDelayMix === "object" ? preset.mainDelayMix : {};
    preset.variationDelayMix = preset.variationDelayMix && typeof preset.variationDelayMix === "object" ? preset.variationDelayMix : {};
    preset.mainDelayFeedback = preset.mainDelayFeedback && typeof preset.mainDelayFeedback === "object" ? preset.mainDelayFeedback : {};
    preset.variationDelayFeedback = preset.variationDelayFeedback && typeof preset.variationDelayFeedback === "object" ? preset.variationDelayFeedback : {};
    preset.mainDelayTime = preset.mainDelayTime && typeof preset.mainDelayTime === "object" ? preset.mainDelayTime : {};
    preset.variationDelayTime = preset.variationDelayTime && typeof preset.variationDelayTime === "object" ? preset.variationDelayTime : {};
    preset.mainDelayFilterFreq = preset.mainDelayFilterFreq && typeof preset.mainDelayFilterFreq === "object" ? preset.mainDelayFilterFreq : {};
    preset.variationDelayFilterFreq = preset.variationDelayFilterFreq && typeof preset.variationDelayFilterFreq === "object" ? preset.variationDelayFilterFreq : {};
    preset.mainPitch = preset.mainPitch && typeof preset.mainPitch === "object" ? preset.mainPitch : {};
    preset.variationPitch = preset.variationPitch && typeof preset.variationPitch === "object" ? preset.variationPitch : {};
    preset.mainPitchMix = preset.mainPitchMix && typeof preset.mainPitchMix === "object" ? preset.mainPitchMix : {};
    preset.variationPitchMix = preset.variationPitchMix && typeof preset.variationPitchMix === "object" ? preset.variationPitchMix : {};
    preset.extraStepSamples = preset.extraStepSamples && typeof preset.extraStepSamples === "object" ? preset.extraStepSamples : {};
    preset.extraPanning = preset.extraPanning && typeof preset.extraPanning === "object" ? preset.extraPanning : {};
    preset.extraVolumes = preset.extraVolumes && typeof preset.extraVolumes === "object" ? preset.extraVolumes : {};
    preset.extraPitch = preset.extraPitch && typeof preset.extraPitch === "object" ? preset.extraPitch : {};
    preset.extraPitchMix = preset.extraPitchMix && typeof preset.extraPitchMix === "object" ? preset.extraPitchMix : {};
    preset.extraDistortionWet = preset.extraDistortionWet && typeof preset.extraDistortionWet === "object" ? preset.extraDistortionWet : {};
    preset.extraDelayMix = preset.extraDelayMix && typeof preset.extraDelayMix === "object" ? preset.extraDelayMix : {};
    preset.extraDelayFeedback = preset.extraDelayFeedback && typeof preset.extraDelayFeedback === "object" ? preset.extraDelayFeedback : {};
    preset.extraDelayTime = preset.extraDelayTime && typeof preset.extraDelayTime === "object" ? preset.extraDelayTime : {};
    preset.extraDelayFilterFreq = preset.extraDelayFilterFreq && typeof preset.extraDelayFilterFreq === "object" ? preset.extraDelayFilterFreq : {};
    preset.extraStepSamplers = preset.extraStepSamplers && typeof preset.extraStepSamplers === "object" ? preset.extraStepSamplers : {};
    preset.extraMonoPoly = preset.extraMonoPoly && typeof preset.extraMonoPoly === "object" ? preset.extraMonoPoly : {};

    // Initialize data structures for all tracks and patterns
    tracks.forEach(track => {
      sequence[track] = sequence[track] || {};
      mainSubSequences[track] = mainSubSequences[track] || {};
      variationSubSequences[track] = variationSubSequences[track] || {};
      mainSubstepCounts[track] = mainSubstepCounts[track] || {};
      variationSubstepCounts[track] = variationSubstepCounts[track] || {};
      mainPanning[track] = mainPanning[track] || {};
      variationPanning[track] = variationPanning[track] || {};
      mainVolumes[track] = mainVolumes[track] || {};
      variationVolumes[track] = variationVolumes[track] || {};
      mainDistortionWet[track] = mainDistortionWet[track] || {};
      variationDistortionWet[track] = variationDistortionWet[track] || {};
      mainMonoPoly[track] = mainMonoPoly[track] || {};
      variationMonoPoly[track] = variationMonoPoly[track] || {};
      mainDelayMix[track] = mainDelayMix[track] || {};
      variationDelayMix[track] = variationDelayMix[track] || {};
      mainDelayFeedback[track] = mainDelayFeedback[track] || {};
      variationDelayFeedback[track] = variationDelayFeedback[track] || {};
      mainDelayTime[track] = mainDelayTime[track] || {};
      variationDelayTime[track] = variationDelayTime[track] || {};
      mainDelayFilterFreq[track] = mainDelayFilterFreq[track] || {};
      variationDelayFilterFreq[track] = variationDelayFilterFreq[track] || {};
      mainPitch[track] = mainPitch[track] || {};
      variationPitch[track] = variationPitch[track] || {};
      mainPitchMix[track] = mainPitchMix[track] || {};
      variationPitchMix[track] = variationPitchMix[track] || {};
      extraStepSamples[track] = extraStepSamples[track] || {};
      extraPanning[track] = extraPanning[track] || {};
      extraVolumes[track] = extraVolumes[track] || {};
      extraPitch[track] = extraPitch[track] || {};
      extraPitchMix[track] = extraPitchMix[track] || {};
      extraDistortionWet[track] = extraDistortionWet[track] || {};
      extraDelayMix[track] = extraDelayMix[track] || {};
      extraDelayFeedback[track] = extraDelayFeedback[track] || {};
      extraDelayTime[track] = extraDelayTime[track] || {};
      extraDelayFilterFreq[track] = extraDelayFilterFreq[track] || {};
      extraStepSamplers[track] = extraStepSamplers[track] || {};
      extraMonoPoly[track] = extraMonoPoly[track] || {};
    });

    // Initialize all patterns in the preset
    (preset.patterns && Array.isArray(preset.patterns) ? preset.patterns : ["A1"]).forEach(pattern => {
      tracks.forEach(track => {
        preset.sequence[track] = preset.sequence[track] || {};
        preset.mainSubSequences[track] = preset.mainSubSequences[track] || {};
        preset.variationSubSequences[track] = preset.variationSubSequences[track] || {};
        preset.mainSubstepCounts[track] = preset.mainSubstepCounts[track] || {};
        preset.variationSubstepCounts[track] = preset.variationSubstepCounts[track] || {};
        preset.mainPanning[track] = preset.mainPanning[track] || {};
        preset.variationPanning[track] = preset.variationPanning[track] || {};
        preset.mainVolumes[track] = preset.mainVolumes[track] || {};
        preset.variationVolumes[track] = preset.variationVolumes[track] || {};
        preset.mainDistortionWet[track] = preset.mainDistortionWet[track] || {};
        preset.variationDistortionWet[track] = preset.variationDistortionWet[track] || {};
        preset.mainMonoPoly[track] = preset.mainMonoPoly[track] || {};
        preset.variationMonoPoly[track] = preset.variationMonoPoly[track] || {};
        preset.mainDelayMix[track] = preset.mainDelayMix[track] || {};
        preset.variationDelayMix[track] = preset.variationDelayMix[track] || {};
        preset.mainDelayFeedback[track] = preset.mainDelayFeedback[track] || {};
        preset.variationDelayFeedback[track] = preset.variationDelayFeedback[track] || {};
        preset.mainDelayTime[track] = preset.mainDelayTime[track] || {};
        preset.variationDelayTime[track] = preset.variationDelayTime[track] || {};
        preset.mainDelayFilterFreq[track] = preset.mainDelayFilterFreq[track] || {};
        preset.variationDelayFilterFreq[track] = preset.variationDelayFilterFreq[track] || {};
        preset.mainPitch[track] = preset.mainPitch[track] || {};
        preset.variationPitch[track] = preset.variationPitch[track] || {};
        preset.mainPitchMix[track] = preset.mainPitchMix[track] || {};
        preset.variationPitchMix[track] = preset.variationPitchMix[track] || {};
        preset.extraStepSamples[track] = preset.extraStepSamples[track] || {};
        preset.extraPanning[track] = preset.extraPanning[track] || {};
        preset.extraVolumes[track] = preset.extraVolumes[track] || {};
        preset.extraPitch[track] = preset.extraPitch[track] || {};
        preset.extraPitchMix[track] = preset.extraPitchMix[track] || {};
        preset.extraDistortionWet[track] = preset.extraDistortionWet[track] || {};
        preset.extraDelayMix[track] = preset.extraDelayMix[track] || {};
        preset.extraDelayFeedback[track] = preset.extraDelayFeedback[track] || {};
        preset.extraDelayTime[track] = preset.extraDelayTime[track] || {};
        preset.extraDelayFilterFreq[track] = preset.extraDelayFilterFreq[track] || {};
        preset.extraStepSamplers[track] = preset.extraStepSamplers[track] || {};
        preset.extraMonoPoly[track] = preset.extraMonoPoly[track] || {};

        sequence[track][pattern] = preset.sequence[track][pattern] && Array.isArray(preset.sequence[track][pattern]) ? preset.sequence[track][pattern] : Array(32).fill(false);
        mainSubSequences[track][pattern] = preset.mainSubSequences[track][pattern] && Array.isArray(preset.mainSubSequences[track][pattern]) ? preset.mainSubSequences[track][pattern] : Array(16).fill(false).fill(true, 0, 1);
        variationSubSequences[track][pattern] = preset.variationSubSequences[track][pattern] && Array.isArray(preset.variationSubSequences[track][pattern]) ? preset.variationSubSequences[track][pattern] : Array(16).fill(false).fill(true, 0, 1);
        mainSubstepCounts[track][pattern] = preset.mainSubstepCounts[track][pattern] || 1;
        variationSubstepCounts[track][pattern] = preset.variationSubstepCounts[track][pattern] || 1;
        mainPanning[track][pattern] = preset.mainPanning[track][pattern] || 0;
        variationPanning[track][pattern] = preset.variationPanning[track][pattern] || 0;
        mainVolumes[track][pattern] = preset.mainVolumes[track][pattern] || 0.8;
        variationVolumes[track][pattern] = preset.variationVolumes[track][pattern] || 0.8;
        mainDistortionWet[track][pattern] = preset.mainDistortionWet[track][pattern] || 0;
        variationDistortionWet[track][pattern] = preset.variationDistortionWet[track][pattern] || 0;
        mainMonoPoly[track][pattern] = preset.mainMonoPoly[track][pattern] || "mono";
        variationMonoPoly[track][pattern] = preset.variationMonoPoly[track][pattern] || "mono";
        mainDelayMix[track][pattern] = preset.mainDelayMix[track][pattern] || 0;
        variationDelayMix[track][pattern] = preset.variationDelayMix[track][pattern] || 0;
        mainDelayFeedback[track][pattern] = preset.mainDelayFeedback[track][pattern] || 0.3;
        variationDelayFeedback[track][pattern] = preset.variationDelayFeedback[track][pattern] || 0.3;
        mainDelayTime[track][pattern] = preset.mainDelayTime[track][pattern] || 3;
        variationDelayTime[track][pattern] = preset.variationDelayTime[track][pattern] || 3;
        mainDelayFilterFreq[track][pattern] = preset.mainDelayFilterFreq[track][pattern] || 5000;
        variationDelayFilterFreq[track][pattern] = preset.variationDelayFilterFreq[track][pattern] || 5000;
        mainPitch[track][pattern] = preset.mainPitch[track][pattern] || 0;
        variationPitch[track][pattern] = preset.variationPitch[track][pattern] || 0;
        mainPitchMix[track][pattern] = preset.mainPitchMix[track][pattern] || 0;
        variationPitchMix[track][pattern] = preset.variationPitchMix[track][pattern] || 0;
        extraStepSamples[track][pattern] = preset.extraStepSamples[track][pattern] && Array.isArray(preset.extraStepSamples[track][pattern]) ? preset.extraStepSamples[track][pattern] : Array(32).fill(null);
        extraPanning[track][pattern] = preset.extraPanning[track][pattern] && Array.isArray(preset.extraPanning[track][pattern]) ? preset.extraPanning[track][pattern] : Array(32).fill(0);
        extraVolumes[track][pattern] = preset.extraVolumes[track][pattern] && Array.isArray(preset.extraVolumes[track][pattern]) ? preset.extraVolumes[track][pattern] : Array(32).fill(0.8);
        extraPitch[track][pattern] = preset.extraPitch[track][pattern] && Array.isArray(preset.extraPitch[track][pattern]) ? preset.extraPitch[track][pattern] : Array(32).fill(0);
        extraPitchMix[track][pattern] = preset.extraPitchMix[track][pattern] && Array.isArray(preset.extraPitchMix[track][pattern]) ? preset.extraPitchMix[track][pattern] : Array(32).fill(1);
        extraDistortionWet[track][pattern] = preset.extraDistortionWet[track][pattern] && Array.isArray(preset.extraDistortionWet[track][pattern]) ? preset.extraDistortionWet[track][pattern] : Array(32).fill(0);
        extraDelayMix[track][pattern] = preset.extraDelayMix[track][pattern] && Array.isArray(preset.extraDelayMix[track][pattern]) ? preset.extraDelayMix[track][pattern] : Array(32).fill(0);
        extraDelayFeedback[track][pattern] = preset.extraDelayFeedback[track][pattern] && Array.isArray(preset.extraDelayFeedback[track][pattern]) ? preset.extraDelayFeedback[track][pattern] : Array(32).fill(0.3);
        extraDelayTime[track][pattern] = preset.extraDelayTime[track][pattern] && Array.isArray(preset.extraDelayTime[track][pattern]) ? preset.extraDelayTime[track][pattern] : Array(32).fill(3);
        extraDelayFilterFreq[track][pattern] = preset.extraDelayFilterFreq[track][pattern] && Array.isArray(preset.extraDelayFilterFreq[track][pattern]) ? preset.extraDelayFilterFreq[track][pattern] : Array(32).fill(5000);
        extraStepSamplers[track][pattern] = preset.extraStepSamplers[track][pattern] && Array.isArray(preset.extraStepSamplers[track][pattern]) ? preset.extraStepSamplers[track][pattern] : Array(32).fill(null);
        extraMonoPoly[track][pattern] = preset.extraMonoPoly[track][pattern] || "step";
      });
    });

    // Update sequence and settings for current pattern
    tracks.forEach(track => {
      preset.sequence[track] = preset.sequence[track] || {};
      preset.mainSubSequences[track] = preset.mainSubSequences[track] || {};
      preset.variationSubSequences[track] = preset.variationSubSequences[track] || {};
      preset.mainSubstepCounts[track] = preset.mainSubstepCounts[track] || {};
      preset.variationSubstepCounts[track] = preset.variationSubstepCounts[track] || {};
      preset.mainPanning[track] = preset.mainPanning[track] || {};
      preset.variationPanning[track] = preset.variationPanning[track] || {};
      preset.mainVolumes[track] = preset.mainVolumes[track] || {};
      preset.variationVolumes[track] = preset.variationVolumes[track] || {};
      preset.mainDistortionWet[track] = preset.mainDistortionWet[track] || {};
      preset.variationDistortionWet[track] = preset.variationDistortionWet[track] || {};
      preset.mainMonoPoly[track] = preset.mainMonoPoly[track] || {};
      preset.variationMonoPoly[track] = preset.variationMonoPoly[track] || {};
      preset.mainDelayMix[track] = preset.mainDelayMix[track] || {};
      preset.variationDelayMix[track] = preset.variationDelayMix[track] || {};
      preset.mainDelayFeedback[track] = preset.mainDelayFeedback[track] || {};
      preset.variationDelayFeedback[track] = preset.variationDelayFeedback[track] || {};
      preset.mainDelayTime[track] = preset.mainDelayTime[track] || {};
      preset.variationDelayTime[track] = preset.variationDelayTime[track] || {};
      preset.mainDelayFilterFreq[track] = preset.mainDelayFilterFreq[track] || {};
      preset.variationDelayFilterFreq[track] = preset.variationDelayFilterFreq[track] || {};
      preset.mainPitch[track] = preset.mainPitch[track] || {};
      preset.variationPitch[track] = preset.variationPitch[track] || {};
      preset.mainPitchMix[track] = preset.mainPitchMix[track] || {};
      preset.variationPitchMix[track] = preset.variationPitchMix[track] || {};
      preset.extraStepSamples[track] = preset.extraStepSamples[track] || {};
      preset.extraPanning[track] = preset.extraPanning[track] || {};
      preset.extraVolumes[track] = preset.extraVolumes[track] || {};
      preset.extraPitch[track] = preset.extraPitch[track] || {};
      preset.extraPitchMix[track] = preset.extraPitchMix[track] || {};
      preset.extraDistortionWet[track] = preset.extraDistortionWet[track] || {};
      preset.extraDelayMix[track] = preset.extraDelayMix[track] || {};
      preset.extraDelayFeedback[track] = preset.extraDelayFeedback[track] || {};
      preset.extraDelayTime[track] = preset.extraDelayTime[track] || {};
      preset.extraDelayFilterFreq[track] = preset.extraDelayFilterFreq[track] || {};
      preset.extraStepSamplers[track] = preset.extraStepSamplers[track] || {};
      preset.extraMonoPoly[track] = preset.extraMonoPoly[track] || {};

      sequence[track][window.currentPattern] = preset.sequence[track][window.currentPattern] && Array.isArray(preset.sequence[track][window.currentPattern]) ? preset.sequence[track][window.currentPattern] : Array(32).fill(false);
      mainSubSequences[track][window.currentPattern] = preset.mainSubSequences[track][window.currentPattern] && Array.isArray(preset.mainSubSequences[track][window.currentPattern]) ? preset.mainSubSequences[track][window.currentPattern] : Array(16).fill(false).fill(true, 0, 1);
      variationSubSequences[track][window.currentPattern] = preset.variationSubSequences[track][window.currentPattern] && Array.isArray(preset.variationSubSequences[track][window.currentPattern]) ? preset.variationSubSequences[track][window.currentPattern] : Array(16).fill(false).fill(true, 0, 1);
      mainSubstepCounts[track][window.currentPattern] = preset.mainSubstepCounts[track][window.currentPattern] || 1;
      variationSubstepCounts[track][window.currentPattern] = preset.variationSubstepCounts[track][window.currentPattern] || 1;
      mainPanning[track][window.currentPattern] = preset.mainPanning[track][window.currentPattern] || 0;
      variationPanning[track][window.currentPattern] = preset.variationPanning[track][window.currentPattern] || 0;
      mainVolumes[track][window.currentPattern] = preset.mainVolumes[track][window.currentPattern] || 0.8;
      variationVolumes[track][window.currentPattern] = preset.variationVolumes[track][window.currentPattern] || 0.8;
      mainDistortionWet[track][window.currentPattern] = preset.mainDistortionWet[track][window.currentPattern] || 0;
      variationDistortionWet[track][window.currentPattern] = preset.variationDistortionWet[track][window.currentPattern] || 0;
      mainMonoPoly[track][window.currentPattern] = preset.mainMonoPoly[track][window.currentPattern] || "mono";
      variationMonoPoly[track][window.currentPattern] = preset.variationMonoPoly[track][window.currentPattern] || "mono";
      mainDelayMix[track][window.currentPattern] = preset.mainDelayMix[track][window.currentPattern] || 0;
      variationDelayMix[track][window.currentPattern] = preset.variationDelayMix[track][window.currentPattern] || 0;
      mainDelayFeedback[track][window.currentPattern] = preset.mainDelayFeedback[track][window.currentPattern] || 0.3;
      variationDelayFeedback[track][window.currentPattern] = preset.variationDelayFeedback[track][window.currentPattern] || 0.3;
      mainDelayTime[track][window.currentPattern] = preset.mainDelayTime[track][window.currentPattern] || 3;
      variationDelayTime[track][window.currentPattern] = preset.variationDelayTime[track][window.currentPattern] || 3;
      mainDelayFilterFreq[track][window.currentPattern] = preset.mainDelayFilterFreq[track][window.currentPattern] || 5000;
      variationDelayFilterFreq[track][window.currentPattern] = preset.variationDelayFilterFreq[track][window.currentPattern] || 5000;
      mainPitch[track][window.currentPattern] = preset.mainPitch[track][window.currentPattern] || 0;
      variationPitch[track][window.currentPattern] = preset.variationPitch[track][window.currentPattern] || 0;
      mainPitchMix[track][window.currentPattern] = preset.mainPitchMix[track][window.currentPattern] || 0;
      variationPitchMix[track][window.currentPattern] = preset.variationPitchMix[track][window.currentPattern] || 0;
      extraStepSamples[track][window.currentPattern] = preset.extraStepSamples[track][window.currentPattern] && Array.isArray(preset.extraStepSamples[track][window.currentPattern]) ? preset.extraStepSamples[track][window.currentPattern] : Array(32).fill(null);
      extraPanning[track][window.currentPattern] = preset.extraPanning[track][window.currentPattern] && Array.isArray(preset.extraPanning[track][window.currentPattern]) ? preset.extraPanning[track][window.currentPattern] : Array(32).fill(0);
      extraVolumes[track][window.currentPattern] = preset.extraVolumes[track][window.currentPattern] && Array.isArray(preset.extraVolumes[track][window.currentPattern]) ? preset.extraVolumes[track][window.currentPattern] : Array(32).fill(0.8);
      extraPitch[track][window.currentPattern] = preset.extraPitch[track][window.currentPattern] && Array.isArray(preset.extraPitch[track][window.currentPattern]) ? preset.extraPitch[track][window.currentPattern] : Array(32).fill(0);
      extraPitchMix[track][window.currentPattern] = preset.extraPitchMix[track][window.currentPattern] && Array.isArray(preset.extraPitchMix[track][window.currentPattern]) ? preset.extraPitchMix[track][window.currentPattern] : Array(32).fill(1);
      extraDistortionWet[track][window.currentPattern] = preset.extraDistortionWet[track][window.currentPattern] && Array.isArray(preset.extraDistortionWet[track][window.currentPattern]) ? preset.extraDistortionWet[track][window.currentPattern] : Array(32).fill(0);
      extraDelayMix[track][window.currentPattern] = preset.extraDelayMix[track][window.currentPattern] && Array.isArray(preset.extraDelayMix[track][window.currentPattern]) ? preset.extraDelayMix[track][window.currentPattern] : Array(32).fill(0);
      extraDelayFeedback[track][window.currentPattern] = preset.extraDelayFeedback[track][window.currentPattern] && Array.isArray(preset.extraDelayFeedback[track][window.currentPattern]) ? preset.extraDelayFeedback[track][window.currentPattern] : Array(32).fill(0.3);
      extraDelayTime[track][window.currentPattern] = preset.extraDelayTime[track][window.currentPattern] && Array.isArray(preset.extraDelayTime[track][window.currentPattern]) ? preset.extraDelayTime[track][window.currentPattern] : Array(32).fill(3);
      extraDelayFilterFreq[track][window.currentPattern] = preset.extraDelayFilterFreq[track][window.currentPattern] && Array.isArray(preset.extraDelayFilterFreq[track][window.currentPattern]) ? preset.extraDelayFilterFreq[track][window.currentPattern] : Array(32).fill(5000);
      extraStepSamplers[track][window.currentPattern] = preset.extraStepSamplers[track][window.currentPattern] && Array.isArray(preset.extraStepSamplers[track][window.currentPattern]) ? preset.extraStepSamplers[track][window.currentPattern] : Array(32).fill(null);
      extraMonoPoly[track][window.currentPattern] = preset.extraMonoPoly[track][window.currentPattern] || "step";
    });

    // Update track states
    tracks.forEach(track => {
      trackStepCounts[track] = preset.trackStepCounts?.[track] && typeof preset.trackStepCounts[track] === "object" ? preset.trackStepCounts[track] : { [window.currentPattern]: 16 };
      trackStepLocks[track] = preset.trackStepLocks?.[track] ?? false;
      trackSoloStates[track] = preset.trackSoloStates?.[track] ?? false;
      trackMuteStates[track] = preset.trackMuteStates?.[track] ?? false;
      const trackStepsInput = document.querySelector(`.track-steps-input[data-sound="${track}"]`);
      if (trackStepsInput) trackStepsInput.value = trackStepCounts[track][window.currentPattern] || 16;
      const lockPad = document.querySelector(`.lock-pad[data-sound="${track}"]`);
      if (lockPad) lockPad.classList.toggle("locked", trackStepLocks[track]);
      const soloPad = document.querySelector(`.solo-pad[data-sound="${track}"]`);
      if (soloPad) soloPad.classList.toggle("soloed", trackSoloStates[track]);
      const mutePad = document.querySelector(`.mute-pad[data-sound="${track}"]`);
      if (mutePad) mutePad.classList.toggle("muted", trackMuteStates[track]);
      updateTrackSteps(track, trackStepCounts[track][window.currentPattern] || 16);
      refreshPannerConnections(track, false);
      refreshPannerConnections(track, true);
    });

    // Initialize samplers for all tracks
    tracks.forEach((track, index) => {
      const note = notes[index] || track; // Fallback to track name if note is undefined
      if (!samplers[track]) {
        samplers[track] = new Tone.Sampler({
          urls: preset.loadedSamples?.[note] ? { [note]: preset.loadedSamples[note] } : {},
          onload: () => {
            console.log(`Sampler initialized for ${track} (${note})`);
            loadedSamples[note] = preset.loadedSamples?.[note] || null;
            refreshPannerConnections(track, false);
            refreshPannerConnections(track, true);
            updateTrackUI();
          },
          onerror: (error) => {
            console.error(`Failed to initialize sample for ${track} (${note}): ${error}`);
            loadedSamples[note] = null;
            updateTrackUI();
          }
        }).toDestination();
      } else if (preset.loadedSamples?.[note]) {
        samplers[track].dispose();
        samplers[track] = new Tone.Sampler({
          urls: { [note]: preset.loadedSamples[note] },
          onload: () => {
            console.log(`Sample ${soundNames[note] || note} reloaded for ${track} (${note})`);
            loadedSamples[note] = preset.loadedSamples[note];
            refreshPannerConnections(track, false);
            refreshPannerConnections(track, true);
            updateTrackUI();
          },
          onerror: (error) => {
            console.error(`Failed to reload sample ${soundNames[note] || note} for ${track} (${note}): ${error}`);
            loadedSamples[note] = null;
            updateTrackUI();
          }
        }).toDestination();
      }
    });

    // Update click and measures
    window.measures = preset.measures && typeof preset.measures === "number" ? preset.measures : 4;
    window.clickActive = preset.clickActive ?? false;
    window.globalStepIndex = preset.globalStepIndex && typeof preset.globalStepIndex === "number" ? preset.globalStepIndex : 0;
    if (clickMeasuresInput) clickMeasuresInput.value = window.measures;
    updateClickUI();

    // Update UI for selected sound
    if (preset.selectedSound && tracks.includes(preset.selectedSound)) {
      window.selectedSound = preset.selectedSound;
      window.isVariationSubsequencer = preset.isVariationSubsequencer ?? false;
      const note = notes[tracks.indexOf(window.selectedSound)] || window.selectedSound;
      const secondaryNameInput = document.querySelector(".secondary-name");
      if (secondaryNameInput) {
        secondaryNameInput.value = soundNames[note] || window.selectedSound;
      }
      document.querySelectorAll(".pad").forEach(p => {
        if (p) p.classList.toggle("selected", p.dataset.sound === window.selectedSound);
      });
      updateSubSteps(window.selectedSound);
      updateSoundSettingsUI();
      refreshPannerConnections(window.selectedSound, window.isVariationSubsequencer);
      subsequencerToggles.forEach(t => {
        if (t) t.classList.toggle("selected", t.dataset.mode === (window.isVariationSubsequencer ? "variation" : "main"));
      });
    }
    updateAfterPresetLoad();
    console.log("Preset loaded successfully");
  } catch (error) {
    console.error("Error loading preset:", error);
    alert("Failed to load preset. Check the console for details.");
  }
};

function initializePatternData(newPattern) {
  patternBPMs[newPattern] = 120;
  patternMeasures[newPattern] = 4;
  patternTexts[newPattern] = '';
  tracks.forEach(track => {
    sequence[track] = sequence[track] || {};
    sequence[track][newPattern] = Array(32).fill(false);
    patternStepCounts[track] = patternStepCounts[track] || {};
    patternStepCounts[track][newPattern] = 16;
    mainSubSequences[track] = mainSubSequences[track] || {};
    mainSubSequences[track][newPattern] = Array(16).fill(false);
    mainSubSequences[track][newPattern][0] = true;
    variationSubSequences[track] = variationSubSequences[track] || {};
    variationSubSequences[track][newPattern] = Array(16).fill(false);
    variationSubSequences[track][newPattern][0] = true;
    mainSubstepCounts[track] = mainSubstepCounts[track] || {};
    mainSubstepCounts[track][newPattern] = 1;
    variationSubstepCounts[track] = variationSubstepCounts[track] || {};
    variationSubstepCounts[track][newPattern] = 1;
    mainPanning[track] = mainPanning[track] || {};
    mainPanning[track][newPattern] = 0;
    variationPanning[track] = variationPanning[track] || {};
    variationPanning[track][newPattern] = 0;
    mainVolumes[track] = mainVolumes[track] || {};
    mainVolumes[track][newPattern] = 0.8;
    variationVolumes[track] = variationVolumes[track] || {};
    variationVolumes[track][newPattern] = 0.8;
    mainDistortionWet[track] = mainDistortionWet[track] || {};
    mainDistortionWet[track][newPattern] = 0;
    variationDistortionWet[track] = variationDistortionWet[track] || {};
    variationDistortionWet[track][newPattern] = 0;
    mainDelayMix[track] = mainDelayMix[track] || {};
    mainDelayMix[track][newPattern] = 0;
    variationDelayMix[track] = variationDelayMix[track] || {};
    variationDelayMix[track][newPattern] = 0;
    mainDelayFeedback[track] = mainDelayFeedback[track] || {};
    mainDelayFeedback[track][newPattern] = 0.3;
    variationDelayFeedback[track] = variationDelayFeedback[track] || {};
    variationDelayFeedback[track][newPattern] = 0.3;
    mainDelayTime[track] = mainDelayTime[track] || {};
    mainDelayTime[track][newPattern] = 3;
    variationDelayTime[track] = variationDelayTime[track] || {};
    variationDelayTime[track][newPattern] = 3;
    mainDelayFilterFreq[track] = mainDelayFilterFreq[track] || {};
    mainDelayFilterFreq[track][newPattern] = 5000;
    variationDelayFilterFreq[track] = variationDelayFilterFreq[track] || {};
    variationDelayFilterFreq[track][newPattern] = 5000;
    mainMonoPoly[track] = mainMonoPoly[track] || {};
    mainMonoPoly[track][newPattern] = "mono";
    variationMonoPoly[track] = variationMonoPoly[track] || {};
    variationMonoPoly[track][newPattern] = "mono";
    mainPitch[track] = mainPitch[track] || {};
    mainPitch[track][newPattern] = 0;
    variationPitch[track] = variationPitch[track] || {};
    variationPitch[track][newPattern] = 0;
    mainPitchMix[track] = mainPitchMix[track] || {};
    mainPitchMix[track][newPattern] = 0;
    variationPitchMix[track] = variationPitchMix[track] || {};
    variationPitchMix[track][newPattern] = 0;
    if (track === "extra") {
      extraStepSamples[track] = extraStepSamples[track] || {};
      extraStepSamples[track][newPattern] = Array(32).fill(null);
      extraPanning[track] = extraPanning[track] || {};
      extraPanning[track][newPattern] = Array(32).fill(0);
      extraVolumes[track] = extraVolumes[track] || {};
      extraVolumes[track][newPattern] = Array(32).fill(0.8);
      extraPitch[track] = extraPitch[track] || {};
      extraPitch[track][newPattern] = Array(32).fill(0);
      extraPitchMix[track] = extraPitchMix[track] || {};
      extraPitchMix[track][newPattern] = Array(32).fill(1);
      extraDistortionWet[track] = extraDistortionWet[track] || {};
      extraDistortionWet[track][newPattern] = Array(32).fill(0);
      extraDelayMix[track] = extraDelayMix[track] || {};
      extraDelayMix[track][newPattern] = Array(32).fill(0);
      extraDelayFeedback[track] = extraDelayFeedback[track] || {};
      extraDelayFeedback[track][newPattern] = Array(32).fill(0.3);
      extraDelayTime[track] = extraDelayTime[track] || {};
      extraDelayTime[track][newPattern] = Array(32).fill(3);
      extraDelayFilterFreq[track] = extraDelayFilterFreq[track] || {};
      extraDelayFilterFreq[track][newPattern] = Array(32).fill(5000);
      extraStepSamplers[track] = extraStepSamplers[track] || {};
      extraStepSamplers[track][newPattern] = Array(32).fill(null);
      extraMonoPoly[track] = extraMonoPoly[track] || {};
      extraMonoPoly[track][newPattern] = "step";
    }
  });
}

function addMainPattern() {
  if (!audioStarted) {
    alert("Please click 'Start Audio' first!");
    return;
  }
  if (patterns.length >= maxPatterns) {
    alert("Maximum number of patterns reached!");
    return;
  }
  const firstRowPatterns = allPatterns.filter(p => p.match(/^[A-P]1$/));
  const usedFirstRowPatterns = patterns.filter(p => firstRowPatterns.includes(p));
  if (usedFirstRowPatterns.length >= firstRowPatterns.length) {
    alert("All first row patterns (A1 to P1) are used!");
    return;
  }
  const availableFirstRowPatterns = firstRowPatterns.filter(p => !patterns.includes(p));
  const newPattern = availableFirstRowPatterns[0];
  patterns.push(newPattern);
  if (copyAll) {
    copyPatternData(currentPattern, newPattern);
  } else {
    initializePatternData(newPattern);
  }
  currentPattern = newPattern;
  updatePatternsList();
  updatePatternDisplay();
  const firstUnlockedTrack = tracks.find(track => !trackStepLocks[track]);
  stepsInput.value = firstUnlockedTrack ? patternStepCounts[firstUnlockedTrack][newPattern] || 16 : 16;
  document.getElementById("patternNameInput").value = patternTexts[newPattern] || "";
  Tone.Transport.bpm.value = patternBPMs[newPattern];
  bpmInput.value = patternBPMs[newPattern];
  tracks.forEach(track => {
    trackStepCounts[track] = patternStepCounts[track][newPattern];
    document.querySelector(`.track-steps-input[data-sound="${track}"]`).value = trackStepCounts[track];
    updateTrackSteps(track, trackStepCounts[track]);
  });
  if (selectedSound) {
    updateSubSteps(selectedSound);
    updateSoundSettingsUI();
  }
  measures = patternMeasures[newPattern];
  clickMeasuresInput.value = measures;
  updateClickUI();
  console.log(`New pattern ${newPattern} created`);
}

function addVariationPattern() {
  if (!audioStarted) {
    alert("Please click 'Start Audio' first!");
    return;
  }
  if (patterns.length >= maxPatterns) {
    alert("Maximum number of patterns reached!");
    return;
  }

  const currentLetter = currentPattern[0];
  let nextNumber = parseInt(currentPattern.slice(1)) + 1;
  let nextPattern = `${currentLetter}${nextNumber}`;

  while (allPatterns.includes(nextPattern) && patterns.includes(nextPattern)) {
    nextNumber++;
    nextPattern = `${currentLetter}${nextNumber}`;
  }

  if (!allPatterns.includes(nextPattern)) {
    alert(`No more slots available for letter ${currentLetter}!`);
    return;
  }

  patterns.push(nextPattern);
  if (copyAll) {
    copyPatternData(currentPattern, nextPattern);
  } else {
    initializePatternData(nextPattern);
  }
  currentPattern = nextPattern;
  updatePatternsList();
  updatePatternDisplay();
  tracks.forEach(track => updateTrackSteps(track, trackStepCounts[track]));
  if (selectedSound) {
    updateSubSteps(selectedSound);
    updateSoundSettingsUI();
  }
  console.log(`New pattern ${nextPattern} created`);
}
