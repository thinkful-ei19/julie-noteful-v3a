'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');
const Folder = require('../models/folder');
const seedFolder = require('../db/seed/folders');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Folders', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
  });
  
  beforeEach(function () {
    return Folder.insertMany(seedFolder);
  });
  
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
  
  after(function () {
    return mongoose.disconnect();
  });


  describe('GET /api/folders', function() {

    it.only('should return the correct number of Folders and correct fields', function() {
      const dbPromise = Folder.find();
      const apiPromise = chai.request(app).get('/api/folders');

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res).to.be.json;
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function(item){
            expect(item).to.be.an('object');
            expect(item).to.have.keys('id', 'name');
          });
        });
    });

  });

  //bad data (also in put method) 
  //



});