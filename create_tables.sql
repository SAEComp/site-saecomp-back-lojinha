DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_t') THEN
        CREATE TYPE category_t AS ENUM('sweet', 'salty', 'drink');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_t') THEN
        CREATE TYPE status_t AS ENUM('cart', 'pendingPayment', 'canceled' ,'finishedPayment');
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
	value			REAL			CHECK(value >= 0) NOT NULL,
	description		TEXT			NOT NULL,
	quantity		INTEGER			CHECK(quantity >= 0) NOT NULL,
	bar_code		CHAR(13)		UNIQUE ,
	soft_delete		BOOLEAN			DEFAULT FALSE,
	img_url			TEXT			DEFAULT NULL,			
	category		category_t		NOT NULL
);

CREATE TABLE IF NOT EXISTS entry_histories(
	id				BIGSERIAL	PRIMARY KEY,
	product_id		BIGINT 		NOT NULL REFERENCES products(id) ON DELETE CASCADE, 
	date			TIMESTAMP 	NOT NULL DEFAULT CURRENT_TIMESTAMP,
	value			REAL		CHECK(value >= 0) NOT NULL,
	quantity		INTEGER		NOT NULL
);

CREATE TABLE IF NOT EXISTS buy_orders(
	id				BIGSERIAL			PRIMARY KEY,
	user_id			BIGINT 				REFERENCES users(id) ON DELETE CASCADE,
	date			TIMESTAMP 			NOT NULL DEFAULT CURRENT_TIMESTAMP,
	status			status_t			NOT NULL DEFAULT 'cart'
);

CREATE TABLE IF NOT EXISTS items(
	id				BIGSERIAL				PRIMARY KEY,
	product_id		BIGINT					NOT NULL REFERENCES products(id) ON DELETE CASCADE,
	buy_order_id	BIGINT 					NOT NULL REFERENCES buy_orders(id) ON DELETE CASCADE,
	quantity		INTEGER					CHECK(quantity >= 1) NOT NULL,
	value			REAL					CHECK(value >= 0) NOT NULL,
	CONSTRAINT 		unique_cart_product 	UNIQUE (buy_order_id, product_id)
);

CREATE TABLE IF NOT EXISTS comments(
	id				BIGSERIAL		PRIMARY KEY,
	user_id			BIGINT 			NOT NULL REFERENCES users(id),
	content			TEXT			NOT NULL,
	date 			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS punctuations(
	user_id			BIGINT 			PRIMARY KEY NOT NULL REFERENCES users(id),
	score			INTEGER			CHECK(score >= 0) NOT NULL
);

CREATE TABLE IF NOT EXISTS pix_keys(
	id				BIGSERIAL		PRIMARY KEY,
	name			TEXT			NOT NULL,
	city			TEXT			NOT NULL,
	pix_key         TEXT			DEFAULT NULL,		
	token			TEXT			NOT NULL
);

CREATE TABLE IF NOT EXISTS pix_payments(
	buy_order_id	BIGINT 			PRIMARY KEY NOT NULL REFERENCES buy_orders(id) ON DELETE CASCADE,
	payment_id		TEXT 			NOT NULL,
	qr_code			TEXT			NOT NULL,
	pix_copia_cola	TEXT			NOT NULL
);