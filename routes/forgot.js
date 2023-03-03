const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const forgots = require('../controllers/forgots');

router.get("/", catchAsync(forgots.main))


router.post("/", catchAsync(forgots.tokenSend) )
  

module.exports = router;