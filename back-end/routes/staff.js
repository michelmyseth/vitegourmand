// Employee area (the administrator has the same rights, KAN-66)
const express = require('express');
const menus = require('../controllers/staffMenuController');
const dishes = require('../controllers/staffDishController');
const { requireAuth, requireEmployee } = require('../middlewares/auth');
const { menuImageUpload } = require('../config/upload');

const router = express.Router();

router.use(requireAuth, requireEmployee);

// Menus (KAN-57)
router.get('/menus', menus.list);
router.post('/menus', menus.create);
router.get('/menus/:id', menus.detail);
router.put('/menus/:id', menus.update);
router.delete('/menus/:id', menus.remove);
router.post('/menus/:id/images', menuImageUpload.single('image'), menus.addImage);
router.delete('/menus/:id/images/:imageId', menus.removeImage);

// Dishes (KAN-58)
router.get('/dishes', dishes.list);
router.post('/dishes', dishes.create);
router.put('/dishes/:id', dishes.update);
router.delete('/dishes/:id', dishes.remove);

module.exports = router;
