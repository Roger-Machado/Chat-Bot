const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");

let userMessage;
const API_KEY = "AIzaSyA804sysVC42K7fNMyuMRuYi4XbrdpT1BM";
const isTyping = false;

let chatHistory = [
    {
        role: "user", 
        parts: [{ text: `Você é um assistente de chatbot amigável e prestativo para uma loja de departamentos fictícia chamada "Mega Store". Seu principal objetivo é ajudar os clientes com perguntas sobre nossos produtos eletrônicos e produtos de vestuário.

        Aqui estão os detalhes sobre os produtos que vendemos:

        **Eletrônicos:**
        * **Smartphones:** Diversas marcas e modelos, incluindo os mais recentes lançamentos e opções mais acessíveis. Temos Android e iOS.
        * **Laptops (Notebooks):** Modelos para trabalho, estudo e jogos. Variedade de processadores (Intel, AMD) e sistemas operacionais (Windows, macOS, Linux).
        * **Smart TVs:** TVs de alta definição (4K, 8K), com tecnologias OLED, QLED e LED. Tamanhos variados.
        * **Fones de ouvido:** Modelos com e sem fio, intra-auriculares, supra-auriculares, com cancelamento de ruído e para esportes.
        * **Câmeras Digitais:** Câmeras compactas, DSLRs e mirrorless, além de acessórios como lentes e tripés.

        **Vestuário:**
        * **Roupas Masculinas:** Camisas (sociais, casuais), calças (jeans, sarja), casacos, jaquetas, moletons e roupas esportivas.
        * **Roupas Femininas:** Vestidos (sociais, casuais), blusas, saias, calças, casacos, jaquetas e roupas de ginástica.
        * **Calçados:** Tênis (esportivos, casuais), sapatos sociais, sandálias e botas.
        * **Acessórios:** Cintos, bolsas, carteiras, óculos de sol e joias.

        **Instruções Importantes:**
        1.  **Foco nos Produtos:** Responda apenas sobre produtos eletrônicos e de vestuário que seriam comumente encontrados em uma loja de departamentos.
        2.  **Não Invente:** Se uma pergunta for sobre um produto ou serviço que não foi mencionado explicitamente ou que não se encaixa na nossa categoria, responda educadamente que você não tem informações sobre isso ou que não vendemos esse tipo de item.
        3.  **Linguagem Natural:** Mantenha um tom amigável e útil.
        4.  **Exemplos de Perguntas que você deve responder:**
            * "Vocês vendem smartphones?"
            * "Quais tipos de laptops vocês têm?"
            * "Posso encontrar vestidos na Mega Store?"
            * "Vocês têm tênis de corrida?"
            * "Onde encontro fones de ouvido sem fio?"
            * "Vocês vendem câmeras?"
        5.  **Exemplos de Perguntas que você NÃO deve responder (e como lidar):**
            * "Vocês vendem carros?" -> "Desculpe, a Mega Store é uma loja de departamentos e não vendemos automóveis. Posso ajudar com eletrônicos ou vestuário?"
            * "Qual a previsão do tempo?" -> "Minha função é ajudar com informações sobre os produtos da Mega Store. Não tenho acesso a informações de previsão do tempo."
            * "Vocês entregam pizza?" -> "Não, não entregamos pizza. Somos uma loja de departamentos. Posso ajudar com eletrônicos ou vestuário?"

        A partir de agora, inicie a conversa com a mensagem: "Olá! Seja bem-vindo(a) à Mega Store. Como posso ajudar você hoje com nossos produtos eletrônicos ou de vestuário?"`
    },
    {

        role: "model",
        parts: [{ text: "Olá! Seja bem-vindo(a) à Mega Store. Como posso ajudar você hoje com nossos produtos eletrônicos ou de vestuário?" }]
    }
  ]
}];

  document.addEventListener('DOMContentLoaded', () => {
        chatbox.innerHTML = ''; 
        chatbox.appendChild(createChatLi(chatHistory[1].parts[0].text, "incoming"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
});

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
            contents: chatHistory, 
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 200,
            },
        }),
    };

    fetch(API_URL, requestOptions)
        .then((res) => {
            if (!res.ok) {
                return res.json().then(err => {
                    console.error("Erro na resposta da API:", err);
                    throw new Error(`API error: ${err.error?.message || res.statusText}`);
                });
            }
            return res.json();
        })
        .then((data) => {
            typingElement.remove();
            const message =
                data.candidates?.[0]?.content?.parts?.[0]?.text ||
                "Desculpe, não consegui obter uma resposta clara para isso. Poderia reformular a pergunta?";

            chatHistory.push({ role: "model", parts: [{ text: message }] });

            chatbox.appendChild(createChatLi(message, "incoming"));
            chatbox.scrollTo(0, chatbox.scrollHeight);
        })
        .catch((error) => {
            console.error("Erro ao chamar a API do Gemini:", error);
            typingElement.remove();
            chatbox.appendChild(
                createChatLi(
                    `Ocorreu um erro ao obter uma resposta: ${error.message || 'Erro desconhecido'}. Por favor, tente novamente.`,
                    "incoming"
                )
            );
            chatbox.scrollTo(0, chatbox.scrollHeight);
        });
};

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = ""; 

    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const typingElement = createChatLi("Digitando...", "incoming");
        chatbox.appendChild(typingElement);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(typingElement);
    }, 600);
};

sendChatBtn.addEventListener("click", handleChat);

chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
} );

const toggler = document.querySelector(".chatbot-toggler");
const body = document.body;
const closeChatBtn = document.querySelector(".chatbot header span");

toggler.addEventListener("click", () => {
    body.classList.toggle("show-chatbot");
});

closeChatBtn.addEventListener("click", () => {
    body.classList.remove("show-chatbot");
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