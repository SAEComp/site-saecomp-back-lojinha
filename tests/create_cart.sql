-- Cria um pedido (carrinho) para o usuário 1
INSERT INTO buy_orders (user_id, status)
VALUES (1, 'cart');

-- Descobre o id do carrinho criado
-- (Se precisar manualmente, rode: SELECT id FROM buy_orders WHERE user_id=1 AND status='cart';)

-- Adiciona itens ao carrinho (supondo que o id do carrinho seja 1)
INSERT INTO items (product_id, buy_order_id, quantity, value)
VALUES 
  (1, 1, 2, 0.21),   -- 2 coxinhas
  (2, 1, 1, 0.21),   -- 1 suco
  (3, 1, 1, 0.21),
  (4, 1, 1, 0.21),
  (5, 1, 2, 0.51),   -- 2 coxinhas
  (6, 1, 1, 0.21),   -- 1 suco
  (7, 1, 1, 0.21),
  (8, 1, 1, 0.21),
  (9, 1, 1, 0.21);