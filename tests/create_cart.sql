-- Adiciona produtos de exemplo
INSERT INTO products (name, value, description, quantity, bar_code, img_url, category)
VALUES 
  ('Coxinha', 5.00, 'Coxinha de frango', 10, '1234567890123', 'img/coxinha.jpg', 'salty'),
  ('Suco', 3.50, 'Suco de laranja', 20, '1234567890124', 'img/suco.jpg', 'drink');

-- Cria um pedido (carrinho) para o usuário 1
INSERT INTO buy_orders (user_id, status)
VALUES (1, 'cart');

-- Descobre o id do carrinho criado
-- (Se precisar manualmente, rode: SELECT id FROM buy_orders WHERE user_id=1 AND status='cart';)

-- Adiciona itens ao carrinho (supondo que o id do carrinho seja 1)
INSERT INTO items (product_id, buy_order_id, quantity, value)
VALUES 
  (1, 1, 5, 5.00),   -- 2 coxinhas
  (2, 1, 4, 3.50);   -- 1 suco

-- Atualiza produtos para testar atualização de itens
UPDATE products
SET 
	value = 3, 
	quantity = 2
WHERE products.id = 1;

UPDATE products
SET 
	value = 2, 
	quantity = 2
WHERE products.id = 2;
