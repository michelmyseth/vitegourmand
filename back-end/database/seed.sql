-- =============================================================
-- Vite & Gourmand — demo data
-- Run after schema.sql : psql -U <user> -d vitegourmand -f seed.sql
-- Demo accounts and passwords: see the README.
-- =============================================================

SET client_min_messages = warning;

BEGIN;

-- -------------------------------------------------------------
-- Reference data
-- -------------------------------------------------------------

INSERT INTO role (label) VALUES ('user'), ('employee'), ('admin');

INSERT INTO theme (label) VALUES ('Noël'), ('Pâques'), ('Classique'), ('Événement');

INSERT INTO diet (label) VALUES ('Classique'), ('Végétarien'), ('Vegan');

-- The 14 major allergens (EU regulation 1169/2011)
INSERT INTO allergen (label) VALUES
  ('Gluten'), ('Crustacés'), ('Œufs'), ('Poissons'), ('Arachides'), ('Soja'), ('Lait'),
  ('Fruits à coque'), ('Céleri'), ('Moutarde'), ('Sésame'), ('Sulfites'), ('Lupin'), ('Mollusques');

-- -------------------------------------------------------------
-- Opening hours (1 = Monday ... 7 = Sunday)
-- -------------------------------------------------------------

INSERT INTO opening_hours (day_of_week, open_time, close_time, is_closed) VALUES
  (1, '09:00', '18:00', FALSE),
  (2, '09:00', '18:00', FALSE),
  (3, '09:00', '18:00', FALSE),
  (4, '09:00', '18:00', FALSE),
  (5, '09:00', '19:00', FALSE),
  (6, '10:00', '16:00', FALSE),
  (7, NULL, NULL, TRUE);

COMMIT;
