'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tag');
const seedTag = require('../db/seed/tags');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Tags', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
  });
  
  beforeEach(function () {
    return Tag.insertMany(seedTag);
  });
  
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
  
  after(function () {
    return mongoose.disconnect();
  });


  describe('GET /api/tags', function() {
    it('should return the correct number of tags and correct fields', function() {
      const dbPromise = Tag.find();
      const apiPromise = chai.request(app).get('/api/tags');

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

  describe('GET /api/tags/:id', function() {
    it('should return the correct tag with given id', function() {
      let data;
      return Tag.findOne().select('name')
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
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
        .get('/api/tags/ALAKAZAMMOFOS')
        .catch(err => err.response)
        .catch(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('POST /api/tags', function() {
    it('should create and return a new item when provided valid data', function() {
      const newTag = {
        'name': 'What up'
      };
      let res;
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.have.header('location');
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name');
          return Tag.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.name).to.equal(data.name);
          expect(res.body.id).to.equal(data.id);
        });
    });
    
  });

  describe('PUT /api/tags/:id', function() {
    it('should update the folder with the given id', function() {
      const updatedTag = {
        'name': 'Updating tag example',
      };
      let data;
      return Tag.findOne().select('id')
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/tags/${data.id}`)
            .send(updatedTag); 
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
        'name': 'Updating tag example'
      };
      return chai.request(app).put('/api/tags/blahblahblah')
        .send(updatedFolder)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('DELETE /api/tags/:id', function() {
    it('should delete a tag with the given id', function() {
      let data; 
      return Tag.findOne().select('id')
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(204);
        });
    });

  });


});