// js/estoque.js

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de estoque
    if (document.getElementById('inventoryTable')) {
        loadInventoryAndSetup();
        document.getElementById('btnEntry').addEventListener('click', handleMovement);
        document.getElementById('btnExit').addEventListener('click', handleMovement);
    }
});

let inventoryData = []; // Para armazenar o estado atual do inventário

// Carrega produtos e movimentos
async function loadInventoryAndSetup() {
    const products = await apiGet('products/');
    const movements = await apiGet('movements/');

    if (products) {
        inventoryData = products;
        renderInventory(products);
        populateProductSelector(products);
        checkLowStock(products); // Verifica alertas
    }

    if (movements) {
        renderMovementHistory(movements);
    }
}

// Requisito 7.1.1: Listar produtos no inventário e status
function renderInventory(products) {
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = tableBody.insertRow();
        const isLowStock = product.quantity < product.min_quantity;

        row.insertCell().textContent = product.name;
        row.insertCell().textContent = product.sku || '-';
        row.insertCell().textContent = product.quantity;
        row.insertCell().textContent = product.min_quantity;
        
        const statusCell = row.insertCell();
        if (isLowStock) {
            // Estilo de alerta vermelho/laranja para estoque baixo
            statusCell.innerHTML = '<span class="low-stock">BAIXO</span>';
        } else {
            statusCell.textContent = 'OK';
        }
    });
}

// Requisito 7.1.4: Verificar estoque mínimo e gerar alerta
function checkLowStock(products) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = '';
    
    const lowStockItems = products.filter(p => p.quantity < p.min_quantity);
    
    if (lowStockItems.length > 0) {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('message', 'error');
        alertDiv.innerHTML = `⚠️ **ALERTA DE ESTOQUE BAIXO:** ${lowStockItems.length} produto(s) abaixo do nível mínimo: ${lowStockItems.map(p => p.name).join(', ')}.`;
        alertContainer.appendChild(alertDiv);
    }
}

// Requisito 7.1.2: Popular o selector de produtos
function populateProductSelector(products) {
    const selector = document.getElementById('productSelector');
    selector.innerHTML = '<option value="">-- Selecione um Produto --</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (Estoque: ${product.quantity})`;
        selector.appendChild(option);
    });
}

// Requisito 7.1.2: Registrar a movimentação (Entrada/Saída)
async function handleMovement(event) {
    event.preventDefault();
    
    const movementType = event.target.getAttribute('data-type'); // 'IN' ou 'OUT'
    const productId = document.getElementById('productSelector').value;
    const amount = parseInt(document.getElementById('amount').value);
    const notes = document.getElementById('notes').value;
    const messageContainer = document.getElementById('movementMessageContainer');
    messageContainer.innerHTML = '';

    if (!productId || isNaN(amount) || amount <= 0) {
        showMessageMovement('Selecione um produto e insira uma quantidade válida.', 'error');
        return;
    }
    
    // Validação extra para Saída (evita estoque negativo)
    if (movementType === 'OUT') {
        const currentProduct = inventoryData.find(p => p.id == productId);
        if (currentProduct && currentProduct.quantity < amount) {
            showMessageMovement('Erro: A quantidade de saída excede o estoque atual.', 'error');
            return;
        }
    }

    const endpoint = `products/${productId}/adjust/`; // Endpoint customizado do Django
    const response = await apiPost(endpoint, {
        amount: amount,
        movement_type: movementType,
        notes: notes
    });

    if (response && response.ok) {
        showMessageMovement(`Movimentação de ${movementType === 'IN' ? 'Entrada' : 'Saída'} registrada com sucesso!`, 'success');
        document.getElementById('productSelector').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('notes').value = '';
        loadInventoryAndSetup(); // Recarrega os dados para atualização do estoque e alertas
    } else {
        const errorText = response ? await response.text() : 'Erro desconhecido.';
        showMessageMovement(`Falha ao registrar a movimentação. Erro: ${errorText}`, 'error');
    }
}

// Renderiza o histórico de movimentações (opcional, mas bom para rastreabilidade)
function renderMovementHistory(movements) {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '';

    // Limita para os 10 mais recentes
    movements.slice(0, 10).forEach(m => {
        const row = tableBody.insertRow();
        // O select_related('product') e 'performed_by' no backend garante que esses dados estejam disponíveis
        const productName = m.product ? m.product.name : 'N/A';
        const userName = m.performed_by ? m.performed_by.username : 'Sistema';
        const typeLabel = m.movement_type === 'IN' ? 'Entrada' : 'Saída';

        row.insertCell().textContent = productName;
        row.insertCell().textContent = typeLabel;
        row.insertCell().textContent = m.amount;
        row.insertCell().textContent = userName;
        row.insertCell().textContent = new Date(m.created_at).toLocaleString('pt-BR');
    });
}

// Função para exibir mensagens na tela de movimentação
function showMessageMovement(msg, type) {
    const container = document.getElementById('movementMessageContainer');
    container.innerHTML = `<div class="message ${type}">${msg}</div>`;
}