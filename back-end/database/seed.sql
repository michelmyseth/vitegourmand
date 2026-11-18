-- =============================================================
-- Vite & Gourmand — demo data
-- Run after schema.sql : psql -U <user> -d vitegourmand -f seed.sql
-- Demo accounts and passwords are listed above each INSERT and in the README.
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

-- -------------------------------------------------------------
-- Dishes and allergens
-- -------------------------------------------------------------

INSERT INTO dish (name, course) VALUES
  ('Velouté de potimarron', 'starter'),
  ('Foie gras et chutney de figues', 'starter'),
  ('Salade de chèvre chaud', 'starter'),
  ('Houmous et légumes croquants', 'starter'),
  ('Dinde farcie aux marrons', 'main'),
  ('Gigot d''agneau et flageolets', 'main'),
  ('Couscous aux sept légumes', 'main'),
  ('Risotto aux champignons', 'main'),
  ('Curry de légumes au lait de coco', 'main'),
  ('Bûche chocolat praliné', 'dessert'),
  ('Nid de Pâques au chocolat', 'dessert'),
  ('Tarte aux pommes', 'dessert'),
  ('Salade de fruits frais', 'dessert');

INSERT INTO dish_allergen (dish_id, allergen_id)
SELECT d.dish_id, a.allergen_id
FROM (VALUES
  ('Velouté de potimarron', 'Lait'),
  ('Foie gras et chutney de figues', 'Gluten'),
  ('Salade de chèvre chaud', 'Lait'),
  ('Salade de chèvre chaud', 'Gluten'),
  ('Salade de chèvre chaud', 'Fruits à coque'),
  ('Houmous et légumes croquants', 'Sésame'),
  ('Dinde farcie aux marrons', 'Céleri'),
  ('Couscous aux sept légumes', 'Gluten'),
  ('Couscous aux sept légumes', 'Céleri'),
  ('Risotto aux champignons', 'Lait'),
  ('Bûche chocolat praliné', 'Lait'),
  ('Bûche chocolat praliné', 'Œufs'),
  ('Bûche chocolat praliné', 'Gluten'),
  ('Bûche chocolat praliné', 'Fruits à coque'),
  ('Nid de Pâques au chocolat', 'Lait'),
  ('Nid de Pâques au chocolat', 'Œufs'),
  ('Nid de Pâques au chocolat', 'Gluten'),
  ('Tarte aux pommes', 'Gluten'),
  ('Tarte aux pommes', 'Œufs'),
  ('Tarte aux pommes', 'Lait')
) AS v (dish, allergen)
JOIN dish d ON d.name = v.dish
JOIN allergen a ON a.label = v.allergen;

-- -------------------------------------------------------------
-- Menus
-- -------------------------------------------------------------

INSERT INTO menu (title, description, theme_id, diet_id, min_people, min_price, stock, conditions)
SELECT v.title, v.description, t.theme_id, d.diet_id, v.min_people, v.min_price, v.stock, v.conditions
FROM (VALUES
  (1, 'Menu de Noël',
   'Un repas de fête traditionnel pour réunir toute la famille autour de la table.',
   'Noël', 'Classique', 6, 180.00, 5,
   'Commande au minimum 2 semaines avant la prestation. À conserver au réfrigérateur (entre 0 et 4 °C) et à consommer dans les 48 h.'),
  (2, 'Menu de Pâques',
   'Un menu printanier autour de l''agneau et du chocolat.',
   'Pâques', 'Classique', 4, 110.00, 8,
   'Commande au minimum 10 jours avant la prestation. À conserver au réfrigérateur.'),
  (3, 'Menu Classique',
   'Nos incontournables de saison, pour un repas simple et généreux.',
   'Classique', 'Classique', 2, 45.00, 20,
   'Commande au minimum 3 jours avant la prestation.'),
  (4, 'Menu Végétarien',
   'Une cuisine de saison sans viande ni poisson, pleine de saveurs.',
   'Classique', 'Végétarien', 2, 40.00, 15,
   'Commande au minimum 3 jours avant la prestation.'),
  (5, 'Menu Vegan',
   '100 % végétal, sans aucun produit d''origine animale.',
   'Classique', 'Vegan', 2, 42.00, 0,
   'Commande au minimum 5 jours avant la prestation.'),
  (6, 'Menu Événement',
   'Pour vos réceptions, anniversaires et événements d''entreprise. Matériel de service prêté.',
   'Événement', 'Classique', 20, 500.00, 3,
   'Commande au minimum 3 semaines avant la prestation. Le matériel prêté doit être restitué sous 10 jours ouvrés, sinon 600 € de frais seront facturés (voir CGV).')
) AS v (ord, title, description, theme, diet, min_people, min_price, stock, conditions)
JOIN theme t ON t.label = v.theme
JOIN diet d ON d.label = v.diet
ORDER BY v.ord; -- keep ids in this order (same ids as the front-end mock data)

