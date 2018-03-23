'use strict';


const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Tag = require('../models/tag');

router.get('/tags', (req, res, next) => {
  Tag.find()
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

router.get('/tags/:id', (req, res, next) => {
  const {id} = req.params;
    
  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('the `id` is not valid');
    err.status = 400;
    return next(err);     
  }
  
  Tag.findById(id)
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

router.post('/tags', (req, res, next) => {
  const {name} = req.body;
    
  if (!name) {
    const err = new Error('Missing `name`');
    err.status = 400;
    return next(err);
  }
  
  const newTag = {name};
  
  Tag.create(newTag)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.put('/tags/:id', (req, res, next) => {
  const {id} = req.params;
  const {name} = req.body;
  
  if (!name) {
    const err = new Error ('Missing `name`');
    err.status = 400;
    return next(err);
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error ('The `name` is not valid');
    err.status=400;
    return next(err);
  }
  
  const updateName = {name};
  const options = {new: true};
  
  Tag.findByIdAndUpdate(id, updateName, options)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});


router.delete('/tags/:id', (req, res, next) => {
  const { id } = req.params;

  Tag.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;


