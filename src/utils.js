var lodash = require('lodash');
var Url = require('url');
var pth = require('path');
var fs = require('fs');

var _exists = fs.existsSync || pth.existsSync;

/*
 * 后缀类型HASH
 * @type {Array}
 */
var TEXT_FILE_EXTS = [
    'css', 'tpl', 'js', 'php',
    'txt', 'json', 'xml', 'htm',
    'text', 'xhtml', 'html', 'md',
    'conf', 'po', 'config', 'tmpl',
    'coffee', 'less', 'sass', 'jsp',
    'scss', 'manifest', 'bak', 'asp',
    'tmp', 'haml', 'jade', 'aspx',
    'ashx', 'java', 'py', 'c', 'cpp',
    'h', 'cshtml', 'asax', 'master',
    'ascx', 'cs', 'ftl', 'vm', 'ejs',
    'styl', 'jsx', 'handlebars', 'shtml',
    'ts', 'tsx', 'yml', 'sh', 'es', 'es6', 'es7',
    'map'
  ],
  IMAGE_FILE_EXTS = [
    'svg', 'tif', 'tiff', 'wbmp',
    'png', 'bmp', 'fax', 'gif',
    'ico', 'jfif', 'jpe', 'jpeg',
    'jpg', 'woff', 'cur', 'webp',
    'swf', 'ttf', 'eot', 'woff2'
  ],
  MIME_MAP = {
    //text
    'css': 'text/css',
    'tpl': 'text/html',
    'js': 'text/javascript',
    'jsx': 'text/javascript',
    'ts': 'text/javascript',
    'tsx': 'text/javascript',
    'es': 'text/javascript',
    'es6': 'text/javascript',
    'es7': 'text/javascript',
    'php': 'text/html',
    'asp': 'text/html',
    'jsp': 'text/jsp',
    'txt': 'text/plain',
    'json': 'application/json',
    'xml': 'text/xml',
    'htm': 'text/html',
    'text': 'text/plain',
    'md': 'text/plain',
    'xhtml': 'text/html',
    'html': 'text/html',
    'conf': 'text/plain',
    'po': 'text/plain',
    'config': 'text/plain',
    'coffee': 'text/javascript',
    'less': 'text/css',
    'sass': 'text/css',
    'scss': 'text/css',
    'styl': 'text/css',
    'manifest': 'text/cache-manifest',
    //image
    'svg': 'image/svg+xml',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
    'wbmp': 'image/vnd.wap.wbmp',
    'webp': 'image/webp',
    'png': 'image/png',
    'bmp': 'image/bmp',
    'fax': 'image/fax',
    'gif': 'image/gif',
    'ico': 'image/x-icon',
    'jfif': 'image/jpeg',
    'jpg': 'image/jpeg',
    'jpe': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'eot': 'application/vnd.ms-fontobject',
    'woff': 'application/font-woff',
    'ttf': 'application/octet-stream',
    'cur': 'application/octet-stream'
  };

function getIconv() {
  if (!iconv) {
    iconv = require('iconv-lite');
  }
  return iconv;
}

var _ = module.exports = function(path) {
  var type = typeof path;
  if (arguments.length > 1) {
    path = Array.prototype.join.call(arguments, '/');
  } else if (type === 'string') {
    //do nothing for quickly determining.
  } else if (type === 'object') {
    path = Array.prototype.join.call(path, '/');
  } else if (type === 'undefined') {
    path = '';
  }
  if (path) {
    path = pth.normalize(path.replace(/[\/\\]+/g, '/')).replace(/\\/g, '/');
    if (path !== '/') {
      path = path.replace(/\/$/, '');
    }
  }
  return path;
};

lodash.assign(_, lodash);

/**
 * 对象枚举元素遍历，若merge为true则进行_.assign(obj, callback)，若为false则回调元素的key value index
 * @param  {Object}   obj      源对象
 * @param  {Function|Object} callback 回调函数|目标对象
 * @param  {Boolean}   merge    是否为对象赋值模式
 * @name map
 * @function
 */
_.map = function(obj, callback, merge) {
  var index = 0;
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (merge) {
        callback[key] = obj[key];
      } else if (callback(key, obj[key], index++)) {
        break;
      }
    }
  }
};

/**
 * url解析函数，规则类似require('url').parse
 * @param  {String} url 待解析的url
 * @param  {Object} opt 解析配置参数 { host|hostname, port, path, method, agent }
 * @return {Object}     { protocol, host, port, path, method, agent }
 * @name parseUrl
 * @function
 */
_.parseUrl = function(url, opt) {
  opt = opt || {};
  url = Url.parse(url);
  var ssl = url.protocol === 'https:';
  opt.host = opt.host || opt.hostname || ((ssl || url.protocol === 'http:') ? url.hostname : 'localhost');
  opt.port = opt.port || (url.port || (ssl ? 443 : 80));
  opt.path = opt.path || (url.pathname + (url.search ? url.search : ''));
  opt.method = opt.method || 'GET';
  opt.agent = opt.agent || false;
  return opt;
};

/*
 * 生成对应文件类型判断的正则
 * @param  {String} type 文件类型
 * @return {RegExp}      对应判断的正则表达式
 */
function getFileTypeReg(type) {
  var map = [],
    ext = '';
  if (type === 'text') {
    map = TEXT_FILE_EXTS;
  } else if (type === 'image') {
    map = IMAGE_FILE_EXTS;
  } else {
    console.log('invalid file type [%s]', type);
  }
  if (ext && ext.length) {
    if (typeof ext === 'string') {
      ext = ext.split(/\s*,\s*/);
    }
    map = map.concat(ext);
  }
  map = map.join('|');
  return new RegExp('\\.(?:' + map + ')$', 'i');
}

