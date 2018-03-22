'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Note = require('../models/folder');

router.get('/folders', (req, res, next) => {
  const {searchTerm} = req.query;
  let filter = {};
});