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

COMMIT;
