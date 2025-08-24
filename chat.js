let userName = localStorage.getItem("userName");

window.onload = function () {
  const chatBox = document.getElementById("chatBox");

  if (!chatBox) return;

  if (!userName) {
    const askName = document.createElement("div");
    askName.className = "message bot";
    askName.textContent = "Hello! What should I call you?";
    chatBox.appendChild(askName);
  } else {
    greetUser(userName);
  }
};

function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  if (!input || !chatBox) return;

  const userMessage = input.value.trim();
  if (userMessage === "") return;

  const userDiv = document.createElement("div");
  userDiv.className = "message user";
  userDiv.textContent = userMessage;
  chatBox.appendChild(userDiv);
  input.value = "";

  chatBox.scrollTop = chatBox.scrollHeight;

  if (!userName) {
    userName = userMessage;
    localStorage.setItem("userName", userName);

    const botDiv = document.createElement("div");
    botDiv.className = "message bot";
    botDiv.textContent = `Nice to meet you, ${userName}!`;
    chatBox.appendChild(botDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return;
  }

  const botDiv = document.createElement("div");
  botDiv.className = "message bot";
  botDiv.innerHTML = generateReply(userMessage);
  chatBox.appendChild(botDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function generateReply(message) {
  const msg = message.toLowerCase();

  if (msg.includes("hi pet") || msg.includes("hello pet")) return `Hi ${userName}!`;
  if (msg.includes("who am i")) return `You're ${userName}, my awesome creator!`;
  if (msg.includes("what's your name")) return `I'm Your Pet, your assistant and friend! 🐾`;
  if (msg.includes("my name is gyan")) return `Hi Gyan! I think you're one of Shashwat's friends.`;
  if (msg.includes("my name is deepak")) return `Hi Sir SDM (Sanatani Deepak Maurya), also known as the OG Coder.`;
  if (msg.includes("my name is aditya")) return `Hi Aditya! You're the Malik, right?`;
  if (msg.includes("what you are doing")) return `Nothing, just trying to learn something new. What are you doing?`;
  if (msg.includes("thank you")) return `You're welcome dear, ${userName}.`;
  if (msg.includes("yes")) return `Yaa, my owner told me about you!`;

  // Basic math
  try {
    if (msg.startsWith("what is")) {
      const expression = msg.replace("what is", "").replace("?", "").trim();
      const result = eval(expression);
      if (!isNaN(result)) {
        return `${expression} = ${result}`;
      }
    }
  } catch (err) {}

  // Table of number
  const match = msg.match(/table of (\d+)/i);
  if (match) {
    const num = parseInt(match[1]);
    return generateTable(num);
  }

  return `Sorry! I'm still learning, ${userName}. Thank you for talking with me — it helps me grow!`;
}

function generateTable(n) {
  let table = `Here is the table of ${n}:<br>`;
  for (let i = 1; i <= 10; i++) {
    table += `${n} × ${i} = ${n * i}<br>`;
  }
  return table;
}

function greetUser(name) {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  const greeting = document.createElement("div");
  greeting.className = "message bot";
  greeting.textContent = `Welcome back, ${name}!`;
  chatBox.appendChild(greeting);
  chatBox.scrollTop = chatBox.scrollHeight;
}
