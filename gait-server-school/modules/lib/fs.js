'use strict';

const fs = require('fs');
const lib = {
    util: require('./util')
};
const fiberify = lib.util.fiberify;

module.exports = {
    writeFile: fiberify(fs.writeFile),
    readFile: fiberify(fs.readFile),
    open: fiberify(fs.open),
    close: fiberify(fs.close),
    read: fiberify(fs.read),
    write: fiberify(fs.write)
};
