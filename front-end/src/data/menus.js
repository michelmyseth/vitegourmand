import couscous from '@/assets/img/couscous.jpg'

// Mock data — replace by API calls later (menus are managed by employees/admin)
const dishes = {
  veloute: { name: 'Velouté de potimarron', allergens: ['Lait'] },
  foieGras: { name: 'Foie gras et chutney de figues', allergens: ['Gluten'] },
  saladeChevre: { name: 'Salade de chèvre chaud', allergens: ['Lait', 'Gluten', 'Fruits à coque'] },
  houmous: { name: 'Houmous et légumes croquants', allergens: ['Sésame'] },
  dinde: { name: 'Dinde farcie aux marrons', allergens: ['Céleri'] },
  agneau: { name: "Gigot d'agneau et flageolets", allergens: [] },
  couscous: { name: 'Couscous aux sept légumes', allergens: ['Gluten', 'Céleri'] },
  risotto: { name: 'Risotto aux champignons', allergens: ['Lait'] },
  curry: { name: 'Curry de légumes au lait de coco', allergens: [] },
  buche: { name: 'Bûche chocolat praliné', allergens: ['Lait', 'Œufs', 'Gluten', 'Fruits à coque'] },
  nid: { name: 'Nid de Pâques au chocolat', allergens: ['Lait', 'Œufs', 'Gluten'] },
  tarte: { name: 'Tarte aux pommes', allergens: ['Gluten', 'Œufs', 'Lait'] },
  salade: { name: 'Salade de fruits frais', allergens: [] }
}

export const menus = [
  {
    id: 1,
    title: 'Menu de Noël',
    description: 'Un repas de fête traditionnel pour réunir toute la famille autour de la table.',
    theme: 'Noël',
    diet: 'Classique',
    minPeople: 6,
    price: 180,
    stock: 5,
    conditions: 'Commande au minimum 2 semaines avant la prestation. À conserver au réfrigérateur (entre 0 et 4 °C) et à consommer dans les 48 h.',
    images: [couscous, couscous, couscous],
    dishes: {
      starters: [dishes.veloute, dishes.foieGras],
      mains: [dishes.dinde],
      desserts: [dishes.buche]
    }
  },
  {
    id: 2,
    title: 'Menu de Pâques',
    description: 'Un menu printanier autour de l’agneau et du chocolat.',
    theme: 'Pâques',
    diet: 'Classique',
    minPeople: 4,
    price: 110,
    stock: 8,
    conditions: 'Commande au minimum 10 jours avant la prestation. À conserver au réfrigérateur.',
    images: [couscous, couscous],
    dishes: {
      starters: [dishes.saladeChevre],
      mains: [dishes.agneau],
      desserts: [dishes.nid]
    }
  },
  {
    id: 3,
    title: 'Menu Classique',
    description: 'Nos incontournables de saison, pour un repas simple et généreux.',
    theme: 'Classique',
    diet: 'Classique',
    minPeople: 2,
    price: 45,
    stock: 20,
    conditions: 'Commande au minimum 3 jours avant la prestation.',
    images: [couscous],
    dishes: {
      starters: [dishes.veloute],
      mains: [dishes.couscous],
      desserts: [dishes.tarte]
    }
  },
  {
    id: 4,
    title: 'Menu Végétarien',
    description: 'Une cuisine de saison sans viande ni poisson, pleine de saveurs.',
    theme: 'Classique',
    diet: 'Végétarien',
    minPeople: 2,
    price: 40,
    stock: 15,
    conditions: 'Commande au minimum 3 jours avant la prestation.',
    images: [couscous, couscous],
    dishes: {
      starters: [dishes.saladeChevre, dishes.veloute],
      mains: [dishes.risotto],
      desserts: [dishes.tarte]
    }
  },
  {
    id: 5,
    title: 'Menu Vegan',
    description: '100 % végétal, sans aucun produit d’origine animale.',
    theme: 'Classique',
    diet: 'Vegan',
    minPeople: 2,
    price: 42,
    stock: 0,
    conditions: 'Commande au minimum 5 jours avant la prestation.',
    images: [couscous],
    dishes: {
      starters: [dishes.houmous],
      mains: [dishes.curry],
      desserts: [dishes.salade]
    }
  },
  {
    id: 6,
    title: 'Menu Événement',
    description: 'Pour vos réceptions, anniversaires et événements d’entreprise. Matériel de service prêté.',
    theme: 'Événement',
    diet: 'Classique',
    minPeople: 20,
    price: 500,
    stock: 3,
    conditions: 'Commande au minimum 3 semaines avant la prestation. Le matériel prêté doit être restitué sous 10 jours ouvrés, sinon 600 € de frais seront facturés (voir CGV).',
    images: [couscous, couscous, couscous],
    dishes: {
      starters: [dishes.foieGras, dishes.houmous],
      mains: [dishes.agneau, dishes.risotto],
      desserts: [dishes.buche, dishes.salade]
    }
  }
]

export function getMenu(id) {
  return menus.find(m => m.id === Number(id)) || null
}
