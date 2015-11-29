'use strict';
var oio = require('orchestrate'),
  Connector = require('loopback-connector').Connector,
  util = require('util'),
  debug = require('debug')('loopback:connector:orchestrate');

/**
 * Creates a new Orchestrate LoopBack Connector.
 * @param {Object} settings - parameters for creating Orchestrate client
 * @param {Function} [settings.dbConstructor] - function to call to
 *   create a new Orchestrate client. Defaults to orchestrate.
 * @param {String} [settings.token] - API Key passed to Orchestrate
 *   API that identifies your application
 * @param {String} [settings.apiEndpoint] - databse API
 *   endpoint. Defaults to "api.orchestrate.io"
 * @class
 */
function Orchestrate(settings) {
  this.dbConstructor = settings.dbConstructor || oio;
  this.token = settings.token;
  this.apiEndpoint = settings.apiEndpoint;
}

util.inherits(Orchestrate, Connector);

/**
 * Establishes a database connection.
 * @param {Function} [callback] - called with the database client
 */
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

/**
 * Get types associated with the connector.
 * @returns {String[]} The types for the connector
 */
Orchestrate.prototype.getTypes = function () {
  return ['db', 'nosql', 'orchestrate'];
};

/**
 * Initializes the data source for an Orchestrate database.
 * @param {Object} dataSource - description of data source
 * @param {Object} dataSource.settings - parameters for creating
 *   Orchestrate client
 * @param {Function} [callback] - called with the database client
 *   after it is created
 */
exports.initialize = function initializeDataSource(dataSource, callback) {
  dataSource.connector = new Orchestrate(dataSource.settings);
  if (callback) {
    dataSource.connector.connect(callback);
  }
};
