'use strict';
var asap = require('asap');

function nodeify(fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments),
      callback =
        typeof args[args.length - 1] === 'function' ? args.pop() : null,
      ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || callback === undefined) {
        return new Promise.reject(ex);
      }
      return asap(function () {
        callback.call(ctx, ex);
      });
    }
  };
}

module.exports = nodeify;
