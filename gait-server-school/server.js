'use strict';

let express = require('express');
let config = require('./config');
let bodyParser = require('body-parser');
let wechat = require('./modules/action/wechat');
let wechatdevice = require('./modules/action/wechatdevice');
let user = require('./modules/action/user');
let device = require('./modules/action/device');
// let serverInfo = require('./config/server');
let fibers = require('./modules/middlewares/fibers');
let ffFixer = require('./modules/middlewares/ff-http-fixer');
let generalAction = require('./modules/action/general');
let session = require('express-session');
let cookieParser = require('cookie-parser');
let MongoStore = require('connect-mongo')(session);
let app = express();
let uploads = require('./uploads');// 调用上传图片接口   未测试

let myApp = {
    combineSubOptions(options, optionNames) {
        let subOptions = {};
        optionNames
            .filter(optionName => optionName in options)
            .forEach(optionName => {
                subOptions[optionName] = options[optionName]
            });

        return subOptions;
    },
    get(url, action) {
        return myApp.handle('get', url, action.handler, action);
    },
    post(url, action) {
        return myApp.handle('post', url, action.handler, action);
    },
    handle(method, url, callback, options) {
        let grantOptions = null;
        let fieldOptions = null;
        if ( options ) {
            grantOptions = myApp.combineSubOptions(options, [
                    'login', 'privileges', 'roles'
            ]);

            fieldOptions = myApp.combineSubOptions(options, [
                    'fields'
            ]);
        }

        app[method](url, generalAction(callback, grantOptions, fieldOptions));
    }
};

app.use(cookieParser());
//app.use(function(req, res, next) {
//    console.log(req.path);
//
//    next();
//});
app.use(session({
	resave: true,
	secret: '123456',
	key:'user_sample',
	cookie: {
		maxAge:1000*60*60*24*30
	},
    saveUninitialized: true,
    store: new MongoStore({
        url:'mongodb://localhost/user_sample_session',
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'interval',
        autoRemoveInterval: 10
    })
}));

app.use(express.query());
app.use(express.static(__dirname + '/public'));
app.use(ffFixer.firefoxHttpRequesterFixer());
app.use(bodyParser.json());

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    next();
});


app.use(fibers);
app.post('/uploads',uploads.upload);//图片上传功能接口  2018-05-09    未测试
app.get('/wechat/device',wechatdevice.actionGetDevice);
app.post('/wechat/device',wechatdevice.actionPostDevice);

app.get('/wechat/appDevice', wechatdevice.actionGetAppDevice);

// myApp.post('/person/create', user.actionCreateUser);
myApp.post('/person/create',user.actionInitUser);//用户表创建用户账号
myApp.post('/person/Logins', user.actionUserLogin);
myApp.post('/person/complete', user.actionInitInfo);//person表新增用户个人信息   //旧的以后清掉 old
myApp.post('/person/complete_app', user.actionInitInfo_app);//app端口person表新增用户个人信息
myApp.get('/person/abstract', user.actionGetPageInfo);   //旧的以后清掉 old

myApp.get('/person/:userId/newAbstract', user.actionNewAbstract);//个人运动界面数据整合 2018-05-30

myApp.get('/person/:userId/abstract_app', user.actionGetPageInfo_app);//app端口获取用户个人运动信息  //旧的以后清掉 old
myApp.get('/person/:userId/getUserInfo_app', user.actionGetPersonInfo_app);//app端口获取用户个人详细信息
myApp.get('/person/getUserInfo', user.actionGetPersonInfo);   //旧的以后清掉 old
myApp.post('/person/update', user.actionUpdateInfo);    //旧的以后清掉 old
myApp.post('/person/update_app', user.actionUpdateInfo_app);           //修改个人信息接口
myApp.post('/person/:userId/updateCredit', user.actionUpdateCredit);   //修改个人积分信息接口 new
myApp.post('/person/updateStep_app', user.actionUpdateStep_app);       //修改目标步数接口
myApp.post('/person/WechatQQLogin_app', user.actionWechatQQLogin_app);//qq微信第三方登录方式 pengfeng   2017-11-20
myApp.post('/person/WechatCreate_app', user.actionWechatCreate_app);//qq微信第三方首次登录并且创建用户 pengfeng   2017-11-20
myApp.post('/person/WechatBind', user.actionWechatBind);//qq微信第三方首次登录并且绑定用户 pengfeng   2018-06-22