/**
 * 是否为配置中的text文件类型
 * @param  {String}  path 路径
 * @return {Boolean}
 * @name isTextFile
 * @function
 */
_.isTextFile = function(path) {
  return getFileTypeReg('text').test(path || '');
};

/**
 * 是否为配置中的image文件类型
 * @param  {String}  path 路径
 * @return {Boolean}
 * @memberOf fis.util
 * @name isImageFile
 * @function
 */
_.isImageFile = function(path) {
  return getFileTypeReg('image').test(path || '');
};

/**
 * 判断Buffer是否为utf8
 * @param  {Buffer}  bytes 待检数据
 * @return {Boolean}       true为utf8
 * @name isUtf8
 * @function
 */
_.isUtf8 = function(bytes) {
  var i = 0;
  while (i < bytes.length) {
    if (( // ASCII
        0x00 <= bytes[i] && bytes[i] <= 0x7F
      )) {
      i += 1;
      continue;
    }

    if (( // non-overlong 2-byte
        (0xC2 <= bytes[i] && bytes[i] <= 0xDF) &&
        (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF)
      )) {
      i += 2;
      continue;
    }

    if (
      ( // excluding overlongs
        bytes[i] == 0xE0 &&
        (0xA0 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
        (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
      ) || ( // straight 3-byte
        ((0xE1 <= bytes[i] && bytes[i] <= 0xEC) ||
          bytes[i] == 0xEE ||
          bytes[i] == 0xEF) &&
        (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
        (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
      ) || ( // excluding surrogates
        bytes[i] == 0xED &&
        (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x9F) &&
        (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
      )
    ) {
      i += 3;
      continue;
    }

    if (
      ( // planes 1-3
        bytes[i] == 0xF0 &&
        (0x90 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
        (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
        (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
      ) || ( // planes 4-15
        (0xF1 <= bytes[i] && bytes[i] <= 0xF3) &&
        (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
        (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
        (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
      ) || ( // plane 16
        bytes[i] == 0xF4 &&
        (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x8F) &&
        (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
        (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
      )
    ) {
      i += 4;
      continue;
    }
    return false;
  }
  return true;
};

/**
 * 处理Buffer编码方式
 * @param  {Buffer} buffer 待读取的Buffer
 * @return {String}        判断若为utf8可识别的编码则去掉bom返回utf8编码后的String，若不为utf8可识别编码则返回gbk编码后的String
 * @name readBuffer
 * @function
 */
_.readBuffer = function(buffer) {
  if (_.isUtf8(buffer)) {
    buffer = buffer.toString('utf8');
    if (buffer.charCodeAt(0) === 0xFEFF) {
      buffer = buffer.substring(1);
    }
  } else {
    buffer = getIconv().decode(buffer, 'gbk');
  }
  return buffer;
};

/**
 * 读取文件内容
 * @param  {String} path    路径
 * @param  {Boolean} convert 是否使用text方式转换文件内容的编码 @see readBuffer
 * @return {String}         文件内容
 * @name read
 * @function
 */
_.read = function(path, convert) {
  var content = false;
  if (_exists(path)) {
    content = fs.readFileSync(path);
    if (convert || _.isTextFile(path)) {
      content = _.readBuffer(content);
    }
  } else {
    console.log('unable to read file[%s]: No such file or directory.', path);
  }
  return content;
};

/**
 * 遵从RFC规范的文件上传功能实现
 * @param  {String}   url      上传的url
 * @param  {Object}   opt      配置
 * @param  {Object}   data     要上传的formdata，可传null
 * @param  {String}   content  上传文件的内容
 * @param  {String}   subpath  上传文件的文件名
 * @param  {Function} callback 上传后的回调
 * @name upload
 * @function
 */
_.upload = function(url, opt, data, content, subpath, callback) {
  if (typeof content === 'string') {
    content = new Buffer(content, 'utf8');
  } else if (!(content instanceof Buffer)) {
    console.log('unable to upload content [%s]', (typeof content));
  }
  opt = opt || {};
  data = data || {};
  var endl = '\r\n';
  var boundary = '-----np' + Math.random();
  var collect = [];
  _.map(data, function(key, value) {
    collect.push('--' + boundary + endl);
    collect.push('Content-Disposition: form-data; name="' + key + '"' + endl);
    collect.push(endl);
    collect.push(value + endl);
  });
  collect.push('--' + boundary + endl);
  collect.push('Content-Disposition: form-data; name="' + (opt.uploadField || "file") + '"; filename="' + subpath + '"' + endl);
  collect.push(endl);
  collect.push(content);
  collect.push(endl);
  collect.push('--' + boundary + '--' + endl);

  var length = 0;
  collect.forEach(function(ele) {
    if (typeof ele === 'string') {
      length += new Buffer(ele).length;
    } else {
      length += ele.length;
    }
  });

  opt.method = opt.method || 'POST';
  opt.headers = _.assign({
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': length
  }, opt.headers || {});
  opt = _.parseUrl(url, opt);
  var http = opt.protocol === 'https:' ? require('https') : require('http');
  var req = http.request(opt, function(res) {
    var status = res.statusCode;
    var body = '';
    res
      .on('data', function(chunk) {
        body += chunk;
      })
      .on('end', function() {
        if (status >= 200 && status < 300 || status === 304) {
          callback(null, body);
        } else {
          callback(status);
        }
      })
      .on('error', function(err) {
        callback(err.message || err);
      });
  });
  collect.forEach(function(d) {
    req.write(d);
  });
  req.end();
};
