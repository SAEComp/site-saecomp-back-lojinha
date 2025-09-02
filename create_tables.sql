DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_t') THEN
        CREATE TYPE category_t AS ENUM('sweet', 'salty', 'drink');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_t') THEN
        CREATE TYPE status_t AS ENUM('cart', 'pendingPayment', 'finishedPayment');
    END IF;
END$$;

-- create table if not exists users (
--     id serial primary key,
--     google_sub text not null unique,
--     name text,
--     email text not null,
--     role text check (role in ('admin', 'user')) default 'user',
--     nusp varchar(10) unique,
--     created_at timestamp with time zone default now()
-- );

CREATE TABLE IF NOT EXISTS products(
	id				BIGSERIAL 		PRIMARY KEY,
	name 			TEXT 			NOT NULL,
	value			REAL			NOT NULL,
	description		TEXT			NOT NULL,
	quantity		INTEGER			CHECK(quantity >= 0),
	bar_code		CHAR(13)		UNIQUE ,
	soft_delete		BOOLEAN			DEFAULT FALSE,
	img_url			TEXT			NOT NULL,			
	category		category_t		NOT NULL
);

CREATE TABLE IF NOT EXISTS entry_histories(
	id				BIGSERIAL	PRIMARY KEY,
	product_id		INT 		NOT NULL REFERENCES products(id) ON DELETE CASCADE, 
	date			DATE 		NOT NULL DEFAULT CURRENT_DATE,
	quantity		INTEGER		CHECK(quantity >= 0)
);

CREATE TABLE IF NOT EXISTS buy_orders(
	id				BIGSERIAL			PRIMARY KEY,
	user_id		INT 					NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	date			DATE 				NOT NULL DEFAULT CURRENT_DATE,
	status			status_t			NOT NULL DEFAULT 'cart',
);

CREATE TABLE IF NOT EXISTS items(
	id				BIGSERIAL				PRIMARY KEY,
	product_id		INT						NOT NULL REFERENCES products(id) ON DELETE CASCADE,
	buy_order_id	INT 					NOT NULL REFERENCES buy_orders(id) ON DELETE CASCADE,
	quantity		INTEGER					CHECK(quantity >= 0),
	CONSTRAINT 		unique_cart_product 	UNIQUE (buy_order_id, product_id)
);

CREATE TABLE IF NOT EXISTS comments(
	id				BIGSERIAL		PRIMARY KEY,
	user_id			INT 			NOT NULL REFERENCES users(id),
	content			TEXT			NOT NULL
);