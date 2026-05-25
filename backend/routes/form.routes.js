const express = require('express');
const router = express.Router();
const formController = require('../controllers/form/form.controller')




router.post('/create',formController.createForm) 
router.put('/update/:id',formController.updateForm)
router.delete('/delete/:id',formController.deleteForm)
router.get('/form-responses',formController.AllForm)



module.exports = router;