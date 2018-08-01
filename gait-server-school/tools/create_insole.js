'use strict'

const models = require('../modules/model/index');
const lib = {
    wechatDevice: require('../modules/lib/wechat_device'),
    insole_device: require('../modules/lib/insole_device'),
    util: require('../modules/lib/util')
};
const deviceConfig = require('../config/device');

const createFiber = require('fibers');


const fs = require('fs');
const iconv = require('iconv-lite');

const Device = models.Device;
const deviceDao = models.deviceDao;

function main() {
    let file = './data/insole.csv';
    let device = deviceDao.find({
    });
    let data1= [["wechatId", "macAddress"]];
    for(let i=0;i<device.length;i++){
        data1.push([device[i].wechatId, device[i].macAddress]);
    }
    for(let i=0;i<data1.length;i++){
        let arr = data1[i]+"\n";
        fs.appendFile(file, arr, function(err){
            if(err)
                console.log("fail " + err);
            else
                console.log("写入文件ok");
        });
    }
}

createFiber(main).run();