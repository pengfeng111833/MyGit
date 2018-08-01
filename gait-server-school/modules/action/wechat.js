'use strict';

const Fiber = require('fibers');
const wechat = require('wechat');
const config = require('../../config');

const models = require('../model/index');

const http = require('http');

const User = models.User;
const Device = models.Device;
const SportRecord = models.SportRecord;
const Role = models.Role;
const Person = models.Person;
const WechatUser = models.WechatUser;
const City = models.City;
const userDao = models.userDao;
const deviceDao = models.deviceDao;
const sportRecordDao = models.sportRecordDao;
const roleDao = models.roleDao;
const personDao = models.personDao;
const wechatUserDao = models.wechatUserDao;
const cityDao = models.cityDao;

let deviceMessage = {};

const lib = {
    wechat: require('../lib/wechat'),
    insole_device: require('../lib/insole_device'),
    loggers: require('../lib/loggers'),
    HttpClient: require('../lib/http_client')
};

const outputLogger = lib.loggers.output;

const WechatServer = lib.wechat.WechatServer;

const InsoleMessage = lib.insole_device.InsoleMessage;
const BatteryLevel = lib.insole_device.BatteryLevel;
const SportResults = lib.insole_device.SportResults;
const deviceAction = require('./device');
const userAction = require('./user');

const InsoleResponse = lib.insole_device.InsoleResponse;
const InsoleHead = lib.insole_device.InsoleHead;

const wechatService = require('../service/wechat');

const Sequences = {
};

const wechatServer = WechatServer
    .createServer(config.wechat.basic)
    .onText((message, req, res) => {
        console.log(message);
        try {
            let api = lib.wechat.getApi();
            api.sendText(config.wechat.customerService.openId, message.Content);
        }
        catch (e) {
            outputLogger.error(e);
        }

        return {
            type: 'transfer_customer_service',
            content: {
                kfAccount: 'kf2001@gh_a8d4fbfb0d58'
            }
        };
    })
    .onDeviceText((wechatMessage, req, res) => {
        let date1 = new Date();
        //const insoleMessage = InsoleMessage.FromWechatMessage(wechatMessage);
        //const cmdId = insoleMessage.head.cmdId;
    	const deviceId = wechatMessage.DeviceID;
    	const openId = wechatMessage.OpenID;
        const deviceType = wechatMessage.DeviceType;
        //console.log('insoleMessage', insoleMessage);
        //console.log('body', insoleMessage.body);
        //console.log(insoleMessage.body.length);
        //console.log(insoleMessage.body.toString());
        //console.log('cmdId is ',cmdId);
        let response = '';

        let seq = Sequences[openId];
        if ( !seq ) {
            seq = 3;
        }
        Sequences[openId] = seq + 1;

        //if(cmdId == 8193){
        //    response = deviceAction.actionGetUserProfile(deviceId, openId, seq);
        //}
        //if (cmdId == 12289) {
        //    let batteryLevel = BatteryLevel.FromBuffer(insoleMessage.body);
        //    response = deviceAction.actionUpdateBatteryInfo(deviceId, batteryLevel, seq);
        //}
        //if (cmdId == 16385) {
            //let sportResults = SportResults.FromBuffer(insoleMessage.body);
            //response = deviceAction.actionAddSportRecord(openId, deviceId, sportResults, seq);
            const sportResponse = new InsoleResponse({
                command: InsoleHead.Command.RunningResultResp,
                seq: seq,
                body: new Buffer(0)
            });
            response = sportResponse.toBuffer();
        //}
        console.log(response);
        console.log('Seq: ', seq);
        return response;
    })
    .onDeviceEvent('bind', (message, req, res) => {
        console.log(message);
		let openId = message.FromUserName;
        let deviceId = message.DeviceID;
		wechatService.bindDevice(openId, deviceId);
        return 1;
    })
    .onDeviceEvent('unbind', (message, req, res) => {
        console.log(message);
		let openId = message.FromUserName;
        let deviceId = message.DeviceID;
        wechatService.unbindDevice(openId, deviceId);
        
        return 1;
    })
    .onEvent('LOCATION', (message, req, res) => {
        console.log('onLocation');
        actionSaveUserCity(message);
        //return 'success';
    })
    .onEvent('subscribe', (message, req, res) => {
        console.log(message);
		const openId = message.FromUserName;
		deviceAction.createUser(openId);

        wechatService.delayBindDevice(openId);
        //return '欢迎关注智青春智能鞋垫';

        return config.wechat.messages.subscribe;
    })
	.onEvent('unsubscribe', (message, req, res) => {
        console.log(message);
    })
    .onEvent('CLICK', (message, req, res) => {
        if ( message.EventKey === 'rank_list' ) {
            return {
                type: 'hardware',
                HardWare:{
                    MessageView: 'myrank',
                    MessageAction: 'ranklist'
                }
            };
        }
    })
    .onDefaultEvent((message, req, res) => {
        console.log(message);

        const eventName = message.Event;
        console.log(`Ignore event ${eventName}`);

        return '你好';
    });

