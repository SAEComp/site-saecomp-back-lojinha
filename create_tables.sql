CREATE TYPE category_type AS ENUM(sweet, salty, drink);
CREATE TYPE status_type AS ENUM(cart, pendingPayment, finishedPayment);

CREATE TABLE IF NOT EXISTS product(
	id				BIGSERIAL 		PRIMARY KEY,
	name 			TEXT 			NOT NULL,
	value			REAL			NOT NULL,
	description		TEXT			NOT NULL,
	quantity		INTEGER			CHECK(quantity >= 0),
	barCode			VCHAR(13)		UNIQUE ,
	softDelete		BOOLEAN			DEFAULT FALSE,
	category		category_type	NOT NULL
);

CREATE TABLE IF NOT EXISTS entryHistory(
	id				BIGSERIAL	PRIMARY KEY,
	product_id		INT 		NOT NULL REFERENCES product(id) ON DELETE CASCADE, 
	date			DATE 		NOT NULL DEFAULT CURRENT_DATE,
	quantity		INTEGER		CHECK(quantity >= 0)
);

CREATE TABLE IF NOT EXISTS order(
	id				BIGSERIAL		PRIMARY KEY,
	user_id			INT 			NOT NULL REFRENCES user(id) ON DELETE CASCADE,
	date			DATE 			NOT NULL DEFAULT CURRENT_DATE,
	status			status_type		NOT NULL DEFAULT cart
);

CREATE TABLE IF NOT EXISTS item(
	id				BIGSERIAL		PRIMARY KEY,
	product_id		INT				NOT NULL REFERENCES product(id) ON DELETE CASCADE,
	order_id		INT 			NOT NULL REFERENCES order(id) ON DELETE CASCADE,
	quantity		INTEGER			CHECK(quantity >= 0)
);

CREATE TABLE IF NOT EXISTS comment(
	id				BIGSERIAL		PRIMARY KEY,
	user_id			INT 			NOT NULL REFERENCES user(id),
	content			TEXT			NOT NULL
);

create table if not exists users (
    id serial primary key,
    google_sub text not null unique,
    name text,
    email text not null,
    role text check (role in ('admin', 'user')) default 'user',
    nusp varchar(10) unique,
    created_at timestamp with time zone default now()
);