const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const statusEl = document.getElementById("status");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

let recognition;
let maleVoice = null;
let karenVoice = null;
let karenActive = false; // 👈 Hotword state

/* ---------------- PRELOAD VOICES ---------------- */
function loadVoices() {
  const voices = synth.getVoices();
  if (!voices.length) return;

  maleVoice = voices.find(v =>
    v.name.toLowerCase().includes("male") ||
    v.name.toLowerCase().includes("daniel") ||
    v.name.toLowerCase().includes("alex")
  ) || voices[0];

  karenVoice = voices.find(v =>
    v.name.toLowerCase().includes("female") ||
    v.name.toLowerCase().includes("karen") ||
    v.name.toLowerCase().includes("google us english") ||
    v.name.toLowerCase().includes("samantha")
  ) || voices[0];
}

synth.onvoiceschanged = loadVoices;
loadVoices();

/* ---------------- SPEAK ---------------- */
function speak(text, useKaren = false) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = useKaren ? karenVoice : maleVoice;
  utter.rate = 1;
  utter.pitch = useKaren ? 1.1 : 1;
  synth.speak(utter);
}

/* ---------------- CHAT UI ---------------- */
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  statusEl.textContent = sender.toUpperCase() + ": " + text;
}

/* ---------------- HANDLE COMMANDS ---------------- */
async function handleCommand(command, useKaren = false) {
  command = command.toLowerCase();
  let response = "";

  if (command.includes("open youtube") || command.includes("open yt")) {
    response = "Opening YouTube.";
    window.open("https://youtube.com", "_blank");
  }

  else if (command.startsWith("search wikipedia") || command.includes("wikipedia")) {
    let query = command.replace("search wikipedia", "").replace("wikipedia", "").trim();
    if (!query) {
      response = "What should I search on Wikipedia?";
    } else {
      response = `Searching Wikipedia for ${query}...`;
      try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (data.query.search.length > 0) {
          let firstResult = data.query.search[0].title;
          const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstResult)}`;
          const summaryRes = await fetch(summaryUrl);
          const summaryData = await summaryRes.json();

          response = summaryData.extract || `Opening ${firstResult} on Wikipedia.`;
          if (!summaryData.extract) {
            window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult)}`, "_blank");
          }
        } else {
          response = `Sorry, I couldn't find anything for ${query}.`;
        }
      } catch (err) {
        console.error(err);
        response = "Error while fetching data.";
      }
    }
  }

  else if (command.startsWith("search") || command.startsWith("google")) {
    let query = command.replace("search", "").replace("google", "").trim();
    if (!query) {
      response = "What should I search on Google?";
    } else {
      response = `Searching Google for ${query}...`;
      try {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.AbstractText) {
          response = data.AbstractText;
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          response = data.RelatedTopics[0].Text || `Here are some results for ${query}.`;
        } else {
          response = `I couldn't find a direct answer, but I can open Google for you.`;
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
        }
      } catch (err) {
        console.error(err);
        response = "Error while searching Google.";
      }
    }
  }

  else if (command.includes("time")) {
    response = "The current time is " + new Date().toLocaleTimeString();
  }

  else if (command.includes("date")) {
    response = "Today’s date is " + new Date().toDateString();
  }

  else if (command.includes("hello") || command.includes("hi")) {
    response = "Hello! How can I help you today?";
  }

  else if (command.includes("how are you")) {
    response = "I am doing great, thank you for asking!";
  }

  else if (command.startsWith("play")) {
    let song = command.replace("play", "").trim();
    response = song ? `Playing ${song} on YouTube.` : "What song should I play?";
    if (song) window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`, "_blank");
  }

  else {
    response = "I heard: " + command;
  }

  addMessage("bot", response);
  speak(response, useKaren);
}

/* ---------------- SPEECH RECOGNITION ---------------- */
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    console.log("Heard:", transcript);

    if (transcript.includes("karen")) {
      karenActive = true;
      addMessage("bot", "Yes, I'm listening 👂");
      speak("Yes, I'm listening", true);
    }
    else if (karenActive) {
      addMessage("user", transcript);
      handleCommand(transcript, true);
      karenActive = false;
    }
    else {
      addMessage("user", transcript);
      handleCommand(transcript, false);
    }
  };

  recognition.start();
} else {
  alert("Your browser does not support Speech Recognition 😢");
}

/* ---------------- BUTTONS ---------------- */
sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (text !== "") {
    addMessage("user", text);
    handleCommand(text, false);
    userInput.value = "";
  }
});

voiceBtn.addEventListener("click", () => {
  recognition.start();
});
