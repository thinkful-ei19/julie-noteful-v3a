'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Folder = require('../models/folder');

router.get('/folders', (req, res, next) => {
  Folder.find()
    .sort('created')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;