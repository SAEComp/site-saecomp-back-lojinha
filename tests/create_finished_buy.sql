INSERT INTO products (name, value, description, quantity, category)
VALUES
  ('Coca-Cola', 5.00, 'Refrigerante', 100, 'drink'),
  ('Coxinha', 7.00, 'Salgado', 50, 'salty'),
  ('Brigadeiro', 3.00, 'Doce', 200, 'sweet');

INSERT INTO buy_orders (user_id, date, status)
VALUES
  (1, '2025-09-01', 'finishedPayment'),
  (2, '2025-09-02', 'pendingPayment'),
  (1, '2025-09-03', 'canceled'),
  (2, '2025-09-04', 'cart');

INSERT INTO items (product_id, buy_order_id, quantity, value)
VALUES
  (1, 1, 2, 5.00),   -- Coca-Cola, pedido 1, João, pago
  (2, 1, 1, 7.00),   -- Coxinha, pedido 1, João, pago
  (3, 2, 3, 3.00),   -- Brigadeiro, pedido 2, Maria, pendente
  (1, 3, 1, 5.00);   -- Coca-Cola, pedido 3, João, cancelado