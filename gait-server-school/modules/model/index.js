'use strict';

let Fiber = require('fibers');
let um = require('unique-model');
let config = require('../../config');
let Types = um.Types;
let Text = Types.Text;
let Integer = Types.Integer;
let Double  = Types.Double;
let Bool = Types.Bool;
let DateTime = Types.DateTime;
let UObject = Types.UObject;
let UObjectArray = Types.UObjectArray;

um.enablePersist();

const lib = {
    wechatDevice: require('../lib/wechat_device'),
    insole_device: require('../lib/insole_device')
};

let sessionDb = um.createSession({
    backend: 'mongodb',
    uri: 'mongodb://localhost/gait_school', 
    // uri: 'mongodb://localhost/gait_web', 
    // options:{
    //     user: gait_admin,
    //     pass: gait
    // }
});

// 运动赛事表：标题，比赛内容,比赛规则，比赛时间，奖励制度，报名人数。
let SportMatch = um.model.createModel('SportMatch', {
    user: UObject({
        type: 'User'
    }),
    title:Text(),//标题
    content: Text(),//比赛内容
    rule: Text(),//比赛规则
    reward: Text(), //奖励制度
    num:Integer(),//报名人数
    maxNum:Integer(),//最大参赛人数
    statue:Integer(),//赛事状态
    disclaimer:Text(),//免责申明
    isgroup:Integer(),//是否为团队赛（0个人赛，1团队赛）
    creatTime: DateTime(),//比赛时间
	endTime: DateTime()//比赛结束时间
});

// 报名人员表：赛事id，报名人personid，报名时间，排名等级，领取状态，领取时间
let Attend = um.model.createModel('Attend', {
   match: UObject({
        type: 'SportMatch'
    }),//参赛项目
    person: UObject({
        type: 'Person'
    }),//报名人员
    rewardStatue: Integer(), //领取状态
	rewardTime: DateTime(),//领取时间
	order:Integer(),//排名
	creatTime: DateTime()//报名时间
});

// 报名团队表：赛事id，报名人personid，报名时间，排名等级，领取状态，领取时间
let AttendGroup = um.model.createModel('AttendGroup', {
    match: UObject({
         type: 'SportMatch'
     }),//参赛项目
     groupName: Text(),
     person: UObject({
         type: 'Person'
     }),//报名人员
     isCaptain:Integer(),//是否为队长（0不是，1是）
     order:Integer(),//排名
     creatTime: DateTime()//报名时间
 });

 //设备reset记录表
 let Reset = um.model.createModel('Reset', {
    user: UObject({
         type: 'User'
     }),//用户
     device: UObject({
        type: 'Device'
     }),//终端信息
     resetNum: Integer(),//reset次数
     runOld:Integer(),//上一次跑步数
     walkOld:Integer(),//上一次走路
     walkReset:Integer(),//reset走路
     runReset:Integer(),//reset跑步数
     sportTime:Integer(),//运动时间
     sportTimeReset:Integer(),//reset运动时长
     creatTime: DateTime()//reset时间
 });

let User = um.model.createModel('User', {
    loginName: Text(),
    password:Text(),
    headImageUrl: Text(),
    buddy_list: UObjectArray({
        type: 'Person'
    }),
    apply_list: UObjectArray({
        type: 'Person'
    }),
    applied_list: UObjectArray({
        type: 'Person'
    }),
    agree_list: UObjectArray({
        type: 'Person'
    }),
    disagree_list: UObjectArray({
        type: 'Person'
    }),
    role: UObject({
        type: 'Role'
    })
});

let Role = um.model.createModel('Role', {
    name: Text(),
    privileges: UObjectArray({
        type: 'Privilege'
    })
});

let Privilege = um.model.createModel('Privilege', {
    name: Text()
});

let WechatUser = um.model.createModel('WechatUser', {
    openId: Text(),
    user: UObject({
        type: 'User'
    }),
    creatTime:DateTime()//创建时间
});


let SportRecord = um.model.createModel('SportRecord', {
    date: DateTime(),
    distance: Double(),
    calories: Double(),
    step: Integer(),
	walk: Integer(),
    run: Integer(),
    jump:Integer(),
	upstairs: Integer(),
	downstairs: Integer(),
	sportTime: Double(),
    //accomplishPercent: Double(),
	temperature: Double(),
    device: UObject({
        type: 'Device'
    }),
    person: UObject({
        type: 'Person'
    })
});

let Device = um.model.createModel('Device', {
    macAddress: Text(),
    snCode: Text(),
    batteryInfo: Text(),
	temperature:Double(),
    version: Text(),
	wechatType:Text(),
	wechatId: Text(),
	needInit: Bool(),
    user: UObject({
        type: 'User'
    }),
	remark: Text(),
	boundTime: DateTime()
});

// 手机型号表
let Phone = um.model.createModel('Phone', {
    user: UObject({
        type: 'User'
    }),
    macAddress: Text(),//蓝牙地址
    wifiAddress: Text(),//手机wifi地址
    phoneCode: Text(), //手机型号
	company:Text(),//厂家
    cpu: Text(),//CPU型号
	version:Text(),//系统版本
	creatTime: DateTime()
});

// 排行榜奖励记录表
let RankReward = um.model.createModel('RankReward', {
    user: UObject({
        type: 'User'
    }),
    macAddress: Text(),//设备蓝牙地址
    credit: Integer(), //奖励积分
	creatTime: DateTime()
});

