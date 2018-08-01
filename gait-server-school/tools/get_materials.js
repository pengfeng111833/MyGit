'use strict';

const Fiber = require('fibers');
const wechat = require('../modules/lib/wechat');
const api = wechat.getApi();

function main() {
    const materialCount = api.getMaterialCount();
    const newsCount = materialCount.news_count;
    let type = process.argv[2];
    if ( !type ) {
        type = 'image';
    }

    let matrials = [];
    for ( let newsIndex = 0; newsIndex < newsCount; newsIndex += 20 ) {
        let matrialsDetails = api.getMaterials(type, newsIndex, 20);
        matrials = matrials.concat(matrialsDetails.item); 
    }

    console.log(JSON.stringify(matrials, null, 1));
}

Fiber(main).run();
