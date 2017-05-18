var _ = require('./utils.js');
var path = require('path');
var colors = require('colors');

function upload(receiver, to, data, release, content, file, callback) {
  var subpath = file.subpath;
  data['to'] = _(path.join(to, release));

  _.upload(
      //url, request options, post data, file
      receiver, null, data, content, subpath,
      function(err, res) {
        var json = null;
        res = res && res.trim();

        try {
          json = res ? JSON.parse(res) : null;
        } catch (e) {}

        if (!err && json && json.errno) {
          callback(json);
        } else if (err || !json && res != '0') {
          callback('upload file [' + subpath + '] to [' + to + '] by receiver [' + receiver + '] error [' + (err || res) + ']');
        } else {
          process.stdout.write(
            '\n - '.green.bold +
            ' ' + subpath.replace(/^\//, '') +
            ' >> '.yellow.bold +
            to + release
          );
          callback();
        }
      }
  );
}

module.exports = function(options, files, callback) {
  if (!options.receiver) {
    throw new Error('options.receiver is required!');
  }

  if (!options.to) {
    throw new Error('options.to is required!');
  }

  var to = options.to;
  var receiver = options.receiver;
  var data = options.data || {};

  var steps = [];

  files.forEach(function(file) {
    var reTryCount = options.retry;

    steps.push(function(next) {
      var _upload = arguments.callee;

      upload(receiver, to, data, file.subpath, file.getContent(), file, function(error) {
        if (error) {
          if (options.retry && !--reTryCount) {
            throw new Error(error.errmsg || error);
          } else {
            _upload(next);
          }
        } else {
          next && next();
        }
      });
    });
  });

  var x = _.reduceRight(steps, function(next, current) {
    return function() {
      current(next);
    };
  }, callback)();
};

module.exports.options = {
  // 允许重试两次。
  retry: 2
};