const actionDispatcher = wechatServer.getDispatcher();

function actionWechatLogin(req, res) {
    const code = req.query.code;
	if(!code){
        console.log('no log');
		res.json({
			successful: false
		});
		return ;
	}
	let authUserInfo = null;	
	if (req.session.login) {
		res.json({
			successful: true
		});
        return ;
	}
	const authInfo = lib.wechat.getAuthToken(code);
    let openId = authInfo.openId;
    let wechatUser = wechatUserDao.findOne({
		openId: openId
	});
		
    if ( !wechatUser || !wechatUser.user || !wechatUser.user.headImageUrl ) {
        authUserInfo = lib.wechat.getAuthUserInfo(authInfo);
    }

	if(wechatUser != null){
		let user = wechatUser.user;

        if ( authUserInfo ) {
            user.headImageUrl = authUserInfo.userInfo.headimgurl;
            userDao.update(user);
        }

		req.session.login = {
			user: user.id
		};
		res.json({
            successful: true
		});

        return ;
    }

    openId = authUserInfo.userInfo.openid;
    const result = deviceAction.createUser(openId);
	wechatUser = wechatUserDao.findOne({
		openId: openId
	});

	let user = wechatUser.user;
    user.headImageUrl = authUserInfo.userInfo.headimgurl;
    userDao.update(user);

	req.session.login = {
		user: user.id
	};

    console.log('session id is: ',req.session.login);
    res.json({
        successful: true
    });

    return ;  
}

function actionWechatDebugLogin(req, res) {
    const userId = req.query.user;
	let user = userDao.findOne({
        id: userId
    });

	req.session.login = {
		user: user.id
	};

    console.log('session id is: ',req.session.login);
    res.json({
        successful: true
    });
}

function actionGetJsConfig(req, res) {
    let api = lib.wechat.getApi();
    let wechatConfig = config.wechat;

    let url = req.body.url;
    let jsParams = {
        debug: wechatConfig.js.debug,
        jsApiList: wechatConfig.js.jsApiList,
        url: url
    };

    let ticket = api.getTicket().ticket;
    let jsConfig = api.getJsConfig(wechatConfig.js);
    lib.wechat.calcJsConfigSignature(ticket, url, jsConfig);

    res.json({
        successful: true,
        data: {
            jsConfig: jsConfig
        }
    });
}

function actionSaveUserCity(req, res) {
    const ApiKey = "xq0addkGCgTfARDSGaM4os7M5QRWTKoI";
    let openId = req.FromUserName;
    const wechatUser = wechatUserDao.findOne({
        openId: openId
    });
    if(wechatUser == null){
        console.log('the wechatUser is null');
        res.json({
            successful: false
        });
        return;
    }
    let person = personDao.findOne({
        user: wechatUser.user.id
    });
    if(person == null){
        console.log('the person is null');
        res.json({
            successful: false
        });
        return;
    }
    let oldCity = cityDao.findOne({
        name: person.city
    });
    if(oldCity == null){
        console.log('the old city ', person.city, ' is not in list');
        res.json({
            successful: false
        });
        return;
    }

    let now = new Date();
    let nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let date = new Date(1970, 0, 1);
    if(person.cityTime != null){
        date =  person.cityTime;
    }
    let dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if(nowDay.getTime() != dateDay.getTime()){
        let location = req.Latitude + ',' + req.Longitude;
        let query = {
            location: location,
            output: 'json',
            ak: ApiKey
        };
        let client = new lib.HttpClient();
        const result = client.requestSync({
            requester: http.request,
            method: 'get',
            host: 'api.map.baidu.com',
            path: '/geocoder/v2/',
            query: query
        });
        const data = JSON.parse(result.data);
        console.log("data", data);

        let str = data.result.addressComponent.city;
        let city = str.substring(0,str.length-1);

        if(person.city != city){
            person.city = city;
            person.cityTime = now;
            personDao.update(person);
            console.log("update person city");

            let newCity = cityDao.findOne({
                name: city
            });
            if(newCity == null){
                console.log('the new city is not in list');
                res.json({
                    successful: false
                });
                return;
            }
            oldCity.num -= 1;
            newCity.num += 1;
            cityDao.update(oldCity);
            cityDao.update(newCity);
            console.log("update city num");
        }
        else{
            person.cityTime = now;
            personDao.update(person);
            console.log("update person cityTime");
        }
    }
    return 1;
}

module.exports = {
    actionDispatcher,
    actionWechatLogin,
    actionWechatDebugLogin,
    actionGetJsConfig
    //actionSaveUserCity
};
//Fiber(actionSaveUserCity).run();
