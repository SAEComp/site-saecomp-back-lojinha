-- Adiciona uma ordem de compra para o usuário 1
INSERT INTO buy_orders (user_id, status) VALUES (1, 'cart');

-- Adiciona itens à ordem de compra recém-criada (assumindo que o id da ordem criada é 1)
INSERT INTO items (product_id, buy_order_id, quantity) VALUES
    (1, 1, 2),  -- Refrigerante
    (2, 1, 1),  -- Salgadinho
    (3, 1, 3);  -- Chocolate

-- Adiciona uma segunda ordem de compra para o usuário 2
INSERT INTO buy_orders (user_id, status) VALUES (2, 'pendingPayment');

-- Adiciona itens à segunda ordem de compra (assumindo que o id da ordem criada é 2)
INSERT INTO items (product_id, buy_order_id, quantity) VALUES
    (4, 2, 1),  -- Suco
    (5, 2, 2);  -- Batata frita