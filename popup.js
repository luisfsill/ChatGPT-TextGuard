document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('toggle');
    const statusText = document.getElementById('status');

    // Carregar o estado salvo ao abrir o popup
    chrome.storage.sync.get('isActive', function (data) {
        toggle.checked = !!data.isActive;
        statusText.textContent = data.isActive ? 'Ligado' : 'Desligado';
    });

    // Escuta mudanças no toggle e salva o estado
    toggle.addEventListener('change', function () {
        const isActive = toggle.checked;
        chrome.storage.sync.set({ isActive: isActive }, function () {
            statusText.textContent = isActive ? 'Ligado' : 'Desligado';
            // Aqui você pode adicionar código para ativar/desativar a funcionalidade
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: setExtensionState,
                    args: [isActive]
                });
            });
        });
    });
});

// Função que será executada na aba atual para definir o estado da extensão
function setExtensionState(isActive) {
    if (isActive) {
        // Ativar a funcionalidade (adicionar listeners, etc.)
        console.log('ChatGPT TextGuard Ligado');
    } else {
        // Desativar a funcionalidade (remover listeners, etc.)
        console.log('ChatGPT TextGuard Desligado');
    }
}