//用户重置密码为123456
myApp.post('/person/ResetPassword', user.actionResetPassword);//重置用户密码  new
//用户重新设置密码
myApp.post('/person/:userId/UpdatePassword', user.actionUpdatePassword);
//用户修改头像关联接口  2018-05-30
myApp.post('/person/:userId/updateHeadImage', user.actionUpdateHeadImage);

// 上传图片接口
myApp.post('/person/upload_image', user.actionUploadImage);

//个人签到打卡模块接口
myApp.post('/person/:userId/checkAdd', user.actionCheckAdd);//添加签到记录  new
myApp.get('/person/:userId/checkInfo', user.actionCheckInfo);//查询签到信息 new
myApp.get('/person/:userId/checkList', user.actionCheckList);//查询签到信息列表 new

//积分兑换产品表接口
myApp.post('/person/productAdd', user.actionProductAdd);//添加产品记录  new
myApp.get('/person/:productId/productInfo', user.actionProductInfo);//查询产品信息 new
myApp.get('/person/productList', user.actionProductList);//查询产品信息列表 new

myApp.get('/person/personHotList', user.actionPersonHotList);//查询用户的活跃信息                web端统计
myApp.get('/person/personSportCount', user.actionPersonSportCount);//统计终端绑定数和注册人数     web端统计
myApp.get('/person/TodaySport', user.actionTodaySport);//统计终端数据同步数                      web端统计
myApp.get('/person/WeekSport', user.actionWeekSport);//统计终端数据七天内同步数                   web端统计
myApp.get('/person/TopSetpSport', user.actionTopSetpSport);//统计终端步数前3的用户信息            web端统计
myApp.get('/person/MaxSetpList', user.actionMaxSetpList);//统计七天内终端步数大于1500步的用户      web端统计
myApp.get('/person/CheckInfoList', user.actionCheckInfoList);//统计当日打卡用户列表               web端统计
myApp.get('/person/CheckSevenDayList', user.actionCheckSevenDayList);//统计7天内打卡的用户列表    web端统计
myApp.get('/person/AllPersonSport', user.actionAllPersonSport);//统计所有用户打卡天数，同步数据天数的列表   web端统计
myApp.get('/device/AllResetList',user.actionAllResetList);//查询每天所有终端reset记录   web端统计


//积分兑换表接口
myApp.post('/person/exchangeAdd', user.actionExchangeAdd);//添加积分兑换记录  new
myApp.get('/person/:userId/exchangeInfo', user.actionExchangeInfo);//查询积分兑换信息 new
myApp.get('/person/:userId/exchangeList', user.actionExchangeList);//查询积分兑换信息列表 new

// 步数兑换成积分的接口
myApp.post('/person/exchangeStep', user.actionExchangeStep);//步数兑换成积分的接口  new

myApp.post('/person/:userId/exchangeUserStep', user.actionExchangeUserStep);//多终端步数兑换成积分的接口  2018-05-30 all new
myApp.get('/person/:userId/userStepExchange', user.actionUserStepExchange);//查询步数兑换成积分记录接口  2018-06-01 all new

myApp.post('/person/NewExchangeStep', user.actionNewExchangeStep);//步数兑换成积分的接口  new
myApp.post('/person/StepExchangeAdd', user.actionStepExchangeAdd);//步数兑换成积分记录新增接口  new
myApp.get('/person/:userId/StepExchangeInfo', user.actionStepExchangeInfo);//查询步数兑换成积分记录接口  new

myApp.get('/person/personInfoIsNull', user.actionPersonIsNull);
myApp.get('/person/devices', user.actionGetPersonDevices);
myApp.get('/device/:deviceId/history/distance', user.actionGetHistoryDistance);
myApp.get('/device/:deviceId/history/steps', user.actionGetHistorySteps);
myApp.get('/device/:deviceId/history/calories', user.actionGetHistoryCalories);
myApp.get('/device/:deviceId/sportModel', user.actionGetSportModel);
myApp.post('/device/:deviceId/modifyRemark', user.actionModifyRemark);
myApp.post('/device/:deviceId/unbound', user.actionDeviceUnbound);
myApp.get('/device/:deviceId/UserProfile', user.actionUserProfile);


myApp.post('/device/:macAddress/jumpTime', user.actionJumpTime);//设置跳跃时间
myApp.post('/device/:macAddress/jumpAdd', user.actionJumpAdd);//添加跳跃记录
myApp.get('/device/:macAddress/jumpInfo', user.actionJumpInfo);//查询跳跃信息
myApp.get('/device/:macAddress/jumpInfoList', user.actionJumpInfoList);//查询跳跃信息