let JumpInfo = um.model.createModel('JumpInfo', {
    macAddress: Text(),//终端mac
    jumpSum:Integer(),//跳跃步数
    beginTime: DateTime(),//跳跃开始时间
    jumpTime:Integer(),//设置的跳跃时间
	endTime: DateTime()//跳跃结束时间
});


let Person = um.model.createModel('Person', {
    user: UObject({
        type: 'User'
    }),
    skin: Integer(),
    sex: Text(),
    birthday: DateTime(),
    height: Integer(),
    weight: Integer(),
    nickName: Text(),
    phone:Text(),
    step: Integer(),
    devices: UObjectArray({
        type: 'Device'
    }),
	accomplishment: Integer(),
	accomplishmentTime: DateTime(),
	days: Integer(),
    city: Text(),
    creditTotal : Integer(),//个人积分总数
    rankState:Integer(),//排行榜积分兑换状态
    money: Double(),//个人金币数量
    useCredit : Integer(),//用掉的积分
	cityTime: DateTime()
});

let SportHistory = um.model.createModel('SportHistory', {
    date: DateTime(),
    accomplishment: Integer(),
	historyDistances: Double(),
    historySteps: Integer(),
    walk: Integer(),
    run: Integer(),
	historyCalories: Double(),
	device: UObject({
		type: 'Device'
	}),
    person: UObject({
        type: 'Person'
    })
});

let GameScore = um.model.createModel('GameScore', {
    gameType: Text(),
    score: Integer(),
    person: UObject({
        type: 'Person'
    })
});

let City = um.model.createModel('City', {
    name: Text(),
    rank: Integer(),
    num: Integer()
});

let Statistics = um.model.createModel('Statistics', {
    time: DateTime(),
    mark: Text()
});


//登录签到表
let Check = um.model.createModel('Check', {
    user: UObject({
        type: 'User'
    }),//用户ID
    checkTime:DateTime(),//登录签到时间
    credit: Integer(),//领取积分
    money:Double(),//领取到的红包金额
    statu:Integer()//状态（0是未签到 1已经签到）
});


//积分兑换产品表
let Product = um.model.createModel('Product', {
    produceName: Text(),//用户ID
    images:Text(),//产品图片
    remark:Text(),//产品描述
    color: Text(),//颜色
    size:Text(),//规格
    total:Integer(),//总数
    price:Double(),//产品价格
    needCredit:Integer(),//产品需要积分
    useCredit:Integer(),//最高可使用积分
    money : Double(),//现金部分
    explain:Text()//兑换说明
});

//积分兑换表
let Exchange = um.model.createModel('Exchange', {
    user: UObject({
        type: 'User'
    }),//用户ID
    product: UObject({
        type: 'Product'
    }),//产品ID
    num: Integer(),//数量
    useCredit:Integer(),//消耗积分数
    money : Double(),//现金部分
    exchangeTime:DateTime(),//兑换时间
    statu : Integer()// 兑换状态
});


//步数兑换积分表
let StepExchange = um.model.createModel('StepExchange', {
    user: UObject({
        type: 'User'
    }),//用户ID
    macAddress: Text(),//终端mac地址
    exchangeRun: Integer(),//兑换跑步步数
    exchangeWalk:Integer(),//兑换走路步数
    exchangeTime : DateTime(),//兑换时间
    status : Integer()// 兑换状态
});


let userDao = sessionDb.getDao(User);
let deviceDao = sessionDb.getDao(Device);
let phoneDao = sessionDb.getDao(Phone);
let sportMatchDao = sessionDb.getDao(SportMatch);
let attendDao = sessionDb.getDao(Attend);
let attendGroupDao = sessionDb.getDao(AttendGroup);
let resetDao = sessionDb.getDao(Reset);
let RankRewardDao = sessionDb.getDao(RankReward);
let sportRecordDao = sessionDb.getDao(SportRecord);
let privilegeDao = sessionDb.getDao(Privilege);
let roleDao = sessionDb.getDao(Role);
let personDao = sessionDb.getDao(Person);
let wechatUserDao = sessionDb.getDao(WechatUser);
let sportHistoryDao = sessionDb.getDao(SportHistory);
let gameScoreDao = sessionDb.getDao(GameScore);
let cityDao = sessionDb.getDao(City);
let jumpInfoDao = sessionDb.getDao(JumpInfo);
let checkDao = sessionDb.getDao(Check);
let productDao = sessionDb.getDao(Product);
let exchangeDao = sessionDb.getDao(Exchange);
let stepExchangeDao = sessionDb.getDao(StepExchange);
let statisticsDao = sessionDb.getDao(Statistics);

module.exports = {
    User,
    Device,
    Phone,
    SportMatch,
    Attend,
    AttendGroup,
    Reset,
    RankReward,
    SportRecord,
    Privilege,
    Role,
    Person,
    JumpInfo,
    Check,
    Product,
    WechatUser,
    SportHistory,
	GameScore,
	City,
    Statistics,
    Exchange,
    StepExchange,
    userDao,
    deviceDao,
    phoneDao,
    attendDao,
    attendGroupDao,
    resetDao,
    sportMatchDao,
    RankRewardDao,
    sportRecordDao,
    jumpInfoDao,
    checkDao,
    productDao,
    exchangeDao,
    stepExchangeDao,
    privilegeDao,
    roleDao,
    personDao,
    wechatUserDao,
	sportHistoryDao,
	gameScoreDao,
	cityDao,
	statisticsDao
};
