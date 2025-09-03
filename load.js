// Confirm script is loaded
console.log("load.js loaded at", new Date().toISOString());

// Ensure Tone.js is loaded
if (!window.Tone) {
  console.error("Tone.js is not loaded!");
}

// Initialize pattern for extra track if not already set
function initializeExtraTrackPattern(track, pattern) {
  if (!extraStepSamples[track][pattern]) {
    extraStepSamples[track][pattern] = Array(32).fill(null);
    extraStepSamplers[track][pattern] = Array(32).fill(null);
    extraPanning[track][pattern] = Array(32).fill(0);
    extraVolumes[track][pattern] = Array(32).fill(0.8);
    extraPitch[track][pattern] = Array(32).fill(0);
    extraPitchMix[track][pattern] = Array(32).fill(1);
    extraDistortionWet[track][pattern] = Array(32).fill(0);
    extraDelayMix[track][pattern] = Array(32).fill(0);
    extraDelayFeedback[track][pattern] = Array(32).fill(0.3);
    extraDelayTime[track][pattern] = Array(32).fill(3);
    extraDelayFilterFreq[track][pattern] = Array(32).fill(5000);
    sequence[track][pattern] = Array(32).fill(false);
    mainSubSequences[track][pattern] = Array(32).fill(false);
    mainSubSequences[track][pattern][0] = true;
    mainSubstepCounts[track][pattern] = 1;
  }
}

// Update track UI for a given track and note
function updateTrackUI(track, note) {
  const pad = document.querySelector(`.pad[data-sound="${track}"]`);
  const nameInput = document.querySelector(`.name-input[data-sound="${track}"]`);
  if (pad && nameInput) {
    pad.classList.toggle("loaded", !!loadedSamples[note]);
    nameInput.value = soundNames[note] || track.charAt(0).toUpperCase() + track.slice(1);
    if (selectedSound === track) {
      document.querySelector(".secondary-name").value = soundNames[note] || track;
    }
  } else {
    console.error(`UI elements for ${track} not found`);
  }
}

// Load sample for non-extra tracks
function loadSampleToTrack(sound, note, sampleFileName, silent = false) {
  if (!audioStarted) {
    if (!silent) alert("Please click 'Start Audio' first!");
    return false;
  }

  const defaultSamplePath = `./samples/${sampleFileName}`;
  let success = false;

  // Try loading directly with Tone.Sampler
  const tryDirectLoad = () => {
    loadedSamples[note] = defaultSamplePath;
    soundNames[note] = sampleFileName;
    if (samplers[sound]) samplers[sound].dispose();
    samplers[sound] = new Tone.Sampler({
      urls: { [note]: defaultSamplePath },
      onload: () => {
        console.log(`Successfully loaded ${sampleFileName} for ${sound}`);
        refreshPannerConnections(sound, isVariationSubsequencer);
        updateTrackUI(sound, note);
        document.querySelector(".secondary-name").value = soundNames[note] || sound;
        if (!silent) alert(`Loaded ${sampleFileName} into ${sound.charAt(0).toUpperCase() + sound.slice(1)} track!`);
        success = true;
      },
      onerror: (error) => {
        console.error(`Failed to load ${sampleFileName} from ${defaultSamplePath}: ${error}`);
        if (!silent) {
          alert(`Failed to load ${sampleFileName}. Please select the file.`);
          promptForFile();
        }
      }
    }).toDestination();
  };

  const tryLoadSampleFromFiles = (files) => {
    let found = false;
    for (const file of files) {
      if (file.name.toLowerCase() === sampleFileName.toLowerCase()) {
        found = true;
        const url = URL.createObjectURL(file);
        loadedSamples[note] = url;
        soundNames[note] = file.name;
        if (samplers[sound]) samplers[sound].dispose();
        samplers[sound] = new Tone.Sampler({
          urls: { [note]: url },
          onload: () => {
            console.log(`Successfully loaded ${file.name} for ${sound} from file input`);
            refreshPannerConnections(sound, isVariationSubsequencer);
            updateTrackUI(sound, note);
            document.querySelector(".secondary-name").value = soundNames[note] || sound;
            if (!silent) alert(`Loaded ${file.name} into ${sound.charAt(0).toUpperCase() + sound.slice(1)} track!`);
            setTimeout(() => URL.revokeObjectURL(url), 0);
            success = true;
          },
          onerror: (error) => {
            console.error(`Failed to load ${file.name}: ${error}`);
            if (!silent) alert(`Failed to load ${file.name}. Check the console.`);
            loadedSamples[note] = null;
            updateTrackUI(sound, note);
          }
        }).toDestination();
        break;
      }
    }
    return found;
  };

  const promptForFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/wav";
    input.onchange = (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) {
        if (!silent) alert("No file selected!");
        return;
      }
      const found = tryLoadSampleFromFiles(files);
      if (!found && !silent) {
        alert(`No file named '${sampleFileName}' found!`);
      }
      input.remove();
    };
    input.click();
  };

  tryDirectLoad();
  return success;
}

