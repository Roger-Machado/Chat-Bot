const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");

let userMessage;
const API_KEY = "AIzaSyA804sysVC42K7fNMyuMRuYi4XbrdpT1BM";
const isTyping = false;

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  let chatContent =
    className === "outgoing"
      ? `<p>${message}</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
  chatLi.innerHTML = chatContent;
  return chatLi;
};

const generateResponse = (typingElement) => {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    }),
  };

  fetch(API_URL, requestOptions)
    .then((res) => res.json())
    .then((data) => {
      typingElement.remove(); // ✅ Agora funciona
      const message =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Erro na resposta da API.";
      chatbox.appendChild(createChatLi(message, "incoming"));
      chatbox.scrollTo(0, chatbox.scrollHeight);
    })
    .catch(() => {
      typingElement.remove();
      chatbox.appendChild(
        createChatLi("Erro ao obter resposta da API.", "incoming")
      );
      chatbox.scrollTo(0, chatbox.scrollHeight);
    });
};

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatInput.value = "";

  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    const typingElement = createChatLi("Digitando...", "incoming");
    chatbox.appendChild(typingElement);
    chatbox.scrollTo(0, chatbox.scrollHeight); // Scroll após "Digitando..."
    generateResponse(typingElement);
  }, 600);
};

sendChatBtn.addEventListener("click", handleChat);

chatInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleChat();
  }
});
