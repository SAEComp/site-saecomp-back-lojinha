CREATE TYPE category AS ENUM(sweet, salty, drink);

CREATE TABLE IF NOT EXISTS produto(
	id				BIGSERIAL 	PRIMARY KEY,
	name 			TEXT 		NOT NULL,
	value			REAL		NOT NULL,
	description		TEXT		NOT NULL,
	quantity		INTEGER		CHECK(quantity >= 0),
	barCode			VCHAR(13)	UNIQUE ,
	softDelete		BOOLEAN		DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS historyProduct(
	id				BIGSERIAL	PRIMARY KEY,
	entryDate		DATE 		NOT NULL DEFAULT CURRENT_DATE,
	entryquantity	INTEGER		CHECK(quantity >= 0)
);