// Load sample to a specific step in the extra track
function loadSampleToExtraStep(step, sampleFileName, silent = false) {
  if (!audioStarted) {
    if (!silent) alert("Please click 'Start Audio' first!");
    return false;
  }

  const track = "extra";
  const defaultSamplePath = `./samples/${sampleFileName}`;
  let success = false;
  initializeExtraTrackPattern(track, currentPattern);

  const tryDirectLoad = () => {
    extraStepSamples[track][currentPattern][step - 1] = sampleFileName;
    if (extraStepSamplers[track][currentPattern][step - 1]) {
      extraStepSamplers[track][currentPattern][step - 1].dispose();
    }
    extraStepSamplers[track][currentPattern][step - 1] = new Tone.Player({
      url: defaultSamplePath,
      autostart: false,
      onload: () => {
        console.log(`Successfully loaded ${sampleFileName} for extra track, step ${step}`);
        const stepEl = document.querySelector(`[data-track="extra"][data-step="${step - 1}"]`);
        if (stepEl) {
          stepEl.dataset.sampleLoaded = "true";
          stepEl.classList.add("main-active");
        }
        const secondaryNameInput = document.querySelector(".secondary-name");
        if (secondaryNameInput) {
          secondaryNameInput.value = sampleFileName.replace(/\.[^/.]+$/, "");
        }
        if (!silent) alert(`Loaded ${sampleFileName} into Extra track step ${step}!`);
        success = true;
      },
      onerror: (error) => {
        console.error(`Failed to load ${sampleFileName} for extra track, step ${step}: ${error}`);
        if (!silent) {
          alert(`Failed to load ${sampleFileName}. Please select the file.`);
          promptForFile();
        }
        extraStepSamples[track][currentPattern][step - 1] = null;
        extraStepSamplers[track][currentPattern][step - 1] = null;
      }
    }).chain(
      new Tone.PitchShift({ pitch: extraPitch[track][currentPattern][step - 1], wet: extraPitchMix[track][currentPattern][step - 1] }),
      new Tone.Distortion({ distortion: 0.5, wet: extraDistortionWet[track][currentPattern][step - 1] }),
      new Tone.FeedbackDelay({
        delayTime: subdivisions[extraDelayTime[track][currentPattern][step - 1]]?.time || "4n",
        feedback: extraDelayFeedback[track][currentPattern][step - 1],
        wet: extraDelayMix[track][currentPattern][step - 1]
      }),
      new Tone.Filter({ frequency: extraDelayFilterFreq[track][currentPattern][step - 1], type: "lowpass" }),
      new Tone.Panner(extraPanning[track][currentPattern][step - 1]),
      new Tone.Gain(extraVolumes[track][currentPattern][step - 1]),
      Tone.Destination
    );
  };

  const tryLoadSampleFromFiles = (files) => {
    let found = false;
    for (const file of files) {
      if (file.name.toLowerCase() === sampleFileName.toLowerCase()) {
        found = true;
        const url = URL.createObjectURL(file);
        extraStepSamples[track][currentPattern][step - 1] = file.name;
        if (extraStepSamplers[track][currentPattern][step - 1]) {
          extraStepSamplers[track][currentPattern][step - 1].dispose();
        }
        extraStepSamplers[track][currentPattern][step - 1] = new Tone.Player({
          url: url,
          autostart: false,
          onload: () => {
            console.log(`Successfully loaded ${file.name} for extra track, step ${step} from file input`);
            const stepEl = document.querySelector(`[data-track="extra"][data-step="${step - 1}"]`);
            if (stepEl) {
              stepEl.dataset.sampleLoaded = "true";
              stepEl.classList.add("main-active");
            }
            const secondaryNameInput = document.querySelector(".secondary-name");
            if (secondaryNameInput) {
              secondaryNameInput.value = file.name.replace(/\.[^/.]+$/, "");
            }
            if (!silent) alert(`Loaded ${file.name} into Extra track step ${step}!`);
            setTimeout(() => URL.revokeObjectURL(url), 0);
            success = true;
          },
          onerror: (error) => {
            console.error(`Failed to load ${file.name} for extra track, step ${step}: ${error}`);
            if (!silent) alert(`Failed to load ${file.name}. Check the console.`);
            extraStepSamples[track][currentPattern][step - 1] = null;
            extraStepSamplers[track][currentPattern][step - 1] = null;
          }
        }).chain(
          new Tone.PitchShift({ pitch: extraPitch[track][currentPattern][step - 1], wet: extraPitchMix[track][currentPattern][step - 1] }),
          new Tone.Distortion({ distortion: 0.5, wet: extraDistortionWet[track][currentPattern][step - 1] }),
          new Tone.FeedbackDelay({
            delayTime: subdivisions[extraDelayTime[track][currentPattern][step - 1]]?.time || "4n",
            feedback: extraDelayFeedback[track][currentPattern][step - 1],
            wet: extraDelayMix[track][currentPattern][step - 1]
          }),
          new Tone.Filter({ frequency: extraDelayFilterFreq[track][currentPattern][step - 1], type: "lowpass" }),
          new Tone.Panner(extraPanning[track][currentPattern][step - 1]),
          new Tone.Gain(extraVolumes[track][currentPattern][step - 1]),
          Tone.Destination
        );
        break;
      }
    }
    return found;
  };

  const promptForFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/wav";
    input.onchange = (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) {
        if (!silent) alert("No file selected!");
        return;
      }
      const found = tryLoadSampleFromFiles(files);
      if (!found && !silent) {
        alert(`No file named '${sampleFileName}' found!`);
      }
      input.remove();
    };
    input.click();
  };

  tryDirectLoad();
  return success;
}

