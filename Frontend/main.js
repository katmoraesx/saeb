// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // 1. Verificar Autenticação (Proteção da Rota)
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        // Se não logado, redireciona para o login (Requisito 5.1.2)
        window.location.href = 'index.html';
        return;
    }

    // 2. Exibir Nome do Usuário (Requisito 5.1.1)
    const username = localStorage.getItem('logged_username') || 'Usuário';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = username;
    }

    // 3. Configurar o Botão de Logout (Requisito 5.1.2)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        // Assumindo que a função logout está acessível globalmente (ou foi importada/exportada corretamente)
        logoutBtn.addEventListener('click', logout); 
    }
});