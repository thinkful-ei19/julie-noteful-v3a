'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Folder = require('../models/folder');
const Note = require('../models/note');


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
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});


router.put('/folders/:id', (req, res, next) => {
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

  Folder.findByIdAndUpdate(id, updateName, options)
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

router.delete('/folders/:id', (req, res, next) => {
  const {id} = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error ('The `name` is not valid');
    err.status=400;
    return next(err);
  }
  Folder.findByIdAndRemove(id)
    .then(() => {        
      Note.deleteMany({folderId:id})
        .then(()=> {
          res.status(204).end();
        });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;