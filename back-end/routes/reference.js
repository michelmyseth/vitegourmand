// Public reference data used by the forms and the footer
const express = require('express');
const reference = require('../controllers/referenceController');

const router = express.Router();

router.get('/themes', reference.listThemes);
router.get('/diets', reference.listDiets);
router.get('/allergens', reference.listAllergens);
router.get('/opening-hours', reference.listOpeningHours);

module.exports = router;
