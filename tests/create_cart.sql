-- Cria um pedido (carrinho) para o usuário 1
INSERT INTO buy_orders (user_id, status)
VALUES (1, 'cart');

-- Descobre o id do carrinho criado
-- (Se precisar manualmente, rode: SELECT id FROM buy_orders WHERE user_id=1 AND status='cart';)

-- Adiciona itens ao carrinho (supondo que o id do carrinho seja 1)
INSERT INTO items (product_id, buy_order_id, quantity, value)
VALUES 
  (1, 1, 2, 0.51),   -- 2 coxinhas
  (2, 1, 1, 1.11);   -- 1 suco