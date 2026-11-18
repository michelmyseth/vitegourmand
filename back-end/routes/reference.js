// Public reference data used by the forms and the footer
const express = require('express');
const reference = require('../controllers/referenceController');
const reviews = require('../controllers/reviewController');

const router = express.Router();

router.get('/themes', reference.listThemes);
router.get('/diets', reference.listDiets);
router.get('/allergens', reference.listAllergens);
router.get('/opening-hours', reference.listOpeningHours);
router.get('/reviews', reviews.listApproved); // approved reviews only

module.exports = router;
