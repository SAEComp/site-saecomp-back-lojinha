-- Apaga tabelas (usa IF EXISTS e CASCADE para ignorar dependências/ordem)
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS entry_histories CASCADE;
DROP TABLE IF EXISTS buy_orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Apaga tipos ENUM
DROP TYPE IF EXISTS category_t;
DROP TYPE IF EXISTS status_t;

