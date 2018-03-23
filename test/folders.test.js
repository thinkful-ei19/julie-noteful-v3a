'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

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
    it('should return the correct number of Folders and correct fields', function() {
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

  describe('GET /api/folder/:id', function() {
    it('should return the correct folder with given id', function() {
      let data;
      return Folder.findOne().select('name')
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
  
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });
  
    it('should respond with a 404 for an invalid id', function() {
      return chai.request(app)
        .get('/api/folders/ALAKAZAMMOFOS')
        .catch(err => err.response)
        .catch(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('POST /api/folders', function() {
    it('should create and return a new item when provided valid data', function() {
      const newFolder = {
        'name': 'What up'
      };
      let res;
      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.have.header('location');
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name');
          return Folder.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.name).to.equal(data.name);
          expect(res.body.id).to.equal(data.id);
        });
    });
    
  });

  describe('PUT /api/folder/:id', function() {
    it('should update the folder with the given id', function() {
      const updatedFolder = {
        'name': 'Updating folder example',
      };
      let data;
      return Folder.findOne().select('id')
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/folders/${data.id}`)
            .send(updatedFolder); 
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'name');
        });
    });
    it('should respond with a 404 for an invalid id', function() {
      const updatedFolder = {
        'name': 'Updating folder example'
      };
      return chai.request(app).put('/api/folders/blahblahblah')
        .send(updatedFolder)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('DELETE /api/folders/:id', function() {
    it('should delete a folder with the given id', function() {
      let data; 
      return Folder.findOne().select('id')
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(204);
        });
    });

    it('should respond with a 404 for an invalid id', function() {
      return chai.request(app)
        .delete('/api/folders/9999')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });


});


