-- =============================================================
-- Vite & Gourmand — PostgreSQL database creation script
-- Usage : psql -U <user> -d vitegourmand -f schema.sql
-- The script can be run again: it drops and recreates every table.
-- Data model: docs/data-model.md
-- =============================================================

SET client_min_messages = warning;

BEGIN;

DROP TABLE IF EXISTS
  review,
  order_status_history,
  customer_order,
  dish_allergen,
  menu_dish,
  dish,
  menu_image,
  menu,
  allergen,
  diet,
  theme,
  password_reset_token,
  app_user,
  role,
  opening_hours
CASCADE;

-- -------------------------------------------------------------
-- Reference tables
-- -------------------------------------------------------------

CREATE TABLE role (
  role_id  SMALLINT    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label    VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE theme (
  theme_id  INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label     VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE diet (
  diet_id  INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label    VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE allergen (
  allergen_id  INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label        VARCHAR(50) NOT NULL UNIQUE
);

-- -------------------------------------------------------------
-- Users
-- -------------------------------------------------------------

CREATE TABLE app_user (
  user_id          INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_id          SMALLINT     NOT NULL REFERENCES role (role_id),
  email            VARCHAR(255) NOT NULL,
  password_hash    VARCHAR(255) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  first_name       VARCHAR(100) NOT NULL,
  phone            VARCHAR(20)  NOT NULL,
  address          VARCHAR(255) NOT NULL,
  postcode         VARCHAR(10)  NOT NULL,
  city             VARCHAR(100) NOT NULL,
  is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
  gdpr_consent_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT app_user_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Emails are unique whatever the case (Jose@... = jose@...)
CREATE UNIQUE INDEX app_user_email_unique ON app_user (lower(email));

-- An administrator account can only be created by the SQL script (KAN-37):
-- inserting a user with the admin role, or promoting a user to admin, is refused
-- unless the script enables it with SET LOCAL app.allow_admin_creation = 'on'.
CREATE OR REPLACE FUNCTION prevent_admin_creation() RETURNS trigger AS $$
BEGIN
  IF NEW.role_id = (SELECT role_id FROM role WHERE label = 'admin')
     AND (TG_OP = 'INSERT' OR OLD.role_id IS DISTINCT FROM NEW.role_id)
     AND coalesce(current_setting('app.allow_admin_creation', true), '') <> 'on' THEN
    RAISE EXCEPTION 'Administrator accounts can only be created by the SQL script';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_user_prevent_admin_creation
  BEFORE INSERT OR UPDATE OF role_id ON app_user
  FOR EACH ROW EXECUTE FUNCTION prevent_admin_creation();

-- Password reset: only the SHA-256 hash of the token is stored
CREATE TABLE password_reset_token (
  token_id    INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     INT         NOT NULL REFERENCES app_user (user_id) ON DELETE CASCADE,
  token_hash  CHAR(64)    NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------
-- Menus and dishes
-- -------------------------------------------------------------

CREATE TABLE menu (
  menu_id      INT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  theme_id     INT           NOT NULL REFERENCES theme (theme_id),
  diet_id      INT           NOT NULL REFERENCES diet (diet_id),
  title        VARCHAR(100)  NOT NULL UNIQUE,
  description  TEXT          NOT NULL,
  min_people   INT           NOT NULL CHECK (min_people > 0),
  -- Price of the menu for min_people people (price per person = min_price / min_people)
  min_price    NUMERIC(10,2) NOT NULL CHECK (min_price > 0),
  conditions   TEXT          NOT NULL DEFAULT '',
  -- Number of orders still possible for this menu
  stock        INT           NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE menu_image (
  image_id  INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  menu_id   INT          NOT NULL REFERENCES menu (menu_id) ON DELETE CASCADE,
  url       VARCHAR(500) NOT NULL,
  alt_text  VARCHAR(255) NOT NULL DEFAULT '',
  position  SMALLINT     NOT NULL DEFAULT 0,
  UNIQUE (menu_id, position)
);

CREATE TABLE dish (
  dish_id      INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         VARCHAR(150) NOT NULL UNIQUE,
  course       VARCHAR(10)  NOT NULL CHECK (course IN ('starter', 'main', 'dessert')),
  description  TEXT         NOT NULL DEFAULT ''
);

-- Many-to-many: a menu has several dishes, a dish can be in several menus
CREATE TABLE menu_dish (
  menu_id  INT NOT NULL REFERENCES menu (menu_id) ON DELETE CASCADE,
  dish_id  INT NOT NULL REFERENCES dish (dish_id) ON DELETE RESTRICT,
  PRIMARY KEY (menu_id, dish_id)
);

CREATE TABLE dish_allergen (
  dish_id      INT NOT NULL REFERENCES dish (dish_id) ON DELETE CASCADE,
  allergen_id  INT NOT NULL REFERENCES allergen (allergen_id) ON DELETE RESTRICT,
  PRIMARY KEY (dish_id, allergen_id)
);

CREATE INDEX menu_theme_idx ON menu (theme_id);
CREATE INDEX menu_diet_idx ON menu (diet_id);
CREATE INDEX menu_dish_dish_idx ON menu_dish (dish_id);

-- -------------------------------------------------------------
-- Orders
-- -------------------------------------------------------------

CREATE TABLE customer_order (
  order_id            INT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_number        VARCHAR(20)   NOT NULL UNIQUE,
  user_id             INT           NOT NULL REFERENCES app_user (user_id) ON DELETE RESTRICT,
  menu_id             INT           NOT NULL REFERENCES menu (menu_id) ON DELETE RESTRICT,
  people              INT           NOT NULL CHECK (people > 0),
  -- Event / delivery
  event_address       VARCHAR(255)  NOT NULL,
  event_postcode      VARCHAR(10)   NOT NULL,
  event_city          VARCHAR(100)  NOT NULL,
  event_date          DATE          NOT NULL,
  event_time          TIME          NOT NULL,
  place_details       VARCHAR(300)  NOT NULL DEFAULT '',
  delivery_km         NUMERIC(6,1)  NOT NULL DEFAULT 0 CHECK (delivery_km >= 0),
  -- Prices copied when the order is placed (later menu price changes do not affect it)
  menu_price          NUMERIC(10,2) NOT NULL CHECK (menu_price >= 0),
  discount            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  delivery_price      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_price >= 0),
  total_price         NUMERIC(10,2) NOT NULL,
  status              VARCHAR(30)   NOT NULL DEFAULT 'pending',
  equipment_loan      BOOLEAN       NOT NULL DEFAULT FALSE,
  equipment_returned  BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT customer_order_status_check CHECK (status IN (
    'pending', 'accepted', 'preparing', 'delivering', 'delivered',
    'awaiting_equipment_return', 'completed', 'cancelled'
  )),
  CONSTRAINT customer_order_total_check
    CHECK (total_price = menu_price - discount + delivery_price)
);

-- One row per status change (date/time), plus the contact method and the reason
-- when an employee edits or cancels the order
CREATE TABLE order_status_history (
  history_id      INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id        INT          NOT NULL REFERENCES customer_order (order_id) ON DELETE CASCADE,
  status          VARCHAR(30)  NOT NULL,
  changed_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  changed_by      INT          REFERENCES app_user (user_id) ON DELETE SET NULL,
  contact_method  VARCHAR(10)  CHECK (contact_method IN ('phone', 'email')),
  reason          TEXT,
  CONSTRAINT order_status_history_status_check CHECK (status IN (
    'pending', 'accepted', 'preparing', 'delivering', 'delivered',
    'awaiting_equipment_return', 'completed', 'cancelled'
  ))
);

CREATE INDEX customer_order_user_idx ON customer_order (user_id);
CREATE INDEX customer_order_menu_idx ON customer_order (menu_id);
CREATE INDEX customer_order_status_idx ON customer_order (status);
CREATE INDEX order_status_history_order_idx ON order_status_history (order_id, changed_at);

-- -------------------------------------------------------------
-- Reviews
-- -------------------------------------------------------------

-- One review per completed order; displayed on the home page once approved
CREATE TABLE review (
  review_id     INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id      INT         NOT NULL UNIQUE REFERENCES customer_order (order_id) ON DELETE CASCADE,
  user_id       INT         NOT NULL REFERENCES app_user (user_id) ON DELETE CASCADE,
  rating        SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT        NOT NULL CHECK (length(comment) BETWEEN 1 AND 1000),
  status        VARCHAR(10) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by  INT         REFERENCES app_user (user_id) ON DELETE SET NULL,
  moderated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX review_status_idx ON review (status);

-- -------------------------------------------------------------
-- Opening hours (shown in the footer, edited by employees)
-- -------------------------------------------------------------

CREATE TABLE opening_hours (
  day_of_week  SMALLINT PRIMARY KEY CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Monday
  open_time    TIME,
  close_time   TIME,
  is_closed    BOOLEAN  NOT NULL DEFAULT FALSE,
  CONSTRAINT opening_hours_times_check CHECK (
    is_closed
    OR (open_time IS NOT NULL AND close_time IS NOT NULL AND open_time < close_time)
  )
);

COMMIT;
