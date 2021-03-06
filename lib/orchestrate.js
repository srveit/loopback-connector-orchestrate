'use strict';
var nodeify = require('./nodeify'),
  oio = require('orchestrate'),
  Connector = require('loopback-connector').Connector,
  util = require('util'),
  asap = require('asap'),
  debug = require('debug')('loopback:connector:orchestrate');

Promise.nodeify = nodeify;

/**
 * Creates a new Orchestrate LoopBack Connector.
 * @param {Object} settings - parameters for creating Orchestrate client
 * @param {Function} [settings.dbConstructor] - function to call to
 *   create a new Orchestrate client. Defaults to orchestrate.
 * @param {String} [settings.token] - API Key passed to Orchestrate
 *   API that identifies your application
 * @param {String} [settings.apiEndpoint] - databse API
 *   endpoint. Defaults to "api.orchestrate.io". See
 *   [Multi Data Center]{@link https://orchestrate.io/docs/multi-data-center}
 * @class
 */
function Orchestrate(settings) {
  Connector.call(this, 'orchestrate', settings);
  this.dbConstructor = settings.dbConstructor || oio;
  this.token = settings.token;
  this.apiEndpoint = settings.apiEndpoint;
}

util.inherits(Orchestrate, Connector);

function ensureDatabase(connector) {
  if (!connector.db) {
    connector.db =
      connector.dbConstructor(connector.token, connector.apiEndpoint);
    connector.pingCb = Promise.nodeify(connector.db.ping.bind(connector.db));
  }
}
/**
 * Establishes a database connection.
 * @param {Function} [callback] - called with the database client
 */
Orchestrate.prototype.connect = function (callback) {
  var self = this;
  ensureDatabase(self);
  if (callback) {
    asap(function () {
      callback(null, self.db);
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
 * Get the default data type for ID
 * @param {Object} prop - Property definition
 * @returns {Function} The default type for ID
 */
Orchestrate.prototype.getDefaultIdType = function (prop) {
  /*jslint unparam: true */
  return String;
};

/**
 * Create a new model instance for the given data
 * @param {String} model - model name
 * @param {Object} data - model data
 * @param {Object} options - model options
 * @param {Orchestrate~callback} callback - function called with `(err, id)`
 */
// Orchestrate.prototype.create = function (model, data, options, callback) {
//   /*jslint unparam: true */
//   return String;
// };

/**
 * Verifies that the database is available
 * @param {Orchestrate~callback} callback - function called with `(err, id)`
 */
Orchestrate.prototype.ping = function (callback) {
  ensureDatabase(this);
  return this.pingCb(callback);
};

/**
 * Callback used by myFunction.
 * @callback Orchestrate~callback
 * @param {Error} err - Error object; see
 *   [Error object]{@link http://docs.strongloop.com/display/LB/Error+object}.
 * @param {String} id - id of newly created object
 */

/**
 * Execute a command with given parameters
 * @param {String|Object} command The command such as SQL
 * @param {String[]} [params] An array of parameter values
 * @param {Object} [options] Options object
 * @param {Function} [callback] The callback function
 */
// Orchestrate.prototype.execute = function (command, params, options, callback) {
//   /*jslint unparam: true */
//   throw new Error('execute() must be implemented by the connector');
// };

/* Note: the following functions are provided by DataSource:
 * log(query, start)
 * logger(query)
 */

/* The following methods are called from datasource.js:
 *   automigrate(models, cb)
 *   autoupdate(models, cb)
 */

/* The following methods are called from dao.js:
 * create(modelName, obj.constructor._forDB(context.data), options, cb)
 * updateOrCreate(Model.modelName, update, options, cb)
 * findOrCreate(modelName, query, self._forDB(context.data), options, cb)
 * buildNearFilter(query, near) // optional geo query
 * all(self.modelName, query, options, cb)
 * destroyAll(Model.modelName, query, options, cb)
 * count(Model.modelName, where, options, cb)
 * save(modelName, inst.constructor._forDB(data), options, cb)
 * update(Model.modelName, where, data, options, cb)
 * destroy(inst.constructor.modelName, id, options, cb)
 * updateAttributes(model, getIdValue(inst.constructor, inst), inst.constructor._forDB(context.data), options, cb)
 */
/* The following methods are not overridden from the Connector class:
 *   disconnect
 */

/* Note: these are optional methods to implement:
 *   discoverModelDefinitions(options, cb)
 *   discoverModelDefinitionsSync(options)
 *   discoverModelProperties(modelName, options, cb)
 *   discoverModelPropertiesSync(modelName, options)
 *   discoverPrimaryKeys(modelName, options, cb)
 *   discoverPrimaryKeysSync(modelName, options)
 *   discoverForeignKeys(modelName, options, cb)
 *   discoverForeignKeysSync(modelName, options)
 *   discoverExportedForeignKeys(modelName, options, cb)
 *   discoverExportedForeignKeysSync(modelName, options)
 *   discoverSchemas(modelName, options, cb)
 *   freezeDataSource()
 *   freezeSchema()
 *   defineForeignKey(className, key, foreignClassName, cb) or
 *   defineForeignKey(className, key, cb)
 *   transaction()
 *   exec(cb) // execute previously started transaction
 */

/* Note: The following methods are implemented in mongodb.js
 *   Orchestrate.prototype.collectionName
 *   Orchestrate.prototype.collection
 *   Orchestrate.prototype.fromDatabase
 *   Orchestrate.prototype.coerceId
 *   Orchestrate.prototype.exists
 *   Orchestrate.prototype.find
 *   Orchestrate.prototype.parseUpdateData
 *   Orchestrate.prototype.destroy
 *   Orchestrate.prototype.buildWhere
 *   Orchestrate.prototype.buildSort
 *   Orchestrate.prototype.updateAll
 */

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
