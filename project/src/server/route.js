const express = require('express');
const { apodController, roverController } = require('./controller');
const router = express.Router();

router.get('/apod', apodController);

router.get('/rover', roverController);

module.exports = router;
