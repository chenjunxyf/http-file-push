var pth = require('path');
var fs = require('fs');
var fileMrg = require('./src/file-mgr.js');
var filepush = require('./src/push.js');
var colors = require('colors');

var cwd = process.cwd();

/**
 * 文件传输接口包装
 *
 * @param deploy 发布信息
 * @param dir 发布目录
 */
module.exports = function(deploy, dir) {
  var dirPath = pth.join(cwd, dir);

  if (!fs.existsSync(dirPath)) {
    console.log('\n 文件目录不存在 \n'.red);
    return;
  }

  var files = fileMrg.getAllFiles(dirPath, dir);
  filepush(deploy, files, function() {
    console.log('\n 文件传输成功 \n'.green);
  });
};
