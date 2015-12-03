'use strict';

var lco = require('../index'),
  oio = require('orchestrate'),
  Q = require('q');

function asap(callback) {
  setTimeout(callback, 10);
}

describe('loopback-connector-orchestrate', function () {
  var database, dbConstructor, pingDeferred;
  beforeEach(function (done) {
    database = jasmine.createSpyObj('orchestrate', [
      'ping'
    ]);
    pingDeferred = Q.defer();
    database.ping.and.returnValue(pingDeferred.promise);
    dbConstructor = jasmine.createSpy('oio')
      .and.returnValue(database);
    done();
  });
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
        beforeEach(function (done) {
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
      var dataSource, connector, token, apiEndpoint, error, returnedDatabase;
      beforeEach(function (done) {
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
      it('should set the connector name', function (done) {
        expect(connector.name).toBe('orchestrate');
        done();
      });
      it('should set the connector settings', function (done) {
        expect(connector.settings).toEqual(jasmine.objectContaining({
          token: token
        }));
        done();
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
        it('should include "nosql"', function (done) {
          expect(types).toContain('nosql');
          done();
        });
        it('should include "orchestrate"', function (done) {
          expect(types).toContain('orchestrate');
          done();
        });
      });
      describe('getDefaultIdType', function () {
        var defaultIdType;
        beforeEach(function (done) {
          defaultIdType = connector.getDefaultIdType();
          done();
        });
        it('should return String', function (done) {
          expect(defaultIdType).toBe(String);
          done();
        });
      });
      describe('ping', function () {
        var callback;
        beforeEach(function (done) {
          callback = jasmine.createSpy('callback');
          connector.ping(callback);
          done();
        });
        it('should call database.ping', function (done) {
          expect(database.ping).toHaveBeenCalled();
          done();
        });
        describe('and database.ping succeeds', function () {
          beforeEach(function (done) {
            pingDeferred.resolve();
            asap(done);
          });
          it('should succeed', function (done) {
            expect(callback).toHaveBeenCalledWith(null, undefined);
            done();
          });
        });
        describe('and database.ping fails', function () {
          var pingError;
          beforeEach(function (done) {
            pingError = {
              name: 'error'
            };
            pingDeferred.reject(pingError);
            asap(done);
          });
          it('should fail', function (done) {
            expect(callback).toHaveBeenCalledWith(pingError);
            done();
          });
        });
      });
    });
  });
});
