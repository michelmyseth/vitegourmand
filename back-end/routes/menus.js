// Public menu catalog
const express = require('express');
const menus = require('../controllers/menuController');

const router = express.Router();

router.get('/', menus.list); // ?maxPrice=&minPrice=&theme=&diet=&minPeople=
router.get('/:id', menus.detail);

module.exports = router;
