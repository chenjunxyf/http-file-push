var _ = require('./utils.js');
var pth = require('path');
var fs = require('fs');

var cwd = process.cwd();
var projectPath = _getProjectName();

function File(path, dir) {
  this.realpath = path;
  this.subpath = path.substring(cwd.length);
  this.releasePath = this.subpath.replace(dir, projectPath);
  this._isImage = true;
  this._isText = false;

  if (_.isTextFile(path)) {
    this._isImage = false;
    this._isText = true;
  }
}

File.prototype.getContent = function(path) {
  if (typeof this._content === 'undefined') {
    this._content = _.read(this.realpath, this._isText);
  }
  return this._content;
};

function _getProjectName() {
  return cwd.split('/').slice(-1)[0];
}

module.exports = File;