// Load all samples for tracks
function loadAllSamples() {
  console.log("loadAllSamples called");
  // Load samples for tracks 1, 4, and 7
  loadSampleToTrack('kick', 'C1', '1.wav');
  loadSampleToTrack('clap', 'F1', '7.wav');
  loadSampleToTrack('crash', 'B1', '3.wav');
  // Load 9.wav into step 3 of track 9 (extra)
  loadSampleToExtraStep(3, '9.wav');
}

// Save sample assignments and active steps to a JSON file
function saveSampleAssignments() {
  console.log("saveSampleAssignments called");
  const assignments = {};

  // Save samples and steps for non-extra tracks
  tracks.forEach(track => {
    if (track !== "extra") {
      const note = notes[tracks.indexOf(track)];
      assignments[track] = {};
      if (soundNames[note]) {
        assignments[track].sample = soundNames[note];
        assignments[track].note = note;
      }
      // Save main and variation steps
      assignments[track].mainSteps = [];
      assignments[track].variationSteps = [];
      sequence[track][currentPattern].forEach((state, index) => {
        if (state === true || state === "both") {
          assignments[track].mainSteps.push(index + 1);
        }
        if (state === "variation" || state === "both") {
          assignments[track].variationSteps.push(index + 1);
        }
      });
    }
  });

  // Save step-specific samples and steps for extra track
  assignments.extra = {
    samples: {},
    mainSteps: []
  };
  extraStepSamples["extra"][currentPattern].forEach((sample, step) => {
    if (sample) {
      assignments.extra.samples[step + 1] = sample;
    }
  });
  sequence["extra"][currentPattern].forEach((state, index) => {
    if (state) {
      assignments.extra.mainSteps.push(index + 1);
    }
  });

  // Prompt for custom file name
  console.log("Prompting for file name");
  let fileName = window.prompt("Enter a name for the sample assignments file:", "sample_assignments");
  console.log("Prompt returned:", fileName);
  if (!fileName || fileName.trim() === "") {
    fileName = "sample_assignments";
    console.log("Using default file name: sample_assignments");
  }
  // Sanitize file name and ensure .json extension
  fileName = fileName.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (!fileName.toLowerCase().endsWith(".json")) {
    fileName += ".json";
  }
  console.log(`Saving sample assignments as ${fileName}`);

  // Create JSON file
  const json = JSON.stringify(assignments, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  console.log("Triggering download for", fileName);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  console.log("Saved sample assignments and steps:", assignments);
}

// Load sample assignments and active steps from a JSON file
function loadSampleAssignments() {
  console.log("loadSampleAssignments called");
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("No file selected!");
      input.remove();
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const assignments = JSON.parse(event.target.result);
        console.log("Loaded sample assignments and steps:", assignments);

        // Clear existing samples and steps
        tracks.forEach(track => {
          if (track !== "extra") {
            const note = notes[tracks.indexOf(track)];
            if (samplers[track]) {
              samplers[track].dispose();
              samplers[track] = new Tone.Sampler({ urls: {}, voices: 8 });
            }
            loadedSamples[note] = null;
            soundNames[note] = null;
            sequence[track][currentPattern] = Array(32).fill(false);
            mainSubSequences[track][currentPattern] = Array(32).fill(false);
            mainSubSequences[track][currentPattern][0] = true;
            mainSubstepCounts[track][currentPattern] = 1;
            variationSubSequences[track][currentPattern] = Array(32).fill(false);
            variationSubSequences[track][currentPattern][0] = true;
            variationSubstepCounts[track][currentPattern] = 1;
          } else {
            extraStepSamples[track][currentPattern].fill(null);
            extraStepSamplers[track][currentPattern].forEach(player => player?.dispose());
            extraStepSamplers[track][currentPattern].fill(null);
            sequence[track][currentPattern] = Array(32).fill(false);
            mainSubSequences[track][currentPattern] = Array(32).fill(false);
            mainSubSequences[track][currentPattern][0] = true;
            mainSubstepCounts[track][currentPattern] = 1;
          }
        });

        // Track loaded and skipped assignments
        const loaded = [];
        const skipped = [];

        // Validate sample names
        const isValidSample = (sample) => {
          if (!sample || sample.trim() === "" || sample.toLowerCase().includes("empty")) {
            return false;
          }
          return /\.(wav|mp3|ogg)$/i.test(sample);
        };

        // Load samples and steps for non-extra tracks
        tracks.forEach(track => {
          if (track !== "extra") {
            if (assignments[track] && isValidSample(assignments[track].sample)) {
              const { note, sample } = assignments[track];
              if (loadSampleToTrack(track, note, sample, true)) {
                loaded.push(`${track}: ${sample}`);
              } else {
                skipped.push(track);
              }
            } else {
              skipped.push(track);
            }
            // Load main and variation steps
            if (assignments[track]) {
              sequence[track][currentPattern] = Array(32).fill(false);
              if (assignments[track].mainSteps) {
                assignments[track].mainSteps.forEach(step => {
                  const stepIndex = step - 1;
                  if (stepIndex >= 0 && stepIndex < 32) {
                    sequence[track][currentPattern][stepIndex] = true;
                    const stepEl = document.querySelector(`[data-track="${track}"][data-step="${stepIndex}"]`);
                    if (stepEl) {
                      stepEl.classList.add("main-active");
                    }
                  }
                });
              }
              if (assignments[track].variationSteps) {
                assignments[track].variationSteps.forEach(step => {
                  const stepIndex = step - 1;
                  if (stepIndex >= 0 && stepIndex < 32) {
                    if (sequence[track][currentPattern][stepIndex] === true) {
                      sequence[track][currentPattern][stepIndex] = "both";
                    } else {
                      sequence[track][currentPattern][stepIndex] = "variation";
                    }
                    const stepEl = document.querySelector(`[data-track="${track}"][data-step="${stepIndex}"]`);
                    if (stepEl) {
                      stepEl.classList.add("variation-active");
                      if (sequence[track][currentPattern][stepIndex] === "both") {
                        stepEl.classList.add("main-active");
                      }
                    }
                  }
                });
              }
            }
          }
        });

        // Load step-specific samples and steps for extra track
        if (assignments.extra) {
          Object.keys(assignments.extra.samples || {}).forEach(step => {
            const stepNum = parseInt(step, 10);
            if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 32 && isValidSample(assignments.extra.samples[step])) {
              if (loadSampleToExtraStep(stepNum, assignments.extra.samples[step], true)) {
                loaded.push(`extra step ${stepNum}: ${assignments.extra.samples[step]}`);
              } else {
                skipped.push(`extra step ${stepNum}`);
              }
            } else {
              skipped.push(`extra step ${stepNum}`);
            }
          });
          // Load main steps for extra track
          if (assignments.extra.mainSteps) {
            assignments.extra.mainSteps.forEach(step => {
              const stepIndex = step - 1;
              if (stepIndex >= 0 && stepIndex < 32 && extraStepSamples["extra"][currentPattern][stepIndex]) {
                sequence["extra"][currentPattern][stepIndex] = true;
                const stepEl = document.querySelector(`[data-track="extra"][data-step="${stepIndex}"]`);
                if (stepEl) {
                  stepEl.classList.add("main-active");
                  stepEl.dataset.sampleLoaded = "true";
                }
              }
            });
          }
        }

        // Update extra track UI
        const anyExtraActive = sequence["extra"][currentPattern].some(state => state);
        const extraToggle = document.querySelector(".extra-toggle");
        if (extraToggle) {
          extraToggle.style.display = anyExtraActive ? "block" : "none";
          extraToggle.classList.toggle("active", anyExtraActive);
        }

        // Update all tracks UI
        tracks.forEach(track => {
          updateTrackSteps(track, trackStepCounts[track]);
        });

        // Show single alert with summary
        let message = "Sample assignments and steps loaded successfully!";
        if (skipped.length > 0) {
          message += `\nSkipped tracks/steps (no valid samples): ${skipped.join(", ")}`;
        }
        alert(message);
        console.log("Load summary:", { loaded, skipped });
      } catch (error) {
        console.error("Failed to parse sample assignments and steps:", error);
        alert("Failed to load sample assignments and steps. Check the file format.");
      }
      input.remove();
    };
    reader.readAsText(file);
  };
  input.click();
}

