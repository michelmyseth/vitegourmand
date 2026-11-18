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

-- Password reset: only the SHA-256 hash of the token is stored
CREATE TABLE password_reset_token (
  token_id    INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     INT         NOT NULL REFERENCES app_user (user_id) ON DELETE CASCADE,
  token_hash  CHAR(64)    NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
