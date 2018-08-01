'use strict';

const assert = require('assert');
const insoleDevice = require('../../../modules/lib/insole_device');


const InsoleMessage = insoleDevice.InsoleMessage;
const InsoleHead = insoleDevice.InsoleHead;
const UserProfile = insoleDevice.UserProfile;
const BatteryLevel = insoleDevice.BatteryLevel;
const SportResults = insoleDevice.SportResults;

describe('InsoleMessage',function(){
	describe('#constructor', function(){
		it('nomal',function(){
			const insoleMessage = new InsoleMessage({
				head: 654321,
				body: 123456
			});
			assert.equal(654321, insoleMessage.head);
			assert.equal(123456, insoleMessage.body);
		});
		it('options undefined',function(){
			const insoleMessage = new InsoleMessage();
			assert.equal(undefined, insoleMessage.head);
			assert.equal(undefined, insoleMessage.head);
		});
	});
});

describe('InsoleHead', function() {
	describe('#constructor', function() {
		it('normal', function() {
			const head = new InsoleHead({
				magicCode: 12,
				version: 1,
				totalLength: 20,
				cmdId: 2,
				seq: 0,
				errorCode: 0
			});
			
			assert.equal(12, head.magicCode);
			assert.equal(1, head.version);
			assert.equal(20, head.totalLength);
			assert.equal(2, head.cmdId);
			assert.equal(0, head.seq);
			assert.equal(0, head.errorCode);
		});
		
		it('options is undefined', function() {
			
			const head = new InsoleHead();
			
			assert.equal(undefined, head.magicCode);
			assert.equal(undefined, head.version);
			assert.equal(undefined, head.totalLength);
			assert.equal(undefined, head.cmdId);
			assert.equal(undefined, head.seq);
			assert.equal(undefined, head.errorCode);
		});
		
		it('optins is overFlow',function(){
			let head = new InsoleHead({
				magicCode: 65536,
				version: 65536,
				totalLength: 65536,
				cmdId: 65536,
				seq: 65536,
				errorCode: 65536
			});
			assert.equal(undefined, head.magicCode);
			assert.equal(undefined, head.version);
			assert.equal(undefined, head.totalLength);
			assert.equal(undefined, head.cmdId);
			assert.equal(undefined, head.seq);
			assert.equal(undefined, head.errorCode);
		});
		
		it('Not integer',function(){
			let head = new InsoleHead({
				magicCode: 12,
				version: 6553,
				totalLength: 1.5,
				cmdId: 0,
				seq: 1,
				errorCode: 0
			});
			assert.equal(undefined, head.magicCode);
			assert.equal(undefined, head.version);
			assert.equal(undefined, head.totalLength);
			assert.equal(undefined, head.cmdId);
			assert.equal(undefined, head.seq);
			assert.equal(undefined, head.errorCode);
		})		
	});
	describe('#toBuffer', function(){
		it('normal',function(){
			let head = new InsoleHead({
				magicCode: 12,
				version: 1,
				totalLength: 20,
				cmdId: 2,
				seq: 0,
				errorCode: 0
			});
			const bufferTest = Buffer.from([0x00, 0x0c, 0x00, 0x01, 0x00, 0x14, 0x00, 0x02 , 0x00, 0x00 ,0x00, 0x00]);
			const buffer = head.toBuffer();
			assert(bufferTest.equals(buffer));
		});
	});
	describe('#FromBuffer', function(){
		it('normal',function(){
			const buffer1 = new Buffer.from([
				 0x00, 0x0c, 0x00, 0x01, 
				 0x00, 0x14, 0x00, 0x02 , 
				 0x00, 0x00 ,0x00, 0x00
			]);
			const headInfo = InsoleHead.FromBuffer(buffer1);
			assert.equal(12, headInfo.magicCode);
			assert.equal(1, headInfo.version);
			assert.equal(20, headInfo.totalLength);
			assert.equal(2, headInfo.cmdId);
			assert.equal(0, headInfo.seq);
			assert.equal(0, headInfo.errorCode);
		});
	});
});

describe('UserProfile',function(){
	describe('#constructor',function(){
		it('nomal',function(){
			const userProfile = new UserProfile({
				sex: 1,
				age: 23,
				weight: 50,
				stepTarget: 10000,
				caloriesTarget: 300,
				distanceTarget: 10,
				time: 2016110815302
			});
			assert.equal(1,userProfile.sex);
			assert.equal(23,userProfile.age);
			assert.equal(50,userProfile.weight);
			assert.equal(10000,userProfile.stepTarget);
			assert.equal(300,userProfile.caloriesTarget);
			assert.equal(10,userProfile.distanceTarget);
			assert.equal(2016110815302,userProfile.time);
		});
		
		it('options undefined',function(){
			const userProfile = new UserProfile();
			assert.equal(undefined,userProfile.sex);
			assert.equal(undefined,userProfile.age);
			assert.equal(undefined,userProfile.weight);
			assert.equal(undefined,userProfile.stepTarget);
			assert.equal(undefined,userProfile.caloriesTarget);
			assert.equal(undefined,userProfile.distanceTarget);
			assert.equal(undefined,userProfile.time);
		});
	});
});

describe('BatteryLevel', function(){
	describe('#constructor',function(){
		it('nomal',function(){
			const batteryLevel = new BatteryLevel({
				batteryLevel: 100
			});
			assert.equal(100,batteryLevel.batteryLevel);
		});
		
		it('options undefined',function(){
			const batteryLevel = new BatteryLevel();
			assert.equal(undefined,batteryLevel.sex);
		});
	});
})

describe('SportResults', function(){
	describe('#constructor',function(){
		it('nomal',function(){
			const buffer = new Buffer.from([
                0x00, 0x00, 0x00, 0x02,
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
			sportResults.should.eql({
				days: 2,
				stepCounts: [ 296, 4098, 1302 ],
				calories: [ 146, 102, 120 ],
				distance: [ 5, 8, 4 ]
			});
		});
		
		it('options undefined',function(){
			const sportResults = new SportResults();
			assert.equal(undefined,sportResults.days);
			assert.equal(undefined,sportResults.stepCounts);
			assert.equal(undefined,sportResults.calories);
			assert.equal(undefined,sportResults.distance);
		});
	});
})
