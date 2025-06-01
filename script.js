// Seleciona os elementos do DOM
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".chatbot header span");
const sendBtn = document.querySelector("#send-btn");
const chatInput = document.querySelector(".chat-input textarea");
const chatbox = document.querySelector(".chatbox");
const modeToggler = document.querySelector(".mode-toggler");

// Variáveis de controle
let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

// ** SUA CHAVE DE API DO HUGGING FACE AQUI **
const HUGGINGFACE_API_KEY = "hf_SUA_CHAVE_DE_API_DO_HUGGING_FACE_AQUI"; // <<-- SUBSTITUA ISSO!
// ** ENDPOINT DA API DO HUGGING FACE **
// Você pode encontrar o endpoint na página do modelo no Hugging Face, na seção "Deploy" ou "Inference API"
// Ex: para um modelo de geração de texto, pode ser algo como:
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/gpt2"; // Exemplo para gpt2

// Função para criar um novo elemento de mensagem no chatbox
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

// Função para gerar uma resposta do chatbot usando Hugging Face API
const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");

  // O "prompt" ou "contexto" que você envia para a IA.
  // Isso instrui a IA sobre o papel dela e as informações da loja.
  const storeContext = `Você é um assistente de atendimento ao cliente para uma loja de departamentos chamada "MegaStore".
  Nossa MegaStore vende uma ampla variedade de produtos eletrônicos e vestuário.
  Em eletrônicos, temos: smartphones (Samsung, Apple, Xiaomi), laptops (Dell, HP, Apple), TVs (LG, Samsung, Sony), fones de ouvido, acessórios de informática, câmeras e videogames.
  Em vestuário, temos: roupas femininas (vestidos, blusas, calças, saias), roupas masculinas (camisas, camisetas, calças, jaquetas), roupas infantis, calçados (tênis, sapatos, sandálias) e acessórios (bolsas, cintos, joias).
  Nosso horário de funcionamento é de segunda a sábado, das 9h às 21h, e aos domingos e feriados, das 10h às 18h.
  Estamos localizados na Avenida Principal, 456, Centro.
  Aceitamos Pix, cartões de crédito (Visa, MasterCard, Elo) e débito.
  Não realizamos entregas para compras feitas na loja física.
  Não vendemos carros, motos ou produtos de grande porte.
  Para trocas, o prazo é de 30 dias com a nota fiscal e produto sem uso.
  Responda de forma amigável e útil, com base nas informações fornecidas sobre a MegaStore.
  Se a pergunta não for clara ou não tiver relação com a loja, peça mais detalhes ou sugira que o cliente visite a loja ou ligue para o atendimento.
  Não invente informações.`;

  // A mensagem completa a ser enviada para o modelo da IA
  const fullPrompt = `${storeContext}\n\nCliente: ${userMessage}\nAssistente:`;

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`, // Sua chave de API aqui
    },
    body: JSON.stringify({
      inputs: fullPrompt, // O texto completo com contexto e pergunta
      parameters: {
        max_new_tokens: 150, // Limita o tamanho da resposta da IA
        temperature: 0.7,    // Controla a criatividade da resposta (0.0 a 1.0)
        do_sample: true,     // Ativa amostragem para respostas mais variadas
        // clean_up_tokenization_spaces: true // Pode ser útil para alguns modelos
      }
    }),
  };

  try {
    const response = await fetch(HUGGINGFACE_API_URL, requestOptions);
    const data = await response.json();

    // A resposta da API do Hugging Face para geração de texto geralmente vem em um array
    // como [{ generated_text: "..." }]
    if (data && data.length > 0 && data[0].generated_text) {
      let generatedText = data[0].generated_text;

      // Importante: a IA pode repetir o prompt, então precisamos extrair apenas a resposta.
      // Procuramos pelo marcador "Assistente:" e pegamos o que vem depois.
      const assistantResponseIndex = generatedText.indexOf("Assistente:");
      if (assistantResponseIndex !== -1) {
        generatedText = generatedText.substring(assistantResponseIndex + "Assistente:".length).trim();
      } else {
        // Se a IA não incluiu "Assistente:", talvez ela só tenha continuado o texto.
        // Nesses casos, tente pegar o que vem depois da sua própria mensagem no prompt.
        const userMessageIndex = generatedText.indexOf(`Cliente: ${userMessage}\nAssistente:`);
        if (userMessageIndex !== -1) {
          generatedText = generatedText.substring(userMessageIndex + `Cliente: ${userMessage}\nAssistente:`.length).trim();
        } else {
          // Fallback se nada funcionar
          generatedText = generatedText.trim();
        }
      }

      // Remove qualquer sobra do prompt ou repetições indesejadas
      generatedText = generatedText.replace(storeContext, "").trim();

      messageElement.textContent = generatedText || "Desculpe, não consegui gerar uma resposta útil no momento. Por favor, tente novamente.";
    } else {
      messageElement.textContent = "Desculpe, não consegui obter uma resposta útil. Por favor, tente novamente mais tarde.";
      console.error("Resposta inesperada da API Hugging Face:", data);
    }
  } catch (error) {
    console.error("Erro ao chamar a API Hugging Face:", error);
    messageElement.textContent = "Oops! Houve um erro ao se comunicar com o servidor. Por favor, verifique sua chave de API ou tente novamente.";
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};

// Ajusta a altura do textarea dinamicamente
chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Evento de clique para o botão de enviar
sendBtn.addEventListener("click", handleChat);

// Evento de tecla para enviar com Enter (e Shift+Enter para quebrar linha)
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleChat();
  }
});

// Função para lidar com o envio da mensagem do usuário
const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  const incomingChatLi = createChatLi("Digitando...", "incoming");
  chatbox.appendChild(incomingChatLi);
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    generateResponse(incomingChatLi);
  }, 600);
};

// Evento de clique para o botão de abrir/fechar o chatbot
chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");
});

// Evento de clique para o botão de fechar o chatbot (dentro do header)
closeBtn.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});

// Evento de clique para o botão de modo (tema)
modeToggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});