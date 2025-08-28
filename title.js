const wordIds = ["pWord", "sWord", "yWord", "kWord", "iWord", "cWord", "gWord", "dWord", "rWord", "bWord", "mWord", "aWord"];
let wordsData = {};

async function loadWords() {
  try {
    const response = await fetch("words.json");
    if (!response.ok) throw new Error("Failed to load words.json");
    wordsData = await response.json();
    updateWords();
  } catch (error) {
    console.error("Error loading words:", error);
  }
}

function updateWords() {
  wordIds.forEach(id => {
    const element = document.getElementById(id);
    const initialLetter = element.textContent.charAt(0).toLowerCase();
    const wordList = wordsData[initialLetter] || [];
    if (wordList.length > 0) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      element.textContent = randomWord; // Keep the word as-is from words.json
    }
  });
}