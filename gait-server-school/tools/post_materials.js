'use strict';

const fs = require('fs');
const Fiber = require('fibers');
const wechat = require('../modules/lib/wechat');

function main() {
    let type = process.argv[2];
    let materialId = process.argv[3];
    let listFile = process.argv[4];

    const openIds = readOpenIds(listFile);
    console.log(openIds);

    if ( type == 'news' ) {
        sendNews(materialId, openIds);
    }
}

function readOpenIds(listFile) {
    const fileContent = fs.readFileSync(listFile, 'utf-8');

    return fileContent.split('\n').filter(line => line && line.trim()).map(line => line.trim());
}

function sendNews(materialId, openIds) {
    const api = wechat.getApi();
    const result = api.massSendNews(materialId, openIds);

    console.log(JSON.stringify(result, null, 1));
}

Fiber(main).run();
