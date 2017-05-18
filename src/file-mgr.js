var pth = require('path');
var fs = require('fs');
var File = require('./file.js');
var _ = require('./utils.js');

var fileMgr = {};

fileMgr.getAllFiles = function(root) {
  var res = [],
      files = fs.readdirSync(root);

  files.forEach(function(file) {
      var pathname = root + '/' + file,
          stat = fs.lstatSync(pathname);

      if (!stat.isDirectory()) {
          res.push(new File(pathname));
      } else {
          res = res.concat(fileMgr.getAllFiles(pathname));
      }
  });
  return res;
};

module.exports = fileMgr;
