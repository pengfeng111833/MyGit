'use strict'

let Fiber = require('fibers');
let http = require('http');
let querystring = require('querystring');

//options = {
//    hostname: '',
//    port: '',
//    path: '',
//};
function get(options, parameters) {
    let fiber = Fiber.current;
    let error = null;

    if ( parameters ) {
        let queryString = makeQueryString(parameters);
        if ( queryString ) {
            options.path += '?' + queryString;
        }
    }

    options.method = 'GET';
    let responseContent = '';
    var req = http.request(options, function(res) {
        res.on('data', function(d) {
            responseContent = responseContent + d.toString('utf8');
        });

        res.on('end', function() {
            fiber.run();
        });
    });
    req.end();

    req.on('error', function(e) {
        error = e;
        fiber.run();
    });

    if ( error ) {
        throw error;
    }

    Fiber.yield();

    return responseContent;
}

//function post(options, parameters) {
//    let fiber = Fiber.current;
//    let error = null;
//    let responseContent = null;
//
//    if ( parameters ) {
//        let queryString = makeQueryString(parameters);
//        if ( queryString ) {
//            options.path += '?' + queryString;
//        }
//    }
//
//    options.method = 'POST';
//    var req = http.request(options, function(res) {
//        res.on('data', function(d) {
//            responseContent = d.toString('utf8');
//            fiber.run();
//        });
//    });
//    req.end();
//
//    req.on('error', function(e) {
//        error = e;
//        fiber.run();
//    });
//
//    if ( error ) {
//        throw error;
//    }
//
//    Fiber.yield();
//
//    return responseContent;
//}

function postForm(options, parameters, obj) {
    let data = null;
    if ( obj ) {
        data = querystring.stringify(obj);

        if ( !options.headers ) {
            options.headers = {};
        }

        options.headers['Content-Type'] = 'multipart/form-data';
    }

    return post(options, parameters, data);
}

function post(options, parameters, data) {
    let fiber = Fiber.current;
    let error = null;
    let responseContent = null;

    if ( parameters ) {
        let queryString = makeQueryString(parameters);
        if ( queryString ) {
            options.path += '?' + queryString;
        }
    }

    options.method = 'POST';

    if ( data ) {
        if ( !options.headers ) {
            options.headers = {};
        }

        options.headers['Content-Length'] = data.length;
    }

    var req = http.request(options, function(res) {
        res.on('data', function(d) {
            responseContent = d.toString('utf8');
            fiber.run();
        });
    });

    if ( data ) {
        req.write(data + '\n');
    }

    req.end();

    req.on('error', function(e) {
        error = e;
        fiber.run();
    });

    if ( error ) {
        throw error;
    }

    Fiber.yield();

    return responseContent;
}

function makeQueryString(parameters, options) {
    if ( options ) {
        return makeQueryStringWithOptions(parameters, options);
    }

    let parameterList = [];
    for ( let key in parameters ) {
        let value = parameters[key];

        parameterList.push(key + '=' + value);
    }

    return parameterList.join('&');
}

function makeQueryStringWithOptions(parameters, options) {
    let keyList = Object.keys(parameters).sort();
    let parameterList = keyList.map(key => {
        let value = parameters[key];
        if ( value ) {
            if ( options.urlEncoding) {
                value = encodeURIComponent(value);
            }
            return key + '=' + value;
        }

        return null;
    }).filter(parameter => {
        return parameter != null;
    });

    return parameterList.join('&');
}

function getFromUrl(url, options, parameters) {
    let fiber = Fiber.current;
    let isBlocking = false;
    let error = null;
    let responseContent = null;
    let data = new Buffer(0);

    if ( parameters ) {
        let queryString = makeQueryString(parameters);
        if ( queryString ) {
            url += '?' + queryString;
        }
    }

    var req = http.request(url, function(res) {
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
    get: get,
    post: post,
    postForm,
    makeQueryString,
    getFromUrl
};