// File input listener for extra track step-specific samples
function setupExtraSampleInputListener() {
  const fileInput = document.querySelector(`.sample-input[data-sound="extra"]`);
  if (fileInput) {
    console.log("Attaching event listener to .sample-input[data-sound='extra']");
    fileInput.addEventListener("change", (e) => {
      console.log("Extra track sample input changed");
      const file = e.target.files[0];
      const step = parseInt(e.target.dataset.step, 10);
      if (!file || isNaN(step) || step < 1 || step > 32) {
        alert("Invalid file or step selected!");
        e.target.value = "";
        delete e.target.dataset.step;
        return;
      }
      loadSampleToExtraStep(step, file.name);
      e.target.value = "";
      delete e.target.dataset.step;
    });
  } else {
    console.error("Sample input (.sample-input[data-sound='extra']) not found in DOM");
  }
}

// Toggle step for extra track
function toggleStep(track, step, isVariation) {
  if (!audioStarted) {
    alert("Please click 'Start Audio' first!");
    return;
  }

  const stepEl = document.querySelector(`[data-track="${track}"][data-step="${step}"]`);
  if (!stepEl.classList.contains("enabled")) return;

  if (track === "extra" && isVariation) {
    // Right-click to load sample
    const fileInput = document.querySelector(`.sample-input[data-sound="extra"]`);
    fileInput.dataset.step = step;
    fileInput.click();
  } else if (track === "extra") {
    // Toggle step activation
    sequence[track][currentPattern][step] = !sequence[track][currentPattern][step];
    stepEl.classList.toggle("main-active", sequence[track][currentPattern][step]);
    stepEl.dataset.sampleLoaded = extraStepSamples[track][currentPattern][step] ? "true" : "false";
  } else {
    // Handle other tracks
    sequence[track][currentPattern][step] = !sequence[track][currentPattern][step];
    stepEl.classList.toggle("main-active", sequence[track][currentPattern][step]);
  }

  // Update UI
  const anyExtraActive = sequence["extra"][currentPattern].some(state => state);
  const extraToggle = document.querySelector(".extra-toggle");
  extraToggle.style.display = anyExtraActive ? "block" : "none";
  extraToggle.classList.toggle("active", anyExtraActive);
}

