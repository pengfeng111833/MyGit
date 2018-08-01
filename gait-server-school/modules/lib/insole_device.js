'use strict';

const base64 = require('base64-js');
const lib = {
    util: require('./util')
};

class InsoleMessage {
    static FromWechatMessage(wechatMessage){
        const deviceMessageBytes = base64.toByteArray(wechatMessage.Content);
        console.log('devicebytes', deviceMessageBytes);
        const deviceMessageBuffer = new Buffer(deviceMessageBytes.buffer);
        console.log('decivebufer', deviceMessageBuffer);
        return InsoleMessage.FromBuffer(deviceMessageBuffer);
    }

    static FromBuffer(buffer) {
        const insoleHead = InsoleHead.FromBuffer(buffer);
        const insoleBody = buffer.slice(InsoleHead.BufferSize);

        return new InsoleMessage({
            head: insoleHead,
            body: insoleBody
        });
    }

    toBuffer() {
        const headBuffer = this._head.toBuffer();
        
        return Buffer.concat([headBuffer, this._body]);
    }

    toBase64() {
        return base64.fromByteArray(this.toBuffer())
    }

    get head() {
        return this._head;
    }

    set head(head) {
        this._head = head;
    }

    get body() {
        return this._body;
    }

    set body(body) {
        this._body = body;
    }

    constructor(options) {
        if ( !options ) {
            return;
        }

        this._head = options.head;
        this._body = options.body;
    }
};

class InsoleHead {
    static FromBuffer(headBuffer) {
        const magicCode = headBuffer.readUInt16BE(0);
        const version = headBuffer.readUInt16BE(2);
        const totalLength = headBuffer.readUInt16BE(4);
        const cmdId = headBuffer.readUInt16BE(6);
        const seq = headBuffer.readUInt16BE(8);
        const errorCode = headBuffer.readUInt16BE(10);

        return new InsoleHead({
            magicCode,
            version,
            totalLength,
            cmdId,
            seq,
            errorCode
        });
    }

    constructor(options) {
		if ( !options ) {
			return;
		}
		
		if(options.magicCode>65535 || options.version>65535 || options.totalLength>65535 || options.cmdId>65535 || options.seq>65535 || options.errorCode>65535){
			return;
		}

        this._magicCode = options.magicCode;
        this._version = options.version;
        this._totalLength = options.totalLength;
        this._cmdId = options.cmdId;
        this._seq = options.seq;
        this._errorCode = options.errorCode;
    }

    toBuffer() {
        const buffer = new Buffer(InsoleHead.BufferSize);
		
        buffer.writeUInt16BE(this._magicCode, 0);
        buffer.writeUInt16BE(this._version, 2);
        buffer.writeUInt16BE(this._totalLength, 4);
        buffer.writeUInt16BE(this._cmdId, 6);
        buffer.writeUInt16BE(this._seq, 8);
        buffer.writeUInt16BE(this._errorCode, 10);

        return buffer;
    }

    get magicCode() {
        return this._magicCode;
    }

    get version() {
        return this._version;
    }

    get totalLength() {
        return this._totalLength;
    }

    get cmdId() {
        return this._cmdId;
    }

    set cmdId(cmdId) {
        this._cmdId = cmdId;
    }

    get seq() {
        return this._seq;
    }

    get errorCode() {
        return this._errorCode;
    }
}

InsoleHead.MagicCode = Number.parseInt('fecf', 16);
InsoleHead.DefaultVersion = 1;
InsoleHead.Command = {
	ErrorResp: Number.parseInt('FFFF', 16),
    UserProfileResp: Number.parseInt('2002', 16),
	BatteryLevelResp: Number.parseInt('3002', 16),
	SportResultsResp:Number.parseInt('4002',16),
	RunningResultResp:Number.parseInt('6002',16),
//	JSSDKInitResp:Number.parseInt('0001', 16),
//	BindResultResp:Number.parseInt('0001',16)
};

InsoleHead.BufferSize = 12;

