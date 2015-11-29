'use strict';
var oio = require('orchestrate'),
  Connector = require('loopback-connector').Connector,
  util = require('util'),
  debug = require('debug')('loopback:connector:orchestrate');

function Orchestrate(settings) {
  this.dbConstructor = settings.dbConstructor;
  this.token = settings.token;
  this.apiEndpoint = settings.apiEndpoint;
}

util.inherits(Orchestrate, Connector);

Orchestrate.prototype.connect = function (callback) {
  var that = this;
  if (!that.db) {
    that.db = that.dbConstructor(that.token, that.apiEndpoint);
  }
  if (callback) {
    process.nextTick(function () {
      callback(null, that.db);
    });
  }
};

Orchestrate.prototype.getTypes = function () {
  return ['db'];
};

exports.initialize = function initializeDataSource(dataSource, callback) {
  var settings = dataSource.settings;
  settings.dbConstructor = settings.dbConstructor || oio;
  dataSource.connector = new Orchestrate(settings);
  if (callback) {
    dataSource.connector.connect(callback);
  }
};
