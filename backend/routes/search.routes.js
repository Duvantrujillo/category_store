const express = require('express');
const router = express.Router();
const { globalSearch }  = require('../controllers/search/search.controller');
const { publicSearch }  = require('../controllers/search/public-search.controller');

router.get('/public', publicSearch);   // sin auth
router.get('/',       globalSearch);   // con auth (admin)

module.exports = router;
