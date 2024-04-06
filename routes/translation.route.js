const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translation.controller');

router.get('/detect-language/:text', translationController.detectLanguage);
router.get('/translate/:text/:target', translationController.translateText);

module.exports = router;
