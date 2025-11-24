// js/api.js

const API_BASE_URL = 'http://localhost:8000/api/';

// Função para obter o cabeçalho de autenticação. Se falhar, força o logout.
function getAuthHeaders(hasBody = true) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        // Proteção de rota / Redirecionamento
        logout(); 
        return null;
    }
    const headers = {
        'Authorization': `Bearer ${token}`, 
    };
    if (hasBody) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
}

// GET: Para listar e buscar produtos e movimentos
async function apiGet(endpoint) {
    const headers = getAuthHeaders(false);
    if (!headers) return null;

    try {
        const response = await fetch(API_BASE_URL + endpoint, {
            method: 'GET',
            headers: headers,
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return null;
        }

        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error('Erro na requisição GET:', error);
        return null;
    }
}

// POST: Para criar novos produtos ou registrar movimentos (adjust)
async function apiPost(endpoint, data) {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        return await fetch(API_BASE_URL + endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error('Erro na requisição POST:', error);
        return { ok: false };
    }
}

// PUT: Para atualizar produtos existentes
async function apiPut(endpoint, data) {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        return await fetch(API_BASE_URL + endpoint, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error('Erro na requisição PUT:', error);
        return { ok: false };
    }
}

// DELETE: Para excluir produtos
async function apiDelete(endpoint) {
    const headers = getAuthHeaders(false);
    if (!headers) return;

    try {
        return await fetch(API_BASE_URL + endpoint, {
            method: 'DELETE',
            headers: headers,
        });
    } catch (error) {
        console.error('Erro na requisição DELETE:', error);
        return { ok: false };
    }
}