let isInteger = function(number){
	if(number % 1 === 0)
		return 0;
	else
		return 1;
}
class InsoleRequest extends InsoleMessage {
    constructor(options) {
        super();

        if ( !options.seq ) {
            options.seq = 1;
        }
        this.head = new InsoleHead({
            magicCode: InsoleHead.MagicCode,
            version: InsoleHead.DefaultVersion,
            totalLength: InsoleHead.BufferSize + options.body.length,
            cmdId: options.command,
            seq: options.seq,
            errorCode: 0
        });

        this.body = options.body;
    }
}

class UserProfile {
    constructor(options) {
		if(!options){
			return ;
		}
        this.sex = options.sex;
        this.age = options.age;
        this.weight = options.weight;
		this.height = options.height;
        this.stepTarget = options.stepTarget;
        this.caloriesTarget = options.caloriesTarget;
        this.distanceTarget = options.distanceTarget;
        this.time = options.time;
		this.init_sport_data = options.needInit;
    }

    toBuffer() {
        const buffer = new Buffer(33);
        buffer.writeUInt8(this.sex, 0);
        buffer.writeUInt8(this.age, 1);
        buffer.writeUInt8(this.weight, 2);
		buffer.writeUInt8(this.height, 3);
        buffer.writeUInt32BE(this.stepTarget, 4);
        buffer.writeUInt32BE(this.caloriesTarget, 8);
        buffer.writeUInt32BE(this.distanceTarget, 12);
        const timeString = UserProfile.Time2String(this.time);
		console.log('timeString：',timeString);
        const timeStringBuffer = Buffer.from(timeString, 'utf8');
		console.log('timeStringBuffer', timeStringBuffer);
        timeStringBuffer.copy(buffer,16);
        console.log('buffer is ',buffer);
		buffer.writeUInt8(1, 31);
		buffer.writeUInt8(this.init_sport_data, 32);
        return buffer;
    }

    static Time2String(time) {
        const year = time.getFullYear();
        const month = lib.util.paddingZero(time.getMonth() + 1, 2);
        const date = lib.util.paddingZero(time.getDate(), 2);
        const hour = lib.util.paddingZero(time.getHours(), 2);
        const minute = lib.util.paddingZero(time.getMinutes(), 2);
        const second = lib.util.paddingZero(time.getSeconds(), 2);
        let day = time.getDay();
        if ( day === 0 ) {
            day = 7;
        }

        return `${year}${month}${date}${hour}${minute}${second}${day}`;
    }
}

// class UserBondingEvt {
    // constructor(options) {
		// if(!options){
			// return ;
		// }
        // this.is_bonded = options.bonded;
	// }

    // toBuffer() {
        // const buffer = new Buffer(1);
        // buffer.writeUInt8(this.is_bonded, 0);
        // return buffer;
    // }
// }

class BatteryLevel {
    constructor(options) {
        if ( !options ) {
            return;
        }

        this.batteryLevel = options.batteryLevel;
    }

    static FromBuffer(buffer) {
        const batteryLevel = buffer.readUInt8(0);
        console.log(batteryLevel);
        return new BatteryLevel({
            batteryLevel: batteryLevel
        });
    }
}

class SportResults {
    constructor(options) {
        if ( !options ) {
            return;
        }

        this.days = options.days;
        this.stepCounts = options.stepCounts;
        this.calories = options.calories;
        this.distance = options.distance;
    }

    static FromBuffer(buffer) {
        const days = buffer.readUInt32BE(0);
        const stepCounts = [];
        const calories = [];
        const distance = [];

        const datumCount = days + 1;

        let currentPos = 4;
        for ( let i = 0; i < datumCount; i ++ ) {
            stepCounts.push(buffer.readUInt32BE(currentPos));
            currentPos += 4;
        }
        
        for ( let i = 0; i < datumCount; i ++ ) {
            calories.push(buffer.readUInt32BE(currentPos));
            currentPos += 4;
        }

        for ( let i = 0; i < datumCount; i ++ ) {
            distance.push(buffer.readUInt32BE(currentPos));
            currentPos += 4;
        }

        return new SportResults({
            days: days,
            stepCounts: stepCounts,
            calories: calories,
            distance: distance
        });
    }
}

UserProfile.Sex = {
    Female: 0,
    Male: 1
};

module.exports = {
    InsoleMessage,
    InsoleRequest,
    InsoleResponse: InsoleRequest,
    InsoleHead,
    UserProfile,
    BatteryLevel,
    SportResults
};

