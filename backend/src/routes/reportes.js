
const express = require('express');

const { reporteDiario } = require('../controllers/reportesController');
const { requiereSesion, requierePermiso } = require('../middleware/auth');

const router = express.Router();

router.get('/diario', requiereSesion, requierePermiso('ver_panel'), reporteDiario);

module.exports = router;