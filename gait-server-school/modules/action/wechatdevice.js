'use strict';

let sha1 = require('../lib/security').sha1;

let actionPostDevice = function(req, res) {
    console.log('req.body', req.body);
    res.json({
        'error_code': 0,
        'error_msg': 'ok'
    });
} ;   

let actionGetDevice = function(req, res) {
    console.log('req.query',req.query);
    let fields = [
        'measurex',
        req.query.timestamp,
        req.query.nonce
    ];
    console.log(fields);

    let sortFields = fields.sort();
    let signature = sortFields.join('');
    let sig = sha1(signature);
    console.log('sig', sig);
    if(sig == req.query.signature){
        res.send(req.query.echostr);
    }
    else{
       res.send('');
    }
};

let actionGetAppDevice = function(req, res) {
    console.log('req.query',req.query);
    let fields = [
        'measurex',
        req.query.timestamp,
        req.query.nonce
    ];
    console.log(fields);

    let sortFields = fields.sort();
    let signature = sortFields.join('');
    let sig = sha1(signature);
    console.log('sig', sig);
    if(sig == req.query.signature){
        res.send(req.query.echostr);
    }
    else{
       res.send('');
    }
};

module.exports = {
    actionGetDevice,
    actionPostDevice,
    actionGetAppDevice
}
