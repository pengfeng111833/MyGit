'use strict'

const models = require('../modules/model/index');
const lib = {
    wechatDevice: require('../modules/lib/wechat_device'),
    insole_device: require('../modules/lib/insole_device'),
    util: require('../modules/lib/util')
};
const deviceConfig = require('../config/device');

const createFiber = require('fibers');
let csv = require('../modules/lib/csv');
let csvParser = new csv.CsvParser;

const Device = models.Device;
const deviceDao = models.deviceDao;

function main() {
	const api = lib.wechatDevice.getApi();
	
	let parseFile = csvParser.parseFile('./data/insole.csv');

	parseFile.forEach(function(item){
        let deviceId = item.wechatId;

        let result = api.getQrCode([deviceId]);
        let qrCode = result.code_list[0].ticket;
        console.log(`${deviceId} ${qrCode}`);
	});
}

createFiber(main).run();
