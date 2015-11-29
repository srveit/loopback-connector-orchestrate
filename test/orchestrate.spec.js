'use strict';

var lco = require('../index'),
  oio = require('orchestrate');

describe('loopback-connector-orchestrate', function () {
  it('should exist', function (done) {
    expect(lco).toEqual(jasmine.any(Object));
    done();
  });
  describe('initialize', function () {
    var initialize;
    beforeEach(function (done) {
      initialize = lco.initialize;
      done();
    });
    it('should be a function', function (done) {
      expect(initialize).toEqual(jasmine.any(Function));
      done();
    });
    describe('when called without callback', function () {
      var dataSource;
      describe('and no settings.dbConstructor', function () {
        beforeEach(function (done) {
          dataSource = {
            settings: {}
          };
          initialize(dataSource);
          done();
        });
        it('should return orchestrate connector', function (done) {
          expect(dataSource.connector).toEqual(jasmine.any(Object));
          done();
        });
        it('should set the dbConstructor', function (done) {
          expect(dataSource.connector.dbConstructor)
            .toBe(oio);
          done();
        });
      });
      describe('and no settings.dbConstructor', function () {
        var dbConstructor;
        beforeEach(function (done) {
          dbConstructor = jasmine.createSpy('oio');
          dataSource = {
            settings: {
              dbConstructor: dbConstructor
            }
          };
          initialize(dataSource);
          done();
        });
        it('should return orchestrate connector', function (done) {
          expect(dataSource.connector).toEqual(jasmine.any(Object));
          done();
        });
        it('should not reset the dbConstructor', function (done) {
          expect(dataSource.connector.dbConstructor)
            .toBe(dbConstructor);
          done();
        });
      });
    });
    describe('when called with callback', function () {
      var dataSource, connector, dbConstructor, token, apiEndpoint, error,
        database, returnedDatabase;
      beforeEach(function (done) {
        database = jasmine.createSpyObj('orchestrate', [
          'foo'
        ]);
        dbConstructor = jasmine.createSpy('oio')
          .and.returnValue(database);
        token = 'token';
        apiEndpoint = 'example.com';
        dataSource = {
          settings: {
            token: token,
            apiEndpoint: apiEndpoint,
            dbConstructor: dbConstructor
          }
        };
        initialize(dataSource, function (err, db) {
          error = err;
          returnedDatabase = db;
          connector = dataSource.connector;
          done();
        });
      });
      it('should not fail', function (done) {
        expect(error).toBe(null);
        done();
      });
      it('should return orchestrate database', function (done) {
        expect(returnedDatabase).toEqual(database);
        done();
      });
      it('should create orchestrate connector', function (done) {
        expect(connector).toEqual(jasmine.any(Object));
        done();
      });
      it('should call the dbConstructor', function (done) {
        expect(dbConstructor).toHaveBeenCalledWith(token, apiEndpoint);
        done();
      });
      describe('getTypes', function () {
        var types;
        beforeEach(function (done) {
          types = connector.getTypes();
          done();
        });
        it('should include "db"', function (done) {
          expect(types).toContain('db');
          done();
        });
      });
      describe('and connect is called again', function () {
        beforeEach(function (done) {
          dbConstructor.calls.reset();
          connector.connect(function (err, db) {
            error = err;
            returnedDatabase = db;
            connector = dataSource.connector;
            done();
          });
        });
        it('should not call the dbConstructor', function (done) {
          expect(dbConstructor).not.toHaveBeenCalled();
          done();
        });
      });
      describe('and connect is called without a callback', function () {
        beforeEach(function (done) {
          dbConstructor.calls.reset();
          spyOn(process, 'nextTick');
          connector.connect();
          done();
        });
        it('should not call nextTick', function (done) {
          expect(process.nextTick).not.toHaveBeenCalled();
          done();
        });
      });
    });
  });
});