INSERT INTO menu_dish (menu_id, dish_id)
SELECT m.menu_id, d.dish_id
FROM (VALUES
  ('Menu de Noël', 'Velouté de potimarron'),
  ('Menu de Noël', 'Foie gras et chutney de figues'),
  ('Menu de Noël', 'Dinde farcie aux marrons'),
  ('Menu de Noël', 'Bûche chocolat praliné'),
  ('Menu de Pâques', 'Salade de chèvre chaud'),
  ('Menu de Pâques', 'Gigot d''agneau et flageolets'),
  ('Menu de Pâques', 'Nid de Pâques au chocolat'),
  ('Menu Classique', 'Velouté de potimarron'),
  ('Menu Classique', 'Couscous aux sept légumes'),
  ('Menu Classique', 'Tarte aux pommes'),
  ('Menu Végétarien', 'Salade de chèvre chaud'),
  ('Menu Végétarien', 'Velouté de potimarron'),
  ('Menu Végétarien', 'Risotto aux champignons'),
  ('Menu Végétarien', 'Tarte aux pommes'),
  ('Menu Vegan', 'Houmous et légumes croquants'),
  ('Menu Vegan', 'Curry de légumes au lait de coco'),
  ('Menu Vegan', 'Salade de fruits frais'),
  ('Menu Événement', 'Foie gras et chutney de figues'),
  ('Menu Événement', 'Houmous et légumes croquants'),
  ('Menu Événement', 'Gigot d''agneau et flageolets'),
  ('Menu Événement', 'Risotto aux champignons'),
  ('Menu Événement', 'Bûche chocolat praliné'),
  ('Menu Événement', 'Salade de fruits frais')
) AS v (menu, dish)
JOIN menu m ON m.title = v.menu
JOIN dish d ON d.name = v.dish;

-- Images are served by the front-end (public/img/menus/)
INSERT INTO menu_image (menu_id, url, alt_text, position)
SELECT m.menu_id, '/img/menus/couscous.jpg', m.title || ' — photo ' || g.n, g.n
FROM menu m
CROSS JOIN generate_series(1, 2) AS g (n);

-- -------------------------------------------------------------
-- Administrator account (José) — KAN-37
-- This is the ONLY way to create an administrator: no API route allows it,
-- and a trigger refuses it unless enabled for this transaction.
--   jose@vitegourmand.fr / Admin#Jose2026!   (change it after the first login)
-- -------------------------------------------------------------

SET LOCAL app.allow_admin_creation = 'on';

INSERT INTO app_user (role_id, email, password_hash, last_name, first_name, phone, address, postcode, city, gdpr_consent_at)
SELECT role_id, 'jose@vitegourmand.fr',
       '$2b$10$dpyW1zCUrELUISOpUyHHy.nPmMB9RHzE1qmLlh7nvfo7LURKv9y9W',
       'Gourmand', 'José', '0556000000', '10 quai des Chartrons', '33000', 'Bordeaux', now()
FROM role WHERE label = 'admin';

SET LOCAL app.allow_admin_creation = 'off';

-- -------------------------------------------------------------
-- Demo accounts (employee + customers)
-- Passwords (bcrypt, cost 10):
--   employee : julie.employe@vitegourmand.fr / Employe#2026!
--   users    : marie.dupont@example.com, thomas.martin@example.com / Client#2026!
-- -------------------------------------------------------------

INSERT INTO app_user (role_id, email, password_hash, last_name, first_name, phone, address, postcode, city, gdpr_consent_at)
SELECT r.role_id, v.email, v.password_hash, v.last_name, v.first_name, v.phone, v.address, v.postcode, v.city, now()
FROM (VALUES
  ('employee', 'julie.employe@vitegourmand.fr',
   '$2b$10$s8tpjrO7FY5Aaz5zi9.OCeArz14wlTtayMJPvk2AHXQPpdbnJRoZy',
   'Martin', 'Julie', '0612345678', '8 rue Sainte-Catherine', '33000', 'Bordeaux'),
  ('user', 'marie.dupont@example.com',
   '$2b$10$okd5be.d6U2hHOyVRKZEVumHv/6ZmXOWkiXb5mFHwy8FeIrZlFBIe',
   'Dupont', 'Marie', '0687654321', '25 cours de l''Intendance', '33000', 'Bordeaux'),
  ('user', 'thomas.martin@example.com',
   '$2b$10$okd5be.d6U2hHOyVRKZEVumHv/6ZmXOWkiXb5mFHwy8FeIrZlFBIe',
   'Martin', 'Thomas', '0711223344', '12 avenue de la Marne', '33700', 'Mérignac')
) AS v (role, email, password_hash, last_name, first_name, phone, address, postcode, city)
JOIN role r ON r.label = v.role;

