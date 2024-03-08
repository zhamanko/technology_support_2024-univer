const express = require('express');

const router = express.Router();

const { Github } = require('../controllers');

router.get('/getTopRepositories', Github.getTopContributors);

module.exports = router;
