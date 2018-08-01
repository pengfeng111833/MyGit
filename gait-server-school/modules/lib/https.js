'use strict'

let Fiber = require('fibers');
let https = require('https');
let lib = {
    http: require('./http')
}

function getFromUrl(url, options, parameters) {
    let fiber = Fiber.current;
    let isBlocking = false;
    let error = null;
    let responseContent = null;
    let data = new Buffer(0);

    if ( parameters ) {
        let queryString = lib.http.makeQueryString(parameters);
        if ( queryString ) {
            url += '?' + queryString;
        }
    }

    var req = https.request(url, function(res) {
        res.on('data', function(d) {
            data = Buffer.concat([data, d], data.length + d.length);
        });

        res.on('end', function() {
            if ( !options.raw ) {
                responseContent = data.toString('utf8');
            }
            else {
                responseContent = data;
            }

            fiber.run();
        });
    });

    req.on('error', function(e) {
        error = e;
        fiber.run();
    });

    req.end();

    Fiber.yield();

    if ( error ) {
        throw error;
    }

    return responseContent;
}

function get(options, parameters) {
    let fiber = Fiber.current;
    let isBlocking = false;
    let error = null;
    let responseContent = null;
    let data = new Buffer(0);

    if ( parameters ) {
        let queryString = lib.http.makeQueryString(parameters);
        if ( queryString ) {
            options.path += '?' + queryString;
        }
    }

    var req = https.request(options, function(res) {
        res.on('data', function(d) {
            data = Buffer.concat([data, d], data.length + d.length);
        });

        res.on('end', function() {
            if ( !options.raw ) {
                responseContent = data.toString('utf8');
            }
            else {
                responseContent = data;
            }

            fiber.run();
        });
    });

    req.on('error', function(e) {
        error = e;
        fiber.run();
    });

    req.end();

    Fiber.yield();

    if ( error ) {
        throw error;
    }

    return responseContent;
}

module.exports = {
    getFromUrl: getFromUrl,
    get: get
};
