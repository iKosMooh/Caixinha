-- Caixinha: Pantry/stock tracker schema
-- All ids use bigserial for simplicity with raw pg driver

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enum types
DO $$ BEGIN
  CREATE TYPE location_kind AS ENUM ('armario', 'geladeira', 'congelador', 'despensa', 'outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE lot_status AS ENUM ('fechado', 'aberto', 'acabou');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE movement_type AS ENUM ('in', 'out_used', 'out_wasted', 'adjust');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Master product catalog
CREATE TABLE IF NOT EXISTS products (
  id          BIGSERIAL PRIMARY KEY,
  barcode     TEXT UNIQUE,
  name        TEXT NOT NULL,
  brand       TEXT,
  image_url   TEXT,
  default_category TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Physical storage locations
CREATE TABLE IF NOT EXISTS locations (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  kind location_kind NOT NULL
);

-- Seed default locations
INSERT INTO locations (name, kind)
SELECT name, kind::location_kind FROM (VALUES
  ('Armário',   'armario'),
  ('Geladeira', 'geladeira'),
  ('Congelador','congelador'),
  ('Despensa',  'despensa'),
  ('Outro',     'outro')
) AS v(name, kind)
WHERE NOT EXISTS (SELECT 1 FROM locations);

-- Lots: one row per purchased batch of a product
CREATE TABLE IF NOT EXISTS lots (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id BIGINT NOT NULL REFERENCES locations(id),
  qty         INT NOT NULL DEFAULT 1 CHECK (qty >= 0),
  status      lot_status NOT NULL DEFAULT 'fechado',
  expiry_date DATE,
  entered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opened_at   TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_lots_product_id   ON lots(product_id);
CREATE INDEX IF NOT EXISTS idx_lots_expiry_date  ON lots(expiry_date);
CREATE INDEX IF NOT EXISTS idx_lots_status       ON lots(status);

-- All stock movements (audit log + ML input)
CREATE TABLE IF NOT EXISTS stock_movements (
  id          BIGSERIAL PRIMARY KEY,
  lot_id      BIGINT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  type        movement_type NOT NULL,
  qty         INT NOT NULL DEFAULT 1,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note        TEXT
);

CREATE INDEX IF NOT EXISTS idx_movements_lot_id      ON stock_movements(lot_id);
CREATE INDEX IF NOT EXISTS idx_movements_occurred_at ON stock_movements(occurred_at);

-- Shopping list (mix of product refs and free-text items)
CREATE TABLE IF NOT EXISTS shopping_list (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT REFERENCES products(id) ON DELETE SET NULL,
  free_text   TEXT,
  qty         INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_at  TIMESTAMPTZ
);

-- App settings: generic key-value store (used for PIN, etc.)
CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ML prediction cache: updated by background server action
CREATE TABLE IF NOT EXISTS consumption_predictions (
  product_id           BIGINT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  predicted_days_to_empty NUMERIC,
  predicted_runout_at  DATE,
  computed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: keep lot.qty and status in sync with movements
CREATE OR REPLACE FUNCTION sync_lot_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'in' THEN
    UPDATE lots SET qty = qty + NEW.qty WHERE id = NEW.lot_id;
  ELSIF NEW.type IN ('out_used', 'out_wasted') THEN
    UPDATE lots
    SET
      qty        = GREATEST(qty - NEW.qty, 0),
      status     = CASE WHEN qty - NEW.qty <= 0 THEN 'acabou' ELSE status END,
      finished_at = CASE WHEN qty - NEW.qty <= 0 THEN NOW() ELSE finished_at END
    WHERE id = NEW.lot_id;
  ELSIF NEW.type = 'adjust' THEN
    -- qty field in movement holds new absolute value
    UPDATE lots
    SET
      qty     = GREATEST(NEW.qty, 0),
      status  = CASE WHEN NEW.qty <= 0 THEN 'acabou' ELSE status END
    WHERE id = NEW.lot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_lot_on_movement ON stock_movements;
CREATE TRIGGER trg_sync_lot_on_movement
AFTER INSERT ON stock_movements
FOR EACH ROW EXECUTE FUNCTION sync_lot_on_movement();

-- Convenience views
CREATE OR REPLACE VIEW v_expiring_soon AS
  SELECT l.*, p.name AS product_name, p.image_url, loc.name AS location_name
  FROM lots l
  JOIN products p  ON p.id = l.product_id
  JOIN locations loc ON loc.id = l.location_id
  WHERE l.expiry_date IS NOT NULL
    AND l.expiry_date >= CURRENT_DATE
    AND l.expiry_date <= CURRENT_DATE + INTERVAL '7 days'
    AND l.status != 'acabou'
  ORDER BY l.expiry_date ASC;

CREATE OR REPLACE VIEW v_expired AS
  SELECT l.*, p.name AS product_name, p.image_url, loc.name AS location_name
  FROM lots l
  JOIN products p  ON p.id = l.product_id
  JOIN locations loc ON loc.id = l.location_id
  WHERE l.expiry_date IS NOT NULL
    AND l.expiry_date < CURRENT_DATE
    AND l.status != 'acabou'
  ORDER BY l.expiry_date ASC;

CREATE OR REPLACE VIEW v_low_stock AS
  SELECT p.id AS product_id, p.name, p.image_url,
         SUM(l.qty) AS total_qty
  FROM lots l
  JOIN products p ON p.id = l.product_id
  WHERE l.status != 'acabou'
  GROUP BY p.id, p.name, p.image_url
  HAVING SUM(l.qty) <= 2
  ORDER BY total_qty ASC;

-- App user permissions (replace 'ikosmooh' with your DB_USER if different)
DO $$
DECLARE app_user TEXT := current_user;
BEGIN
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE products, locations, lots, stock_movements, shopping_list, consumption_predictions, app_settings TO %I', app_user);
  EXECUTE format('GRANT SELECT ON TABLE v_expiring_soon, v_expired, v_low_stock TO %I', app_user);
  EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE products_id_seq, locations_id_seq, lots_id_seq, stock_movements_id_seq, shopping_list_id_seq TO %I', app_user);
END $$;

-- 1. Garante acesso ao schema public (onde as tabelas estão)
GRANT USAGE ON SCHEMA public TO public;

-- 2. Garante leitura em todas as tabelas atuais e futuras
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO public;

-- 3. Garante leitura em todas as views (v_expired, etc)
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

-- 4. Caso o erro persista para as VIEWS especificamente:
GRANT SELECT ON v_expiring_soon TO public;
GRANT SELECT ON v_expired TO public;
GRANT SELECT ON v_low_stock TO public;

-- 1. Garante que o usuário possa usar as sequências (geradores de ID)
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO public;

-- 2. Garante que o usuário possa interagir com todas as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO public;