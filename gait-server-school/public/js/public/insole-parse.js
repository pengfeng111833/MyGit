'use strict'

function ToArrayBuffer( array ){

    var length = array.length;
    var buffer = new ArrayBuffer(length);
    var dv = new DataView(buffer);
    for(var offset = 0; offset < length; offset ++){
        dv.setUint8(offset,array[offset]);
    }
    return buffer;
    
}

//function arrayBufferToBase641( buffer ) {
//     var binary = '';
//     var bytes = new Uint8Array( buffer );
//     var len = bytes.byteLength;
//     for (var i = 0; i < len; i++) {
//         binary += String.fromCharCode( bytes[ i ] );
//     }
//     return window.btoa( binary );
// }

function arraryBufferCat( arraybuffer1, arraybuffer2 ) {

    var arr1Len = arraybuffer1.byteLength;
    var arr2Len = arraybuffer2.byteLength; 
    var length = arraybuffer1.byteLength + arraybuffer2.byteLength
    var buffer = new ArrayBuffer( length );
    var dv = new DataView( buffer );
    var dv1 = new DataView( arraybuffer1 );
    var dv2 = new DataView( arraybuffer2 );
    var tempUint;
    for( var i = 0; i < arr1Len; i++ ){
        tempUint = dv1.getUint8(i);
        dv.setUint8(i, tempUint);
    }
    for( var i = arr1Len; i < length; i++ ){
        tempUint = dv2.getUint8(i - arr1Len);
        dv.setUint8(i, tempUint);
    }
    return buffer;
}

