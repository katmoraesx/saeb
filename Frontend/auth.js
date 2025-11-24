// js/auth.js

const API_URL = 'http://localhost:8000/api/'; 

// Torna o logout acessível globalmente
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('logged_username');
    window.location.href = 'index.html'; 
}

// Lógica de Login (anexada ao DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Se estiver em main.html, cadatro.html ou estoque.html, 
    // garante que o botão de logout funcione.
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';

    try {
        const response = await fetch(API_URL + 'token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('logged_username', username);
            window.location.href = 'main.html'; 
        } else {
            // Requisito 4.1: Falha de autenticação
            errorMessage.textContent = 'Falha de autenticação. Verifique seu usuário e senha.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'Erro de conexão com o servidor.';
        errorMessage.style.display = 'block';
    }
    
}