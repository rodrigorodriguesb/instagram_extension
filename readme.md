
# Estrutura de pastas:
 
- **`manifest.json`**: Este é o arquivo central da extensão, onde são especificadas as configurações, permissões e informações essenciais para o funcionamento da extensão no Chrome.

- **`background.js`**: Este arquivo gerencia eventos em segundo plano e interações com a API do Chrome. Ele é responsável por responder a ações do usuário, como cliques no ícone da extensão.

- **`content.js`**: Este script é executado na página do Instagram, coletando dados e interagindo com o conteúdo da página. Ele implementa a lógica principal da extensão para capturar informações relevantes.

- **`style.css`**: Este arquivo contém as definições de estilo que determinam a aparência da interface da extensão, incluindo modais e botões, assegurando que a visualização seja atraente e funcional.

# Documentação do Manifesto: `manifest.json`

## Descrição Geral
Este arquivo define a extensão "Captura de Dados Instagram", especificando suas configurações e permissões.

## Principais Campos

### 1. `manifest_version`
- **Valor**: `3`
- **Descrição**: Versão do manifesto, a mais recente, garantindo melhorias em segurança e desempenho.

### 2. `name`
- **Valor**: `"Captura de Dados Instagram"`
- **Descrição**: Nome da extensão.

### 3. `version`
- **Valor**: `"1.0"`
- **Descrição**: Versão atual da extensão.

### 4. `description`
- **Valor**: `"Uma extensão para capturar dados do Instagram ao clicar no ícone da extensão."`
- **Descrição**: Breve descrição das funcionalidades.

### 5. `permissions`
- **Descrição**: Permissões necessárias para a extensão:
  - `"activeTab"`: Acesso à aba ativa.
  - `"scripting"`: Permissão para injetar scripts.

### 6. `background`
- **Configuração**: 
  - `"service_worker"`: `"background.js"`
  - **Descrição**: Gerencia eventos em segundo plano.

### 7. `action`
- **Configuração**: 
  - `"default_icon"`: `"icon.png"`
  - **Descrição**: Ícone da extensão na barra de ferramentas.

### 8. `host_permissions`
- **Descrição**: Permite acesso a todas as URLs (`http://*/*` e `https://*/*`).




# Documentação: `backgroud.js`

## Descrição da Função
Este código adiciona um ouvinte para o clique no ícone da extensão do Chrome. Quando o ícone é clicado, ele executa o script `content.js` na aba atual.

### Funcionamento
- **Evento**: `chrome.action.onClicked.addListener`
  - Registra uma função que é chamada ao clicar no ícone da extensão.
- **Execução do Script**: 
  - Utiliza `chrome.scripting.executeScript` para injetar `content.js` na aba ativa.
  - O script é executado no contexto da página, permitindo interações com o conteúdo da aba.






### Documentação do Código: `content.js`

## Descrição Geral
Este script é responsável por extrair dados de interações em uma página do Instagram e exibir essas informações em um modal. Ele coleta dados relevantes, formata-os e permite o envio para uma API externa.

## Funcionalidades

### 1. Execução Inicial
- **Função Autoexecutável**: O código é iniciado automaticamente ao ser carregado, chamando a função `extractInstagramData()` para coletar os dados.

### 2. Extração de Dados do Instagram
- **Função `extractInstagramData()`**: 
  - Captura a URL atual da página.
  - Define uma lista de palavras-chave relacionadas a interações no Instagram.
  - Para cada palavra-chave, busca números associados na página usando a função `findNumberNearText()`.
  - Cria uma string formatada (copypaste) contendo os dados capturados.

### 3. Busca de Números Associados
- **Função `findNumberNearText(searchText)`**: 
  - Recebe um texto de busca e procura elementos na página (`span`, `div`, `p`).
  - Retorna o primeiro número encontrado próximo ao texto especificado.

### 4. Exibição de Dados em Modal
- **Função `displayModal(data)`**: 
  - Cria e exibe um modal na página com os dados coletados.
  - Inclui botões para fechar o modal ou enviar os dados para uma API.
  - Exibe uma mensagem de erro se nenhum dado for encontrado.

### 5. Envio de Dados para API
- **Função `sendDataToAPI(data, modal)`**: 
  - Envia os dados coletados para uma API externa usando o método `fetch`.
  - Mostra uma mensagem de carregamento enquanto os dados estão sendo enviados.
  - Lida com erros e exibe mensagens apropriadas ao usuário.

### 6. Estilização do Modal
- **Função `addModalStyles()`**: 
  - Adiciona um arquivo CSS externo para estilizar o modal, garantindo que a interface seja visualmente agradável.

## Estrutura de Dados
- **Objeto `data`**: Contém os dados extraídos, incluindo:
  - `url`: URL da página.
  - Palavras-chave como "Curtidas", "Seguidores", entre outras, armazenando seus valores correspondentes.
  - `copypaste`: String formatada com os dados prontos para copiar.