function arrayBufferToBase64( arraybuffer ) {
    var base64String = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    var bytes = new Uint8Array(arraybuffer),
      i, len = bytes.buffer.byteLength, base64 = "";
  
    for (i = 0; i < len; i+=3) {
      base64 += base64String[bytes[i] >> 2];
      base64 += base64String[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += base64String[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += base64String[bytes[i + 2] & 63];
    }
  
    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }
  
    return base64;
}

function base64ToArrayBuffer( base64 ) {

    var base64String = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    
    var base64DecodeLookup = function() {
        var coreArrayBuffer = new ArrayBuffer( 256 );
        var base64DecodeLookupTable = new Uint8Array( coreArrayBuffer );
        for( var i = 0; i < base64String.length; i ++ ) {
          base64DecodeLookupTable[ base64String[ i ].charCodeAt( 0 ) ] = i;
        }
      
        return base64DecodeLookupTable;
  
    }();

    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
        bufferLength--;
        if (base64[base64.length - 2] === "=") {
          bufferLength--;
        }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
        encoded1 = base64DecodeLookup[base64.charCodeAt(i)];
        encoded2 = base64DecodeLookup[base64.charCodeAt(i+1)];
        encoded3 = base64DecodeLookup[base64.charCodeAt(i+2)];
        encoded4 = base64DecodeLookup[base64.charCodeAt(i+3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
}

function InsoleMessage( options ){

    if ( !options ) {
        return;
    }

    this.head = options.head;
    this.body = options.body;

}

InsoleMessage.FromArrayBuffer = function( buffer ){

    var insoleHead = InsoleHead.FromArrayBuffer( buffer );
    var insoleBody = buffer.slice(InsoleHead.BufferSize);

    return new InsoleMessage({
        head: insoleHead,
        body: insoleBody
    });

}

InsoleMessage.FromBase64 = function( base64 ){

    var buffer = base64ToArrayBuffer( base64 );
    return InsoleMessage.FromArrayBuffer( buffer );

}

InsoleMessage.FromWechatMessage = function( wechatMessage ){

    var buffer = base64ToArrayBuffer( wechatMessage.Content );
    
    return InsoleMessage.FromArrayBuffer( buffer );

}

InsoleMessage.prototype.ToArrayBuffer = function(){
    
    var headBuffer = this.head.ToArrayBuffer();
    var buffer = arraryBufferCat(headBuffer,this.body)

    return buffer;

}

InsoleMessage.prototype.ToBase64 = function(){

    return arrayBufferToBase64( this.ToArrayBuffer() );

}

InsoleMessage.prototype.initRequest = function( options ){

    console.log('options',options);
    this.head = new InsoleHead({
        magicCode: InsoleHead.MagicCode,
        version: InsoleHead.DefaultVersion,
        totalLength: InsoleHead.BufferSize + options.body.byteLength,
        cmdId: options.command,
        seq: options.seq,
        errorCode: 0
    });

    this.body = options.body;

}

function InsoleHead( options ){

    if ( !options ) {
            return;
        }
        
        if(options.magicCode>65535 || options.version>65535 || options.totalLength>65535 || options.cmdId>65535 || options.seq>65535 || options.errorCode>65535){
            return;
        }

        this.magicCode = options.magicCode;
        this.version = options.version;
        this.totalLength = options.totalLength;
        this.cmdId = options.cmdId;
        this.seq = options.seq;
        this.errorCode = options.errorCode;

}

InsoleHead.FromArrayBuffer = function ( headBuffer ){

    var dv = new DataView(headBuffer);
    var magicCode = dv.getUint16(0);
    var version = dv.getUint16(2);
    var totalLength = dv.getUint16(4);
    var cmdId = dv.getUint16(6);
    var seq = dv.getUint16(8);
    var errorCode = dv.getUint16(10);

    return new InsoleHead({
        magicCode : magicCode,
        version : version,
        totalLength : totalLength,
        cmdId : cmdId,
        seq : seq,
        errorCode : errorCode
    });

}

InsoleHead.prototype.ToArrayBuffer = function(){

    var buffer = new ArrayBuffer(InsoleHead.BufferSize);
    var dv = new DataView( buffer );
    dv.setUint16(0, this.magicCode);
    dv.setUint16(2, this.version);
    dv.setUint16(4, this.totalLength);
    dv.setUint16(6, this.cmdId);
    dv.setUint16(8, this.seq);
    dv.setUint16(10, this.errorCode);

    return buffer;

}

InsoleHead.MagicCode = Number.parseInt('fecf', 16);
InsoleHead.DefaultVersion = 1;
InsoleHead.Command = {
    ErrorResp: Number.parseInt('FFFF', 16),
    userProfileReq: Number.parseInt('2001', 16),
    UserProfileResp: Number.parseInt('2002', 16),
    sendBatteryLevelReq: Number.parseInt('3001', 16), 
    BatteryLevelResp: Number.parseInt('3002', 16),
    sendSportResultsReq: Number.parseInt('4001', 16),
    SportResultsResp: Number.parseInt('4002', 16),
    JSSDKReq: Number.parseInt('0001', 16),
};

InsoleHead.BufferSize = 12;

function SportsResults ( options ){

    if ( !options ) {
        return;
    }

    this.days = options.days;
    this.stepCounts = options.stepCounts;
    this.calories = options.calories;
    this.distance = options.distance;

}

SportsResults.FromArrayBuffer = function( buffer ){

    var dv = new DataView( buffer);
    var days = dv.getUint32(0);
    var stepCounts = [];
    var calories = [];
    var distance = [];

    var datumCount = days + 1;
    var currentPos = 4;

    for ( var i = 0; i < datumCount; i ++ ) {
        stepCounts.push(dv.getUint32(currentPos));
        currentPos += 4;
    }

    for ( var i = 0; i < datumCount; i ++ ) {
        calories.push(dv.getUint32(currentPos));
        currentPos += 4;
    }

    for ( var i = 0; i < datumCount; i ++ ) {
        distance.push(dv.getUint32(currentPos));
        currentPos += 4;
    }

    return new SportsResults({
        days: days,
        stepCounts: stepCounts,
        calories: calories,
        distance: distance
    });

}

function BatteryLevel( options ) {

    if ( !options ) {
        return;
    }

    this.batteryLevel = options.batteryLevel;

}

BatteryLevel.FromArrayBuffer = function ( buffer ) {
    var dv = new DataView(buffer);  
    var batteryLevel = dv.getUint8(0);
    console.log(batteryLevel);
    return new BatteryLevel({
        batteryLevel: batteryLevel
    });
};

function UserProfile ( options ) {

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

UserProfile.Time2String = function( time ) {

    var year = time.getFullYear();
    var month = paddingZero(time.getMonth() + 1, 2);
    var date = paddingZero(time.getDate(), 2);
    var hour = paddingZero(time.getHours(), 2);
    var minute = paddingZero(time.getMinutes(), 2);
    var second = paddingZero(time.getSeconds(), 2);
    var day = time.getDay();
    if ( day === 0 ) {
        day = 7;
    }
    return '' + year + month + date + hour + minute + second + day;

}

UserProfile.prototype.ToArrayBuffer = function() {

    var buffer = new ArrayBuffer( 33 );
    var dv = new DataView( buffer );
    dv.setUint8(0, this.sex);
    dv.setUint8(1, this.age);
    dv.setUint8(2, this.weight);
    dv.setUint8(3, this.height);
    dv.setUint32(4, this.stepTarget);
    dv.setUint32(8, this.caloriesTarget);
    dv.setUint32(12, this.distanceTarget);
    var timeString = UserProfile.Time2String(this.time);
    console.log('timeString：',timeString);
    var strlen = timeString.length;
    for( var i = 0; i < strlen; i++ ){
        dv.setUint8( 16+i , timeString.charCodeAt(i) );
      //  console.log(timeString.charCodeAt(i));  
    }
    dv.setUint8(31, 1);
    dv.setUint8(32, this.init_sport_data);

    return buffer;

}

function bindReceiveDataEvent( device ){
    wx.on('onReceiveDataFromWXDevice',function(res){
        handleReceivedData( res.base64Data, device )
    });
}

function openWXDeviceLib(callback) {
    wx.invoke('openWXDeviceLib', {
        'connType':'blue'
    }, function(res) {
        if ( callback ) {
            callback(res);
        }
    });
}

function closeWXDeviceLib(callback) {
    wx.invoke('closeWXDeviceLib', {
        'connType':'blue'
    }, function(res) {
        if ( callback ) {
            callback(res);
        }
    });
}

function sendDataToWXDevice(deviceId, message, callback){
    wx.invoke('sendDataToWXDevice', {
        'deviceId':deviceId, 
        'connType':'blue', 
        'base64Data':message
    }, function(res) {
            if( callback ) {
                callback(res)
            }
    });
}

function connectWXDevice(deviceId, callback) {
    wx.invoke('connectWXDevice',{ 
        'deviceId':deviceId, 
        'connType':'blue'
    }, function(res) {
        if( callback )
            callback(res);
    });
}

function getDeviceUnboundTicket(deviceId, callback) {
    wx.invoke('getWXDeviceTicket', {
        'deviceId': deviceId,
        'type': '2', 
        'connType': 'blue'
    }, function(res) {
        if ( callback ) {
            callback(res);
        }
    });
}

function handleReceivedData( base64, device ){

    var insoleMessage = InsoleMessage.FromBase64( base64 );
    var command = insoleMessage.head.cmdId;
    console.log('收到数据');

    switch( command ) {
        case InsoleHead.Command.userProfileReq:

            console.log('收到userprofile请求');
            console.log('respond userprofie device',device);
            var userProfileRequest = new HttpRequest('/device/' + device.id + '/UserProfile');
            userProfileRequest.getJSON(function(res){
                if(res.successful){
                    var options = res.data;
                    var timeStr = options.time;
                    options.time = new Date( timeStr );
                    var userProfile = new UserProfile( options );
                    var insoleResponse = new InsoleMessage({head:{},body:{},});
                    insoleResponse.initRequest({
                        seq: 0,
                        body: userProfile.ToArrayBuffer(),
                        command: InsoleHead.Command.UserProfileResp,                       
                    });
                    var resBase64 = insoleResponse.ToBase64();
                   // var zhouUserProfile = '/s8AAQAtIAIAAAAAAS9GqgAAH0AAAAAAAAAAADIwMTcwMTEyMDAwMDEzNAEA';
                    sendDataToWXDevice(device.wechatId, resBase64, function( res ){
                    });
                }
                else {
                }
            });
            break;

        case InsoleHead.Command.sendBatteryLevelReq:
            
            var batteryLevel = BatteryLevel.FromArrayBuffer( insoleMessage.body );
            var insoleResponse = new InsoleMessage({head:{},body:{},});
            insoleResponse.initRequest({
                seq: 0,
                body: new ArrayBuffer(0),
                command: InsoleHead.Command.BatteryLevelResp,                       
            });
            var resBase64 = insoleResponse.ToBase64();
            var batteryRequest = new HttpRequest('/device/' + device.id + '/SaveBatteryInfo');
            batteryRequest.postJSON({batteryLevel: batteryLevel.batteryLevel},
                function(res){
                    if( res.successful ){
                        sendDataToWXDevice(device.wechatId, resBase64, function( res ){
                        });
                    }
                });
            break;

        case InsoleHead.Command.sendSportResultsReq:

            var sportsResults = SportsResults.FromArrayBuffer( insoleMessage.body );
            var insoleResponse = new InsoleMessage({head:{},body:{},});
            insoleResponse.initRequest({
                seq: 0,
                body: new ArrayBuffer(0),
                command: InsoleHead.Command.SportResultsResp,                       
            });
            var resBase64 = insoleResponse.ToBase64();
            var sportsRequest = new HttpRequest('/device/' + device.id + '/SaveSportInfo');
            sportsRequest.postJSON({
                days: sportsResults.days,
                stepCounts: sportsResults.stepCounts,
                calories: sportsResults.calories,
                distance: sportsResults.distance,
            }, function(res){
                if( res.successful ){
                    sendDataToWXDevice(device.wechatId, resBase64, function( res ){
                    });
                }
            });
            break;
    }
}
