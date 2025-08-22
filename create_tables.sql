CREATE TYPE category_type AS ENUM('sweet', 'salty', 'drink');
CREATE TYPE status_type AS ENUM('cart', 'pendingPayment', 'finishedPayment');

create table if not exists users (
    id serial primary key,
    google_sub text not null unique,
    name text,
    email text not null,
    role text check (role in ('admin', 'user')) default 'user',
    nusp varchar(10) unique,
    created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS products(
	id				BIGSERIAL 		PRIMARY KEY,
	name 			TEXT 			NOT NULL,
	value			REAL			NOT NULL,
	description		TEXT			NOT NULL,
	quantity		INTEGER			CHECK(quantity >= 0),
	bar_code		CHAR(13)		UNIQUE ,
	soft_delete		BOOLEAN			DEFAULT FALSE,
	category		category_t		NOT NULL
);

CREATE TABLE IF NOT EXISTS entry_histories(
	id				BIGSERIAL	PRIMARY KEY,
	products_id		INT 		NOT NULL REFERENCES products(id) ON DELETE CASCADE, 
	date			DATE 		NOT NULL DEFAULT CURRENT_DATE,
	quantity		INTEGER		CHECK(quantity >= 0)
);

CREATE TABLE IF NOT EXISTS buy_orders(
	id				BIGSERIAL		PRIMARY KEY,
	users_id		INT 			NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	date			DATE 			NOT NULL DEFAULT CURRENT_DATE,
	status			status_type		NOT NULL DEFAULT 'cart'
);

CREATE TABLE IF NOT EXISTS items(
	id				BIGSERIAL		PRIMARY KEY,
	products_id		INT				NOT NULL REFERENCES products(id) ON DELETE CASCADE,
	buyOrders_id	INT 			NOT NULL REFERENCES buyOrders(id) ON DELETE CASCADE,
	quantity		INTEGER			CHECK(quantity >= 0)
);

CREATE TABLE IF NOT EXISTS comments(
	id				BIGSERIAL		PRIMARY KEY,
	users_id		INT 			NOT NULL REFERENCES users(id),
	content			TEXT			NOT NULL
);