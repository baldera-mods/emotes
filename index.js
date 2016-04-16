'use strict';

const quickswap = require('./lib/quickswap');
const persistence = require('./lib/persistence');

module.exports = function emotes(dispatch) {
  this.dispatch = dispatch;
  this.quickswap = new quickswap(this);
  this.persistence = new persistence(this);
};
