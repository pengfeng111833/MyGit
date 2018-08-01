'use strict';

const lib = {
    wechatDevice: require('../modules/lib/wechat_device'),
    insole_device: require('../modules/lib/insole_device')
};

const createFiber = require('fibers');

function main() {
    const api = lib.wechatDevice.getApi();

    const deviceId = '011110100042';
    const deviceType = 'gh_a8d4fbfb0d58';
    // kinuxroot
    //const openId = 'oU6VeuFbTHwcN6NE_xN5ru5qxszA';
    // dachui
    //const openId = 'oU6VeuBVHKfVGO_nO2sX1p-LpQx0';
    //mia
   // const openId = 'oU6VeuBbExy-V50gq_pFF6AahbGI';
    //testBatteryLevel();
    //testSportResults();
	//testInsoleHead()
     //const userProfileText = base64OfUserProfile(0);
    console.log(api.getOpenIds(deviceType, deviceId));
    //console.log('api is :',api.getStatus(deviceId));
    //console.log('deviceId is :',api.getQrCode([deviceId]));
    //console.log(api.transportMessage(deviceType,
    //             deviceId,
    //             openId,
    //             userProfileText));
    //console.log(userProfileText);
    //const authorizeResult = api.authorizeDevices('24884', '0', [{
    //    id: deviceId,
    //    mac: 'FCC3AF4E1FF0',
    //    connect_protocol: '3',
    //    close_strategy: '1',
    //    conn_strategy: '1',
    //    crypt_method: '0',
    //    auth_ver: '0',
    //    manu_mac_pos: '-1',
    //    ser_mac_pos: '-1',
    //}]);

    //console.log(authorizeResult);
}

const UserProfile = lib.insole_device.UserProfile;
const InsoleRequest = lib.insole_device.InsoleRequest;
const InsoleResponse = lib.insole_device.InsoleResponse;
const InsoleHead = lib.insole_device.InsoleHead;
const BatteryLevel = lib.insole_device.BatteryLevel;
const SportResults = lib.insole_device.SportResults;

function base64OfUserProfile(profileIndex) {
    const userProfileData = [{
        sex: UserProfile.Sex.Male,
        age: 25,
        weight: 55,
        stepTarget: 9999,
        caloriesTarget: 8000,
        distanceTarget: 8,
        time: new Date()
    }, {
        sex: UserProfile.Sex.Female,
        age: 18,
        weight: 40,
        stepTarget: 9999,
        caloriesTarget: 8000,
        distanceTarget: 8,
        time: new Date()
    }];

    const userProfile = new UserProfile(userProfileData[profileIndex]);

    const userProfileResponse = new InsoleResponse({
        command: InsoleHead.Command.UserProfileResp,
        body: userProfile.toBuffer()
    });

    return userProfileResponse.toBase64();
}

function testBatteryLevel() {
    const buffer = new Buffer.from([0x64]);
    console.log(buffer);
    const batteryLevel = BatteryLevel.FromBuffer(buffer);

    console.log(batteryLevel);
}
function testInsoleHead() {
	// const head = new InsoleHead({
		// magicCode: 12,
		// version: 1,
		// totalLength: 20,
		// cmdId: 2,
		// seq: 0,
		// errorCode: 0
	// });
	// let head = new InsoleHead({
		// magicCode: 65536,
		// version: 65536,
		// totalLength: 65536,
		// cmdId: 65536,
		// seq: 65536,
		// errorCode: 65536
	// });
	
	const userProfile = new UserProfile({
		sex: 1,
		age: 23,
		weight: 50,
		stepTarget: 10000,
		caloriesTarget: 300,
		distanceTarget: 10,
		time: new Date()
	});		
	//	2016110815302

	console.log('time',userProfile.time);
	console.log('buffer is ', userProfile.toBuffer());
	
	const buffer1 = new Buffer.from([
		 0x00, 0x0c, 0x00, 0x01, 
		 0x00, 0x14, 0x00, 0x02 , 
		 0x00, 0x00 ,0x00, 0x00
	]);
	const headInfo = InsoleHead.FromBuffer(buffer1);
}

function testSportResults() {
    const buffer = new Buffer.from([
        0x02,
        0x00, 0x00, 0x01, 0x28,
        0x00, 0x00, 0x10, 0x02,
        0x00, 0x00, 0x05, 0x16,
        0x00, 0x00, 0x00, 0x92,
        0x00, 0x00, 0x00, 0x66,
        0x00, 0x00, 0x00, 0x78,
        0x00, 0x00, 0x00, 0x5,
        0x00, 0x00, 0x00, 0x8,
        0x00, 0x00, 0x00, 0x4
    ]);
    const sportResults = SportResults.FromBuffer(buffer);

    console.log(sportResults);
}

createFiber(main).run();
