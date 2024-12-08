(async function () {
    try {
        const data = await extractInstagramData();

        if (Object.keys(data).length > 0) {
            displayModal(data);
        } else {
            displayModal({ error: "Nenhum dado encontrado." });
        }
    } catch (error) {
        console.error("Erro ao extrair dados:", error);
        displayModal({ error: "Erro ao extrair dados do Instagram." });
    }
})();

// Função para extrair os dados do Instagram e URLs
async function extractInstagramData() {
    const data = {
        url: window.location.href, // URL atual
        allUrls: await extractAllUrls(), // Captura todas as URLs da página
        imageUrls: await extractImageUrls(), // Captura as URLs das imagens
    };

    const keywords = [
        "Interações com stories", "Curtidas", "Compartilhamentos", "Respostas",
        "Contas com engajamento", "Toques em figurinhas", "@hakutakuai",
        "Navegação", "Avanço", "Saiu", "Próximo story", "Voltar",
        "Perfil", "Atividade do perfil", "Visitas ao perfil", "Seguidores",
    ];

    // Busca por palavras-chave e associa números encontrados
    keywords.forEach((keyword) => {
        const result = findNumberNearText(keyword);
        if (result) data[keyword] = result;
    });

    // Geração de dados para envio
    data.copypaste = generateCopypaste(data);

    return data;
}

// Função para gerar o conteúdo do copypaste
function generateCopypaste(data) {
    return `URLs capturadas:\n${data.allUrls.join('\n')}\n` +
        `Imagens capturadas:\n${data.imageUrls.join('\n')}\n` +
        `Reach Accounts reached ${data["Contas com engajamento"] || 0} 
        Followers ${data["Seguidores"] || 0}% 
        Non-followers ${(100 - (data["Seguidores"] || 0))}% 
        Impressions ${data["Impressões"] || 0} 
        Engagement Accounts engaged ${data["Engajamento"] || 0} 
        Likes ${data["Curtidas"] || 0} 
        Shares ${data["Compartilhamentos"] || 0} 
        Replies ${data["Respostas"] || 0} 
        Navigation ${data["Navegação"] || 0} 
        Forward ${data["Avanço"] || 0} 
        Back ${data["Voltar"] || 0} 
        Exited ${data["Saiu"] || 0} 
        Next story ${data["Próximo story"] || 0} 
        Profile ${data["Perfil"] || 0} 
        Profile activity ${data["Atividade do perfil"] || 0} 
        Profile visits ${data["Visitas ao perfil"] || 0} 
        Follows ${data["Follows"] || 0}`;
}

// Função para capturar todas as URLs da página, sem duplicatas
async function extractAllUrls() {
    const urls = Array.from(document.querySelectorAll('a')).map(link => link.href);
    return [...new Set(urls)]; // Remover URLs duplicadas
}

// Função para capturar as URLs das imagens
async function extractImageUrls() {
    const images = Array.from(document.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => !src.startsWith('data:image')); // Filtrar URLs que começam com "data:image"
    
    return [...new Set(images)]; 
}


// Função para encontrar números próximos a texto
function findNumberNearText(searchText) {
    const elements = Array.from(document.querySelectorAll('span, div, p'));
    let result = null;

    elements.forEach((el) => {
        const textContent = el.textContent.trim();
        if (textContent.toLowerCase().includes(searchText.toLowerCase())) {
            const numberMatch = textContent.match(/\d+/);
            if (numberMatch) result = numberMatch[0];
        }
    });

    return result;
}

// Função para exibir o modal
function displayModal(data) {
    const modal = document.createElement("div");
    modal.id = "instagram-data-modal";
    modal.innerHTML = `        
        <div class="modal-content">
            <h2>Dados Capturados</h2>
            <p>${data.error || Object.entries(data).map(([key, value]) => {
                // Exclui a chave 'copypaste' do conteúdo a ser exibido
                if (key === 'copypaste') return ''; // Ignora a chave copypaste

                if (Array.isArray(value)) {
                    return `<strong>${key}:</strong><br>${value.join('<br>')}`;
                }
                return `<strong>${key}:</strong> ${value}`;
            }).join('<br>')}</p>
            <div class="modal-buttons">
                <button id="close-modal">Fechar</button>
                <button id="send-data">Enviar Dados</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("close-modal").addEventListener("click", () => modal.remove());
    document.getElementById("send-data").addEventListener("click", () => sendDataToAPI(data, modal));
    addModalStyles();
}

// Função para enviar dados para a API
async function sendDataToAPI(data, modal) {
    const apiUrl = "https://gateway.talita.ai/webhook/7c4785f9-d1a0-4a6f-9409-419d27b74fa0";
    const loadingMessage = document.createElement("div");
    loadingMessage.textContent = "Enviando dados, por favor, aguarde...";
    document.body.appendChild(loadingMessage);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                copypaste: data.copypaste,
                URLInsights: data.url,
                URLFile: data.imageUrls, 
                date: new Date().toLocaleDateString("pt-BR"),
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);
        loadingMessage.remove();

        if (response.ok) {
            alert("Dados enviados com sucesso!");
            modal.remove();
        } else {
            alert(`Erro ao enviar os dados. Código: ${response.status}`);
        }
    } catch (error) {
        loadingMessage.remove();

        if (error.name === 'AbortError') {
            alert("Erro: a requisição demorou muito e foi abortada.");
        } else {
            alert("Erro ao conectar-se à API. Verifique sua conexão e tente novamente.");
        }
        console.error("Erro na chamada da API:", error);
    }
}

// Função para adicionar estilos do modal
function addModalStyles() {
    const styleSheet = document.createElement("link");
    styleSheet.rel = "stylesheet";
    styleSheet.href = chrome.runtime.getURL("style.css");
    document.head.appendChild(styleSheet);
}