// Setup button event listeners with polling
function setupButtonListeners() {
  console.log("Attempting to setup button listeners at", new Date().toISOString());
  let attempts = 0;
  const maxAttempts = 10;

  const attachListeners = () => {
    attempts++;
    console.log(`Button listener setup attempt ${attempts}/${maxAttempts}`);
    const saveButton = document.querySelector(".save-button");
    const loadButton = document.querySelector(".load-button");

    if (saveButton) {
      console.log("Attaching event listener to .save-button");
      saveButton.addEventListener("click", () => {
        console.log("Save button clicked at", new Date().toISOString());
        saveSampleAssignments();
      });
    } else {
      console.error("Save button (.save-button) not found in DOM on attempt", attempts);
    }

    if (loadButton) {
      console.log("Attaching event listener to .load-button");
      loadButton.addEventListener("click", () => {
        console.log("Load button clicked at", new Date().toISOString());
        loadSampleAssignments();
      });
    } else {
      console.error("Load button (.load-button) not found in DOM on attempt", attempts);
    }

    // Poll for buttons if not found
    if ((!saveButton || !loadButton) && attempts < maxAttempts) {
      console.log("Buttons not found, scheduling retry");
      setTimeout(attachListeners, 500);
    } else if (attempts >= maxAttempts) {
      console.error("Max attempts reached, buttons not found in DOM");
    } else if (saveButton && loadButton) {
      console.log("Both buttons found and listeners attached");
    }
  };

  attachListeners();
}

// Initialize listeners
setupButtonListeners();
setupExtraSampleInputListener();
