// js/products.js

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de cadastro
    if (document.getElementById('productForm')) {
        loadProducts();
        document.getElementById('productForm').addEventListener('submit', handleSaveProduct);
        document.getElementById('searchBtn').addEventListener('click', handleSearch);
        document.getElementById('cancelEditBtn').addEventListener('click', resetForm);
    }
});

let allProducts = []; // Armazena todos os produtos para facilitar a busca

// Requisito 6.1.1: Listar produtos
async function loadProducts() {
    const data = await apiGet('products/');
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = ''; // Limpa a tabela
    
    if (data && data.length > 0) {
        allProducts = data; // Salva para busca
        renderProducts(data);
    } else {
        tableBody.innerHTML = '<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>';
    }
}

function renderProducts(products) {
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = product.name;
        row.insertCell().textContent = product.sku || '-';
        row.insertCell().textContent = product.quantity;
        row.insertCell().textContent = product.min_quantity;
        
        const actionCell = row.insertCell();
        
        // Botão para Edição (Requisito 6.1.4)
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.classList.add('action-button');
        editBtn.style.marginRight = '5px';
        editBtn.onclick = () => fillFormForEdit(product);
        actionCell.appendChild(editBtn);
        
        // Botão para Exclusão (Requisito 6.1.5)
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Excluir';
        deleteBtn.classList.add('action-button');
        deleteBtn.style.backgroundColor = '#D32F2F'; // Cor de perigo
        deleteBtn.onclick = () => handleDeleteProduct(product.id);
        actionCell.appendChild(deleteBtn);
    });
}

// Requisito 6.1.2: Implementar campo de busca
function handleSearch(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    
    if (!searchTerm) {
        renderProducts(allProducts); // Se vazio, mostra todos
        return;
    }

    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        (p.sku && p.sku.toLowerCase().includes(searchTerm))
    );
    
    renderProducts(filtered);
}

// Requisito 6.1.3 e 6.1.4: Inserir ou Editar
async function handleSaveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const isEditing = !!productId;
    
    const productData = {
        name: document.getElementById('name').value,
        sku: document.getElementById('sku').value,
        description: document.getElementById('description').value,
        min_quantity: parseInt(document.getElementById('min_quantity').value),
        // quantity não é editado no cadastro para evitar inconsistência
    };

    // Requisito 6.1.6: Validação de dados (exemplo básico)
    if (!productData.name || isNaN(productData.min_quantity) || productData.min_quantity < 0) {
        showMessage('Por favor, preencha o nome do produto e o estoque mínimo com um valor válido.', 'error');
        return;
    }

    let response;
    if (isEditing) {
        response = await apiPut(`products/${productId}/`, productData);
    } else {
        response = await apiPost('products/', productData);
    }
    
    if (response && response.ok) {
        showMessage(`Produto ${isEditing ? 'editado' : 'cadastrado'} com sucesso!`, 'success');
        resetForm();
        loadProducts();
    } else {
        const errorData = response ? await response.json() : {};
        const errorMsg = errorData.name ? `Erro de validação: ${errorData.name[0]}` : 'Erro ao salvar o produto. Verifique os dados.';
        showMessage(errorMsg, 'error');
    }
}

// Função auxiliar para preencher o formulário no modo edição
function fillFormForEdit(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('sku').value = product.sku || '';
    document.getElementById('description').value = product.description || '';
    document.getElementById('min_quantity').value = product.min_quantity;
    
    document.getElementById('saveProductBtn').textContent = 'Atualizar Produto';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    
    // Rola a página para o topo para mostrar o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função auxiliar para limpar o formulário
function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('saveProductBtn').textContent = 'Salvar Produto';
    document.getElementById('cancelEditBtn').style.display = 'none';
    hideMessage();
}

// Requisito 6.1.5: Excluir produto
async function handleDeleteProduct(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    const response = await apiDelete(`products/${id}/`);
    
    if (response && response.ok) {
        showMessage('Produto excluído com sucesso!', 'success');
        loadProducts();
    } else {
        showMessage('Erro ao excluir o produto. Pode haver movimentações associadas.', 'error');
    }
}

// Função para exibir mensagens (success/error)
function showMessage(msg, type) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="message ${type}">${msg}</div>`;
}

function hideMessage() {
    document.getElementById('messageContainer').innerHTML = '';
}