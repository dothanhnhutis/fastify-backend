-- config database
ALTER DATABASE pgdb
SET datestyle = 'ISO, MDY';
-- DROP TABLE IF EXISTS "PackagingTransaction";
-- CreateTable
CREATE TABLE IF NOT EXISTS users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    username TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id)
);
-- CreateTable
CREATE TABLE IF NOT EXISTS roles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    permissions TEXT [],
    created_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    CONSTRAINT roles_pkey PRIMARY KEY (id)
);
-- CreateTable
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id)
);
-- CreateEnum
CREATE TYPE transaction_type AS ENUM ('IMPORT', 'EXPORT', 'ADJUST');
-- CreateTable
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    CONSTRAINT warehouses_pkey PRIMARY KEY (id)
);
-- CreateTable
CREATE TABLE IF NOT EXISTS packagings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    CONSTRAINT packagings_pkey PRIMARY KEY (id)
);
-- CreateTable
CREATE TABLE IF NOT EXISTS packaging_stock_items (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL,
    packaging_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    CONSTRAINT packaging_stock_items_pkey PRIMARY KEY (id)
);
-- CreateTable
CREATE TABLE IF NOT EXISTS packaging_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    stock_item_id UUID NOT NULL,
    type transaction_type NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    CONSTRAINT packaging_transactions_pkey PRIMARY KEY (id)
);
--- updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at := now();
RETURN NEW;
END;
$$;
-- CreateIndex
CREATE UNIQUE INDEX users_email_key ON users(email);
-- CreateIndex
CREATE UNIQUE INDEX packaging_stock_items_warehouse_id_packaging_id_key ON packaging_stock_items(warehouse_id, packaging_id);
-- AddForeignKey
ALTER TABLE user_roles
ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE user_roles
ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE packaging_stock_items
ADD CONSTRAINT packaging_stock_items_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE packaging_stock_items
ADD CONSTRAINT packaging_stock_items_packaging_id_fkey FOREIGN KEY (packaging_id) REFERENCES packagings(id) ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE packaging_transactions
ADD CONSTRAINT packaging_transactions_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES packaging_stock_items(id) ON DELETE RESTRICT ON UPDATE CASCADE;