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

// Função para capturar a imagem do vídeo e adicioná-la ao modal
function captureVideoScreenshot(videoElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png'); // Retorna a imagem como base64
}

// Função para capturar diretamente uma imagem (estática)
function captureImageScreenshot(imageElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png'); // Retorna a imagem como base64
}

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
                if (key === 'copypaste') return ''; // Ignora a chave copypaste

                if (Array.isArray(value)) {
                    return `<strong>${key}:</strong><br>${value.join('<br>')}`;
                }
                return `<strong>${key}:</strong> ${value}`;
            }).join('<br>')}</p>
            <div class="media-screenshot">
                <button id="capture-media-screenshot">Capturar Imagem de Mídia</button>
            <div id="media-screenshot"></div>
            </div>
            <div class="modal-buttons">
                <button id="close-modal">Fechar</button>
                <button id="send-data">Enviar Dados</button>
            </div>
        
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("close-modal").addEventListener("click", () => modal.remove());
    document.getElementById("send-data").addEventListener("click", () => sendDataToAPI(data, modal));

    // Captura de vídeo ou imagem
    const captureButton = document.getElementById('capture-media-screenshot');
    captureButton.addEventListener('click', () => {
        const videoElement = document.querySelector('video');
        const imageElement = document.querySelector('img[src][srcset]');

        if (videoElement && !videoElement.paused) {
            const screenshotData = captureVideoScreenshot(videoElement);
            const screenshotElement = document.getElementById('media-screenshot');
            screenshotElement.innerHTML = `<img src="${screenshotData}" alt="Screenshot do Vídeo" style="max-width: 20%; height: auto;">`;
        } else if (imageElement && imageElement.getAttribute('crossorigin') === 'anonymous') {
            const screenshotData = captureImageScreenshot(imageElement);
            const screenshotElement = document.getElementById('media-screenshot');
            screenshotElement.innerHTML = `<img src="${screenshotData}" alt="Screenshot da Imagem" style="max-width: 20%; height: auto;">`;
        } else {
            alert('Nenhuma mídia encontrada na página ou a mídia não possui o atributo "crossorigin=anonymous".');
        }        
    });

    addModalStyles();
}

// Função para enviar dados para a API
async function sendDataToAPI(data, modal) {
    const apiUrl = "https://rodrigowebteste.app.n8n.cloud/webhook-test/a261af5c-d76f-4ede-98f9-ff1584b8fc42";
    const loadingMessage = document.createElement("div");
    loadingMessage.textContent = "Enviando dados, por favor, aguarde...";
    document.body.appendChild(loadingMessage);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    // Captura a imagem do modal
    const screenshotElement = document.getElementById('media-screenshot').querySelector('img');
    const imageBase64 = screenshotElement ? screenshotElement.src : null;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                copypaste: data.copypaste,
                URLInsights: data.url,
                imageScreenshot: imageBase64, // Enviar a imagem capturada
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