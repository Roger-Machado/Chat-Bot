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

const shopContext = `Você é um assistente de chatbot para uma loja de departamentos fictícia chamada "Mega Store". Seu objetivo é ajudar os clientes com perguntas sobre produtos eletrônicos e vestuário.
    **Exemplos de produtos eletrônicos que vendemos:**
    - Smartphones (diversas marcas e modelos)
    - Laptops (notebooks para trabalho e jogos)
    - Smart TVs (4K, OLED, QLED)
    - Fones de ouvido (com e sem fio)
    - Câmeras digitais
    **Exemplos de produtos de vestuário que vendemos:**
    - Roupas masculinas (camisas, calças, jaquetas) 
    - Roupas femininas (vestidos, blusas, saias)
    - Calçados (tênis, sapatos, sandálias)
    - Acessórios (cintos, bolsas, joias)

    Não invente produtos que não estejam nestas categorias ou que não seriam esperados em uma loja de departamentos. Se não souber a resposta, diga que não tem essa informação no momento, mas pode tentar ajudar com algo relacionado a eletrônicos ou vestuário.`;

const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        'Você é um assistente de chatbot para uma loja de departamentos fictícia chamada "Mega Store". Seu objetivo é ajudar os clientes com perguntas sobre produtos eletrônicos e vestuário.',
        shopContext,
        {
          role: "user",
          parts: [{ text:shopContext + "\n\n" + userMessage }],
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
        "Desculpe, não consegui obter uma resposta para isso no momento.";
      chatbox.appendChild(createChatLi(message, "incoming"));
      chatbox.scrollTo(0, chatbox.scrollHeight);
    })
    .catch((error) => {
      console.error("Erro na API do Gemini:", error);
      typingElement.remove();
      chatbox.appendChild(
        createChatLi("Ocorreu um erro ao tentar obter uma resposta. Por favor, tente novamente mais tarde.", "incoming")
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

const toggler = document.querySelector(".chatbot-toggler");
const body = document.body;

toggler.addEventListener("click", () => {
  body.classList.toggle("show-chatbot");
});

const modeToggler = document.querySelector(".mode-toggler");
const icon = modeToggler.querySelector("span");

modeToggler.addEventListener("click", () => {
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    icon.textContent = "light_mode"; // troca para sol
  } else {
    icon.textContent = "dark_mode"; // troca para lua
  }
});