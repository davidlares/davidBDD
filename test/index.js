"use strict"

let request = require('supertest-as-promised')
const api = require('../app')
const mongoose = require('mongoose')
const config = require('../lib/config')
// defining host
const host = api

// passing host that aims the tests
request = request(host)

// first scenario
describe('Index Route, Hello World', function(){

  before(() => {
    mongoose.connect(config.database)
  })

  after((done) => {
    mongoose.disconnect(done)
    mongoose.models = {}
  })
  // assertion
  describe('GET /', function(){
    // should expect (expectation)
    it('should return a Hello World message', function(done){
      // doing a GET Request
      request
        .get('/')
        .set('Accept', 'application/json')
        // expecting some data
        .expect(200) // status code
        .expect('Content-Type', /application\/json/) // status
        .end((err, res) => {
          let body = res.body
          expect(body).to.have.property('message', 'Hello World')
          done(err)
      })
    })
  })
})