//关于手机型号信息采集的接口
myApp.post('/device/:userId/phoneAdd',user.actionPhoneAdd);
myApp.get('/device/:macAddress/phoneInfo', user.actionPhoneInfo);//根据mac地址查询手机信息
myApp.get('/device/:userId/phoneList',user.actionPhoneList);


//关于周末赛事活动信息发布的接口
myApp.post('/device/:userId/sportMatchAdd',user.actionSportMatchAdd);//添加赛事信息
myApp.post('/device/:matchId/sportMatchStatue',user.actionSportMatchStatue);//修改赛事信息状态  allNew 2018-06-06
myApp.get('/device/:matchId/sportMatchInfo', user.actionSportMatchInfo);//查询赛事信息

myApp.get('/device/:matchId/historyMatchInfo', user.actionHistoryMatchInfo);//查询历史赛事信息  allNew 2018-06-06
myApp.get('/device/historyMatchList',user.actionHistoryMatchList);//查询所有历史赛事信息列表  allNew 2018-06-06

myApp.get('/device/sportMatchList',user.actionSportMatchList);//查询所有赛事信息列表

//参加赛事人员的接口
myApp.post('/device/:matchId/attendAdd',user.actionAttendAdd);//添加参赛人员
myApp.get('/device/:matchId/attendList',user.actionAttendList);//查询所有赛事人员列表
myApp.get('/device/:matchId/attendResult',user.actionAttendResult);//查询所有赛事人员列表并按步数排序
myApp.get('/device/:userId/attendMatchList',user.actionAttendMatchList);//查询人员所参与的赛事信息


//参加赛事的团队接口
myApp.post('/device/:matchId/attendGroupAdd',user.actionAttendGroupAdd);//添加参赛人员
myApp.post('/device/:matchId/attendGroupExit',user.actionAttendGroupExit);//退出当前赛队
myApp.get('/device/:matchId/attendGroupList',user.actionAttendGroupList);//查询所有赛事人员列表
myApp.get('/device/:matchId/attendGroupVerson',user.actionAttendGroupVerson);//查询所有赛事人员终端版本列表   2018-06-11
myApp.get('/device/deviceVerson',user.actionDeviceVerson);//查询所有人员终端版本列表   2018-06-25
myApp.get('/device/:userId/attendGroupMatchList',user.actionAttendGroupMatchList);//查询人员所参与的赛事信息

myApp.post('/device/:matchId/attendGroupScoreList',user.actionAttendGroupScoreList);//查询团队成绩列表
myApp.post('/device/:matchId/attendGroupTotalScore',user.attendGroupTotalScore);//查询团队所有人成绩
myApp.get('/device/:matchId/attendGroupMatchScoreList',user.attendGroupMatchScoreList);//查询团队人员所参与的赛事的成绩 2018-05-18

// myApp.get('/device/:matchId/attendGroupTotal',user.actionAttendGroupTotal);//查询团队人员所参与的赛事的总成绩和个人成绩 2018-06-11

myApp.post('/device/:userId/resetAdd',user.actionResetAdd);//终端reset记录新增
myApp.get('/device/:macAddress/resetInfo', user.actionResetInfo);//终端reset记录查找
myApp.get('/device/:userId/macResetList',user.actionMacResetList);//查询用户账号下所有终端reset记录

//排行榜积分领取记录
myApp.post('/device/:userId/RankRewardAdd',user.actionRankRewardAdd);
myApp.get('/device/:userId/RankRewardInfo', user.actionRankRewardInfo);//根据userid查询当日排行奖励信息


