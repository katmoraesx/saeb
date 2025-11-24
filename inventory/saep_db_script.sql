-- ENTREGA 3.1: Nomear o banco de dados como "saep_db"
CREATE DATABASE IF NOT EXISTS saep_db DEFAULT CHARACTER SET utf8;
USE saep_db;

-- AVISO: Em um projeto real, as tabelas de usuário (auth_user) são criadas pelo framework.
-- Para que as chaves estrangeiras funcionem no script standalone, criamos uma versão simplificada:
CREATE TABLE auth_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    email VARCHAR(254) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined DATETIME NOT NULL
) DEFAULT CHARSET=utf8;

-- Criação da tabela de Produtos (products_product)
CREATE TABLE products_product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(100) NULL, -- Pode ser nulo
    description TEXT NULL, -- Pode ser nulo/em branco
    quantity INTEGER NOT NULL DEFAULT 0, -- Estoque atual
    min_quantity INTEGER NOT NULL DEFAULT 0, -- Estoque mínimo para alerta
    created_at DATETIME NOT NULL
) DEFAULT CHARSET=utf8;

-- Criação da tabela de Movimentações (products_stockmovement)
CREATE TABLE products_stockmovement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    movement_type VARCHAR(3) NOT NULL, -- 'IN' (Entrada) ou 'OUT' (Saída)
    amount INTEGER NOT NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL,
    performed_by_id INT NULL, -- Chave estrangeira para o usuário que realizou
    
    -- Definição das Chaves Estrangeiras (3.2: Respeitando todas as chaves primárias e estrangeiras)
    FOREIGN KEY (product_id) REFERENCES products_product(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by_id) REFERENCES auth_user(id) ON DELETE SET NULL -- SET_NULL é usado no modelo
) DEFAULT CHARSET=utf8;

-- Inserção de dados de exemplo (População do Banco de Dados)

-- 1. Inserir Usuários de Exemplo
INSERT INTO auth_user (id, username, first_name, date_joined) VALUES
(1, 'almoxarife', 'João', NOW()),
(2, 'supervisor', 'Maria', NOW());

-- 2. Inserir Produtos de Exemplo
INSERT INTO products_product (id, name, sku, quantity, min_quantity, created_at) VALUES
(101, 'Martelo de Unha 23mm', 'MTO001', 500, 100, NOW()),
(102, 'Chave de Fenda Philips 6mm', 'CFP002', 1200, 250, NOW()),
(103, 'Alicate Universal 8 Polegadas', 'AU8003', 80, 50, NOW()); -- Estoque baixo!

-- 3. Inserir Movimentações de Estoque de Exemplo
INSERT INTO products_stockmovement (product_id, movement_type, amount, performed_by_id, notes, created_at) VALUES
-- Martelo (Entrada inicial e Saída)
(101, 'IN', 500, 1, 'Carga inicial do lote 2025/A', NOW()),
(101, 'OUT', 50, 2, 'Saída para linha de montagem X', NOW()),
-- Chave de Fenda (Entrada)
(102, 'IN', 1200, 1, 'Compra Fornecedor ABC', NOW()),
-- Alicate (Entrada inicial)
(103, 'IN', 80, 2, 'Carga inicial', NOW());