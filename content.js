async function interceptText() {
  const apiUrl = url;
  const subscriptionKey = key;

  let textarea = document.getElementById('prompt-textarea');
  let sendButton = document.querySelector('button[data-testid="send-button"]');

  if (!textarea || !sendButton) return false;

  let originalText = textarea.value;
   
  sendButton.disabled = true; 
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey
      },
      body: JSON.stringify({
        "kind": "PiiEntityRecognition",
        "parameters": {
          "modelVersion": "latest"
        },
        "analysisInput": {
          "documents": [
            {
              "id": "1",
              "language": "pt",
              "text": originalText
            }
          ]
        }
      })
    });
    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }
    const data = await response.json();
    const redactedText = data.results.documents[0].redactedText;
    const entities = data.results.documents[0].entities;
  
    textarea.value = redactedText;
  
    if (entities.length > 0) {
      let entityDetails = 'Seu texto foi descaracterizado!\n\nCategoria:\n';
      entities.forEach(entity => {
        entityDetails += `Texto: ${entity.text}\nCategoria: ${entity.category}\n\n`;
      });
      alert(entityDetails);
    }  
    return true;
  } catch (error) {
    console.error('Erro ao enviar o texto para a API:', error);
    alert(`Erro ao enviar o texto para a API: ${error.message}`);
    return false;
  } finally {
}
}

let isProcessing = false;

async function handleEnterKey(event) {
  if (isProcessing) return; // Evita que o evento seja processado novamente

  const textarea = event.target;
  if (textarea && textarea.id === 'prompt-textarea' && event.key === 'Enter' && !event.shiftKey) {
    // Verifica se o valor do textarea não está vazio
    if (textarea.value.trim() === '') {
      console.log('Textarea is empty. Action will not be executed.');
      return;
    }

    event.preventDefault(); 
    event.stopImmediatePropagation();
    isProcessing = true;
    try {
      const success = await interceptText();
      const submitButton = document.querySelector('button[data-testid="send-button"]');
      if (submitButton) {
        submitButton.disabled = false;
        if (success) {
          submitButton.click();
        }
      }
    } finally {
      isProcessing = false; 
    }
  }
}

async function handleButtonClick(event) {
  if (isProcessing) return; // Evita que o evento seja processado novamente

  const button = document.querySelector('button[data-testid="send-button"]');
  if (button && button.contains(event.target)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    isProcessing = true;
    try {
      const success = await interceptText();
      button.disabled = false;
      if (success) {
        button.click(); // Simula o envio do formulário se a resposta da API foi válida
      }
    } finally {
      isProcessing = false; // Permite novos eventos
    }
  }
}

function addEventListeners() {
  const textarea = document.getElementById('prompt-textarea');
  const sendButton = document.querySelector('button[data-testid="send-button"]');
  
  if (sendButton) {
    sendButton.removeEventListener('click', handleButtonClick, true);
    sendButton.addEventListener('click', handleButtonClick, true);
  }

  if (textarea) {
    textarea.removeEventListener('keydown', handleEnterKey, true);
    textarea.addEventListener('keydown', handleEnterKey, true);
  }
}

const observer = new MutationObserver(() => {
  addEventListeners();
});
observer.observe(document.body, { childList: true, subtree: true });

addEventListeners();

