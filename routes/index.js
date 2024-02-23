const express = require('express');

const router = express.Router();

const { Github } = require('../controllers');

router.get('/getTopRepositories', Github.getTopRepositories);

module.exports = router;
