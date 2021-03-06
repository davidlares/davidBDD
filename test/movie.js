"use strict"

let request = require('supertest-as-promised')
const _ = require('lodash')
const api = require('../app')
const mongoose = require('mongoose')
const config = require('../lib/config/')
// defining host
const host = api

// passing host that aims the tests
request = request(host)

describe('movie route', function(){

  before(() => {
    mongoose.connect(config.database)
  })

  after((done) => {
    mongoose.disconnect(done)
    mongoose.models = {}
  })

  describe('POST Request to Host', function(){
    it('this should create a movie', function(done){

      let movie = {
        'title': 'Movie Title',
        'year': '2012'
      }

      let user = {
        'username': 'davidlares',
        'password': 'secret'
      }
      request
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        let _user = res.body.user
        _user.password = user.password
        return request
          .post('/auth')
          .set('Accept', 'application/json')
          .send(_user)
          .expect(201)
          .expect('Content-Type', /application\/json/)
       })
      .then((res) => {
        let token = res.body.token
        return request
          .post('/movie')
          .set('Accept', 'application/json')
          .set('x-access-token', token)
          .send(movie)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        let body = res.body
        console.log(body)
        expect(body).to.have.property('movie')
        movie = body.movie
        expect(movie).to.have.property('title', 'Movie Title')
        expect(movie).to.have.property('year', '2012')
        expect(movie).to.have.property('_id')
        // all expect have a callback at the start and when it finish
        done()
      })

    })
  })

        // Original
        // request
        //   .post('/movie')
        //   .set('Accept', 'application/json')
        //   .send(movie)
        //   .expect(201)
        //   .expect('Content-Type', /application\/json/)
        // .end((err, res) => {
        //     let body = res.body
        //     expect(body).to.have.property('movie')
        //     movie = body.movie
        //     expect(movie).to.have.property('title', 'Movie Title')
        //     expect(movie).to.have.property('year', '2012')
        //     expect(movie).to.have.property('_id')
        //     done(err)
        // })



  describe('GET Request', function(){
    it('should get all movies', function(done){

      let movie_id
      let movie2_id
      let token

      let movie = {
        'title': 'Movie Title',
        'year': '2012'
      }
      let movie2 = {
        'title': 'Movie Title 2',
        'year': '2013'
      }

      let user = {
        'username': 'davidlares',
        'password': 'secret'
      }
      request
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        let _user = res.body.user
        _user.password = user.password
        return request
          .post('/auth')
          .set('Accept', 'application/json')
          .send(_user)
          .expect(201)
          .expect('Content-Type', /application\/json/)
       })
      .then((res) => {
        token = res.body.token
        return request
          .post('/movie')
          .set('Accept', 'application/json')
          .set('x-access-token', token)
          .send(movie)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        movie_id = res.body.movie._id
        return request
          .post('/movie')
          .set('Accept', 'application/json')
          .set('x-access-token', token)
          .send(movie2)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        movie2_id = res.body.movie._id
        return request
          .get('/movie')
          .set('Accept','application/json')
          .set('x-access-token', token)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
          let body = res.body
          expect(body).to.have.property('movies')
          expect(body.movies).to.be.an('array').and.to.have.length.above(2)

          let movies = body.movies
          movie = _.find(movies, {_id: movie_id})
          movie2 = _.find(movies, {_id: movie2_id})

          expect(movie).to.have.property('_id', movie_id)
          expect(movie).to.have.property('title', 'Movie Title')
          expect(movie).to.have.property('year', '2012')

          expect(movie2).to.have.property('_id', movie2_id)
          expect(movie2).to.have.property('title', 'Movie Title 2')
          expect(movie2).to.have.property('year', '2013')

          done()
      }, done)
    })
  })

  describe('GET request /:id', function(){
    it('should get one movie only', function(done){
      let token

      let movie_id
      let movie = {
        "title": "her",
        "year": "2014"
      }

      let user = {
        'username': 'davidlares',
        'password': 'secret'
      }

      request
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        let _user = res.body.user
        _user.password = user.password
        return request
          .post('/auth')
          .set('Accept', 'application/json')
          .send(_user)
          .expect(201)
          .expect('Content-Type', /application\/json/)
       })
      .then((res) => {
        token = res.body.token
        return request
        .post('/movie')
        .set('Accept', 'application/json')
        .set('x-access-token', token)
        .send(movie)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        movie_id = res.body.movie._id
        return request
          .get('/movie/' + movie_id)
          .set('Accept', 'application/json')
          .set('x-access-token', token)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        let body = res.body
        expect(body).to.have.property('movie')
        movie = body.movie
        expect(movie).to.have.property('_id', movie_id)
        expect(movie).to.have.property('title','her')
        expect(movie).to.have.property('year','2014')
        done()
      }, done)
    })
  })

  describe('PUT Request :/movie', function(){
    it('should modify a movie', function(done){
      let movie_id
      let token
      let movie = {
        "title": "Pulp Fiction",
        "year": "2015"
      }
      let user = {
        'username': 'davidlares',
        'password': 'secret'
      }

      request
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        let _user = res.body.user
        _user.password = user.password
        return request
          .post('/auth')
          .set('Accept', 'application/json')
          .send(_user)
          .expect(201)
          .expect('Content-Type', /application\/json/)
       })
      .then((res) => {
        token = res.body.token
        return request
          .post('/movie')
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .send(movie)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        movie_id = res.body.movie._id
        return request
          .put('/movie/' + movie_id)
          .send(movie)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        let body = res.body
        expect(body).to.have.property('movie')
        movie = body.movie
        expect(movie).to.have.property('_id', movie_id)
        expect(movie).to.have.property('title','Pulp Fiction')
        expect(movie).to.have.property('year','2015')
        done()
      }, done)
    })
  })

  describe('DELETE request :/movie', function(){
    it('should delete a movie', function(done){

      let token
      let movie_id
      let movie = {
        "title": "Pulp Fiction",
        "year": "2015"
      }
      let user = {
        'username': 'davidlares',
        'password': 'secret'
      }

      request
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        let _user = res.body.user
        _user.password = user.password
        return request
          .post('/auth')
          .set('Accept', 'application/json')
          .send(_user)
          .expect(201)
          .expect('Content-Type', /application\/json/)
       })
      .then((res) => {
        token = res.body.token
        return request
          .post('/movie')
          .set('Accept', 'application/json')
          .set('x-access-token', token)
          .send(movie)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        movie_id = res.body.movie._id
        return request
          .delete('/movie/' + movie_id)
          .set('Accept', 'application/json')
          .set('x-access-token', token)
          .expect(400)
          .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        let body = res.body
        expect(body).to.be.empty
        done()
      }, done)

    })
  })
})
