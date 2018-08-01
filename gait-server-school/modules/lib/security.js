'use strict'

module.exports = (function(){
    let crypto = require('crypto');

    function rsaSign(data, key, style) {
        if ( !style ) {
            style = 'hex';
        }

        let signer = crypto.createSign('RSA-SHA256');
        signer.update(data);

        return signer.sign(key, style);
    }

    function sha1(text) {
        var sha1Hasher = crypto.createHash('sha1');

        sha1Hasher.update(text);
        return sha1Hasher.digest('hex');
    }

    function md5(text) {
        var sha1Hasher = crypto.createHash('md5');

        sha1Hasher.update(text);
        return sha1Hasher.digest('hex');
    }

    return {
        sha1: sha1,
        rsaSign: rsaSign,
        md5: md5
    };
}());
