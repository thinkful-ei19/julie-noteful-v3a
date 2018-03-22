'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Folder = require('../models/folder');

router.get('/folders', (req, res, next) => {
  Folder.find()
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

router.get('/folders/:id', (req, res, next) => {
  const {id} = req.params;
  
  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('the `id` is not valid');
    err.status = 400;
    return next(err);     
  }

  Folder.findById(id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

router.post('/folders', (req, res, next) => {
  const {name} = req.body;
  
  if (!name) {
    const err = new Error('Missing `name`');
    err.status = 400;
    return next(err);
  }

  const newFolder = {name};

  Folder.create(newFolder)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;