myApp.get('/device/:deviceId/boundInfo', user.actionDeviceBoundInfo);//设备绑定信息详情
myApp.post('/device/:deviceId/SaveBatteryInfo', user.actionSaveBatteryInfo);//保存电池信息  //旧的以后清掉 old
myApp.post('/device/:deviceId/SaveSportInfo', user.actionSaveSportInfo);    //旧的以后清掉 old
//新增通过mac地址获取deviceid的数据信息 pengfeng  2017-11-07
myApp.get('/device/:macAddress/getDeviceId_app', user.actionGetDeviceId);
//新增安卓通过mac获取备注数据信息 pengfeng  2017-11-13
myApp.post('/device/:macAddress/modifyRemark_app', user.actionModifyRemark_app);
//新增安卓通过mac绑定终端和用户 pengfeng  2017-11-13
myApp.post('/device/:macAddress/NewBound_app', user.actionDeviceNewbound_app);
//新增安卓通过mac获取没有绑定的数据信息 pengfeng  2017-11-13
myApp.post('/device/:macAddress/unbound_app', user.actionDeviceUnbound_app);
//新增安卓通过mac获取用户个人信息数据信息 pengfeng  2017-11-13
myApp.post('/device/:macAddress/UserProfile_app', user.actionUserProfile_app);
//新增安卓通过mac获取绑定数据信息 pengfeng  2017-11-13
myApp.get('/device/:macAddress/boundInfo_app', user.actionDeviceBoundInfo_app);
//新增安卓通过userid获取绑定数据信息列表 pengfeng  2017-11-29
myApp.get('/device/:userId/boundList_app', user.actionDeviceboundList_app);
//新增安卓通过mac保存电池信息接口 pengfeng  2017-11-13
myApp.post('/device/:macAddress/SaveBatteryInfo_app', user.actionSaveBatteryInfo_app); 
//新增通过安卓根据mac传上来的数据信息 pengfeng  2017-09-25
myApp.post('/device/:macAddress/SaveSportInfo_app', user.actionSaveSportInfo_app); //旧的以后清掉 old
//新增通过安卓根据mac传上来的数据信息 pengfeng  2018-04-09
myApp.post('/device/:macAddress/NewSaveSportInfo_app', user.actionNewSaveSportInfo_app); //旧的以后清掉 old


//新增通过安卓根据mac传上来的数据信息 pengfeng  2018-05-28 代替NewSaveSportInfo_app
myApp.post('/device/:macAddress/macSportInfo', user.actionSaveMacSport);


myApp.post('/device/saveGameScore', user.actionSaveGameScore);
myApp.get('/person/queryBuddy', user.actionQueryBuddy);//查询好友信息
myApp.post('/person/buddyInfo', user.actionBuddyInfo);//好友运动信息详情
myApp.post('/person/submitState', user.actionSubmitState);//同意或者拒绝加好友
myApp.post('/person/changeState', user.actionChangeState);//申请加好友，修改用户好友状态
myApp.get('/person/rankingList', user.actionRankingList);//运动排行榜
myApp.get('/person/rankingList_app', user.actionRankingList_app);//获取前3的排行榜   new
myApp.get('/person/topTenRankList_app', user.actionTopTenRankList_app);//获取前10的排行榜   new
myApp.get('/person/topNewTenRankList_app', user.actionNewTopTenRankList_app);//获取前10的排行榜   new
myApp.get('/person/TopReward_app', user.actionTopReward_app);//获取前3的排行榜并且给积分奖励
myApp.get('/person/allRankingList_app', user.actionallRankingList);//获取所有用户的排行榜   new

myApp.get('/person/:userId/TenRewardRank', user.actionTenRewardRank);//获取前10的排行榜并且返回积分奖励   AllNew 2018-05-23

myApp.get('/person/firstImageInfo', user.actionFirstImageInfo);//获取app首页图片信息   AllNew 2018-06-08

//{"userId":"5a6998f35096da2645ac474a","year":2018,"month":4} 得到历史记录列表
myApp.get('/device/userLastHistory', user.actionUserLastHistory);//得到用户最后同步时间和用户名 2018.04.30
myApp.post('/device/history', user.actionGetHistory);
myApp.post('/device/allUserHistory', user.actionAllUserHistory);//获取所有用户的排行榜   new
myApp.post('/device/doubleHistory', user.actionDoubleHistory);//多个终端的历史记录集合

myApp.post('/person/skin', user.actionModifySkin);//修改个人app主题皮肤

myApp.post('/device/:deviceId/version', user.actionModifyVersion);
//安卓端通过mac地址上传版本信息  pengfeng  2017-11-13
myApp.post('/device/:macAddress/version_app', user.actionModifyVersion_app);

//步数，公里，累计步数，累计积分分享朋友圈 2018-06-14
myApp.get('/device/:userId/getShareInfo', user.actionGetShareInfo);

myApp.get('/getPosition', user.actionGetPosition);//查询当前城市定位
myApp.post('/statistics', user.actionStatistics);

app.get('/wechat/login',wechat.actionWechatLogin);
app.get('/wechat/login/debug',wechat.actionWechatDebugLogin);
app.post('/wechat/jsconfig', wechat.actionGetJsConfig);
app.use('/wechat', wechat.actionDispatcher);

let server = app.listen(config.server.port, function() {
//    let server = app.listen(serverInfo.port, function() {
     let host = server.address().address;
     let port = server.address().port;
     console.log(`Host: ${host}, port: ${port}`);
//    });
});