-- -------------------------------------------------------------
-- Demo orders (one per main status)
-- Prices follow the rules of front-end/src/utils/pricing.js
-- -------------------------------------------------------------

INSERT INTO customer_order (
  order_number, user_id, menu_id, people,
  event_address, event_postcode, event_city, event_date, event_time, delivery_km,
  menu_price, discount, delivery_price, total_price, status, equipment_loan, created_at
)
SELECT v.order_number, u.user_id, m.menu_id, v.people,
       v.address, v.postcode, v.city, v.event_date, v.event_time, v.km,
       v.menu_price, v.discount, v.delivery_price, v.menu_price - v.discount + v.delivery_price,
       v.status, v.equipment_loan, v.created_at
FROM (VALUES
  -- 6 people, Bordeaux: 180.00, no discount, free delivery
  ('VG-2026-0001', 'marie.dupont@example.com', 'Menu de Noël', 6,
   '25 cours de l''Intendance', '33000', 'Bordeaux', DATE '2026-10-10', TIME '19:00', 0.0,
   180.00, 0.00, 0.00, 'completed', FALSE, TIMESTAMPTZ '2026-09-20 10:15+02'),
  -- 4 people, Bordeaux: 4 x 22.50
  ('VG-2026-0002', 'thomas.martin@example.com', 'Menu Classique', 4,
   '3 place de la Bourse', '33000', 'Bordeaux', DATE '2026-10-18', TIME '12:30', 0.0,
   90.00, 0.00, 0.00, 'completed', FALSE, TIMESTAMPTZ '2026-10-12 18:40+02'),
  -- 8 people (>= 2 + 5): 180.00 - 10 %, Mérignac 5 km: 5 + 0.59 x 5 = 7.95
  ('VG-2026-0003', 'marie.dupont@example.com', 'Menu Classique', 8,
   '12 avenue de la Marne', '33700', 'Mérignac', DATE '2026-11-08', TIME '20:00', 5.0,
   180.00, 18.00, 7.95, 'completed', FALSE, TIMESTAMPTZ '2026-11-01 09:05+01'),
  -- 25 people (>= 20 + 5): 625.00 - 10 %, Pessac 8.2 km: 5 + 0.59 x 8.2 = 9.84, equipment lent
  ('VG-2026-0004', 'thomas.martin@example.com', 'Menu Événement', 25,
   '1 avenue Pey Berland', '33600', 'Pessac', DATE '2026-11-14', TIME '18:00', 8.2,
   625.00, 62.50, 9.84, 'awaiting_equipment_return', TRUE, TIMESTAMPTZ '2026-10-20 14:30+02'),
  ('VG-2026-0005', 'marie.dupont@example.com', 'Menu Végétarien', 2,
   '25 cours de l''Intendance', '33000', 'Bordeaux', DATE '2026-11-30', TIME '19:30', 0.0,
   40.00, 0.00, 0.00, 'cancelled', FALSE, TIMESTAMPTZ '2026-11-15 11:00+01'),
  ('VG-2026-0006', 'thomas.martin@example.com', 'Menu de Pâques', 4,
   '12 avenue de la Marne', '33700', 'Mérignac', DATE '2026-12-20', TIME '12:00', 5.0,
   110.00, 0.00, 7.95, 'accepted', FALSE, TIMESTAMPTZ '2026-11-16 16:20+01'),
  ('VG-2026-0007', 'marie.dupont@example.com', 'Menu de Noël', 10,
   '25 cours de l''Intendance', '33000', 'Bordeaux', DATE '2026-12-24', TIME '19:00', 0.0,
   300.00, 0.00, 0.00, 'pending', FALSE, TIMESTAMPTZ '2026-11-17 21:45+01')
) AS v (order_number, email, menu, people, address, postcode, city, event_date, event_time, km,
        menu_price, discount, delivery_price, status, equipment_loan, created_at)
JOIN app_user u ON u.email = v.email
JOIN menu m ON m.title = v.menu
ORDER BY v.order_number;

