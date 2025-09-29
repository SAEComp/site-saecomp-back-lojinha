-- Adiciona ordens de compra
INSERT INTO buy_orders (user_id, date, status) VALUES
    (1, '2025-09-01', 'pendingPayment'),
    (2, '2025-09-02', 'finishedPayment'),
    (1, '2025-09-03', 'canceled');

-- Adiciona itens relacionados às ordens de compra
-- Supondo que os produtos com id 1, 2, 3 já existem
INSERT INTO items (product_id, buy_order_id, quantity, value) VALUES
    (1, 1, 2, 0.20),  -- 2 unidades do produto 1 na ordem 1
    (2, 1, 1, 0.10),  -- 1 unidade do produto 2 na ordem 1
    (3, 2, 3, 8.50),   -- 3 unidades do produto 3 na ordem 2
    (1, 3, 1, 10.00);  -- 1 unidade do produto 1 na ordem 3