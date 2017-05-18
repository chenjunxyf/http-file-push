var pth = require('path');
var fs = require('fs');
var File = require('./file.js');
var _ = require('./utils.js');

var fileMgr = {};

fileMgr.getAllFiles = function(root, dir) {
  var res = [],
      files = fs.readdirSync(root);

  files.forEach(function(file) {
      var pathname = root + '/' + file,
          stat = fs.lstatSync(pathname);

      if (!stat.isDirectory()) {
          res.push(new File(pathname, dir));
      } else {
          res = res.concat(fileMgr.getAllFiles(pathname, dir));
      }
  });
  return res;
};

module.exports = fileMgr;