-- Status history (date/time of every change)
INSERT INTO order_status_history (order_id, status, changed_at, changed_by, contact_method, reason)
SELECT o.order_id, v.status, v.changed_at, e.user_id, v.contact_method, v.reason
FROM (VALUES
  ('VG-2026-0001', 'pending',    TIMESTAMPTZ '2026-09-20 10:15+02', NULL, NULL::varchar, NULL),
  ('VG-2026-0001', 'accepted',   TIMESTAMPTZ '2026-09-21 09:00+02', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0001', 'preparing',  TIMESTAMPTZ '2026-10-10 08:00+02', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0001', 'delivering', TIMESTAMPTZ '2026-10-10 17:30+02', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0001', 'delivered',  TIMESTAMPTZ '2026-10-10 18:45+02', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0001', 'completed',  TIMESTAMPTZ '2026-10-11 10:00+02', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0002', 'pending',    TIMESTAMPTZ '2026-10-12 18:40+02', NULL, NULL, NULL),
  ('VG-2026-0002', 'accepted',   TIMESTAMPTZ '2026-10-13 09:10+02', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0002', 'delivered',  TIMESTAMPTZ '2026-10-18 12:20+02', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0002', 'completed',  TIMESTAMPTZ '2026-10-19 09:00+02', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0003', 'pending',    TIMESTAMPTZ '2026-11-01 09:05+01', NULL, NULL, NULL),
  ('VG-2026-0003', 'accepted',   TIMESTAMPTZ '2026-11-02 10:00+01', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0003', 'delivered',  TIMESTAMPTZ '2026-11-08 19:40+01', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0003', 'completed',  TIMESTAMPTZ '2026-11-09 09:00+01', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0004', 'pending',    TIMESTAMPTZ '2026-10-20 14:30+02', NULL, NULL, NULL),
  ('VG-2026-0004', 'accepted',   TIMESTAMPTZ '2026-10-21 09:30+02', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0004', 'preparing',  TIMESTAMPTZ '2026-11-14 08:00+01', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0004', 'delivering', TIMESTAMPTZ '2026-11-14 16:30+01', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0004', 'delivered',  TIMESTAMPTZ '2026-11-14 17:40+01', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0004', 'awaiting_equipment_return', TIMESTAMPTZ '2026-11-15 10:00+01', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0005', 'pending',    TIMESTAMPTZ '2026-11-15 11:00+01', NULL, NULL, NULL),
  ('VG-2026-0005', 'cancelled',  TIMESTAMPTZ '2026-11-16 14:05+01', 'julie.employe@vitegourmand.fr', 'phone',
   'Cliente jointe par téléphone : événement reporté, annulation à sa demande.'),
  ('VG-2026-0006', 'pending',    TIMESTAMPTZ '2026-11-16 16:20+01', NULL, NULL, NULL),
  ('VG-2026-0006', 'accepted',   TIMESTAMPTZ '2026-11-17 09:15+01', 'julie.employe@vitegourmand.fr', NULL, NULL),
  ('VG-2026-0007', 'pending',    TIMESTAMPTZ '2026-11-17 21:45+01', NULL, NULL, NULL)
) AS v (order_number, status, changed_at, employee_email, contact_method, reason)
JOIN customer_order o ON o.order_number = v.order_number
LEFT JOIN app_user e ON e.email = v.employee_email;

-- -------------------------------------------------------------
-- Reviews (only on completed orders)
-- -------------------------------------------------------------

INSERT INTO review (order_id, user_id, rating, comment, status, moderated_by, moderated_at, created_at)
SELECT o.order_id, o.user_id, v.rating, v.comment, v.status,
       CASE WHEN v.status <> 'pending' THEN e.user_id END,
       CASE WHEN v.status <> 'pending' THEN v.created_at + INTERVAL '1 day' END,
       v.created_at
FROM (VALUES
  ('VG-2026-0001', 5, 'Un Noël parfait : tout était délicieux et livré à l''heure. Merci Julie et José !',
   'approved', TIMESTAMPTZ '2026-10-12 20:00+02'),
  ('VG-2026-0002', 4, 'Très bon couscous, portions généreuses. Je recommande.',
   'approved', TIMESTAMPTZ '2026-10-20 12:00+02'),
  ('VG-2026-0003', 5, 'Repas d''anniversaire réussi, les invités ont adoré la tarte aux pommes.',
   'pending', TIMESTAMPTZ '2026-11-10 18:30+01')
) AS v (order_number, rating, comment, status, created_at)
JOIN customer_order o ON o.order_number = v.order_number
CROSS JOIN (SELECT user_id FROM app_user WHERE email = 'julie.employe@vitegourmand.fr') e;

COMMIT;
