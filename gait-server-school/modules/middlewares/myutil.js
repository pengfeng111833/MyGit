
'use strict'

var crypto = require('crypto');

var md5 = function(content){
    var hasher=crypto.createHash("md5");
    hasher.update(content);
    return hasher.digest('hex');//hashmsg为加密之后的数据
};

module.exports = {
    md5
};
