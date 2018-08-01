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
	let device = new Device({
		snCode: 'CIAE012BF7',
		batteryInfo: 100,
		version: 'v1.1.0',
		wechatType: deviceConfig.wechatType
	});
    let method = '0';
    if ( process.argv[2] == 'update' ) {
        method = '1';
    }

	parseFile.forEach(function(item){
		console.log('id type is',typeof(item.wechatId));
        if(typeof(item.wechatId )== 'string'){
            let device = deviceDao.findOne({
                wechatId: item.wechatId
            });

            console.log(item);
            let mac = lib.util.replaceAll(item.macAddress, ':', '');
            console.log(mac);
            if(device == null){
                item.snCode = 'CIAE012BF7';
                item.version = 'v1.1.0';
                let deviceInfo = new Device(item);
                deviceDao.create(deviceInfo);
            }

            let params = {
                id: item.wechatId,
                mac: mac,
                connect_protocol: '3',
                close_strategy: '2',
                conn_strategy: '5',
                crypt_method: '0',
                auth_ver: '0',
                manu_mac_pos: '-1',
                ser_mac_pos: '-1'
            };
            console.log(params);

            const authorizeResult = api.authorizeDevices(deviceConfig.productId, method, [params]);
            console.log(JSON.stringify(authorizeResult, null, ' '));
		}
	});
}

createFiber(main).run();
