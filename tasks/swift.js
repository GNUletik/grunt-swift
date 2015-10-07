// Generated by CoffeeScript 1.8.0
(function() {
  var SwiftUpload, async, glob, storage;

  async = require('async');

  glob = require('glob');

  storage = require('openstack-storage');

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  SwiftUpload = (function() {
    function SwiftUpload(options, logger, cb) {
      var authFn;
      this.options = options;
      this.logger = logger || console.log;
      authFn = async.apply(storage.authenticate, this.options);
      this.service = new storage.OpenStackStorage(authFn, (function(_this) {
        return function(err, res, tokens) {
          _this.tokens = tokens;
          _this.logger('[Swift Auth] ' + res.statusCode + ' - ' + tokens.id);
          return cb(_this);
        };
      })(this));
    }

    SwiftUpload.prototype.uploadFiles = function(path, cb) {
      return glob(path, (function(_this) {
        return function(err, files) {
          var counter, file, _i, _len;
          counter = 0;
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            file = files[_i];
            _this.uploadFile(file, function() {
              return counter += 1;
            });
          }
          return setInterval(function() {
            if (counter === files.length) {
              return cb();
            }
          }, 200);
        };
      })(this));
    };

    SwiftUpload.prototype.uploadFile = function(filename, cb) {
      var putFileOptions, remoteName;
      remoteName = this.options.storagePath + filename.replace('dist', '');
      putFileOptions = {
        remoteName: remoteName,
        localFile: filename
      };
      return this.service.putFile(this.options.container, putFileOptions, (function(_this) {
        return function(err, statusCode) {
          var url;
          url = _this.tokens.storageUrl + '/' + _this.options.container + '/' + remoteName;
          _this.logger('[Swift upload] ' + statusCode + ' - ' + url);
          if (err) {
            _this.logger(err);
          }
          return cb();
        };
      })(this));
    };

    return SwiftUpload;

  })();

  module.exports = SwiftUpload;

}).call(this);
