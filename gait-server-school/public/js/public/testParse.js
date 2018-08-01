'use strict'

function testInsoleHead() {

    var buffer = ToArrayBuffer([
         0x00, 0x0c, 0x00, 0x01, 
         0x00, 0x14, 0x00, 0x02 , 
         0x00, 0x00 ,0x00, 0x00
    ]);

    var insoleHead = InsoleHead.FromArrayBuffer(buffer);
    console.log(insoleHead);
    var anotherBuffer = insoleHead.ToArrayBuffer();
    var anotherInsoleHead = InsoleHead.FromArrayBuffer(anotherBuffer);
    console.log(anotherInsoleHead);

}

function testSportsResults(){

    var buffer = ToArrayBuffer([
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
    var sportsResults = SportsResults.FromArrayBuffer( buffer )
    console.log( sportsResults );

}

function testBatteryLevel(){

    var buffer = ToArrayBuffer([0x64]);
    var batteryLevel = BatteryLevel.FromArrayBuffer( buffer );
    console.log( batteryLevel );

}

function testToArrayBuffer(){

    var buffer = ToArrayBuffer([
         0x00, 0x0c, 0x00, 0x01, 
         0x00, 0x14, 0x00, 0x02 , 
         0x00, 0x00 ,0x00, 0x00
    ]);
    var dv = new DataView(buffer);
    var length = dv.byteLength;
    for(var i = 0; i < length; i++){
        console.log(dv.getUint8(i));
    }
}

function testTime2String(){

    var str = UserProfile.Time2String(new Date());
    console.log(str);

}

function testProfileToArrayBuffer(){

    var userProfile = new UserProfile({
        sex: 1,
        age: 23,
        weight: 50,
        stepTarget: 10000,
        caloriesTarget: 300,
        distanceTarget: 10,
        time: new Date(),
    }); 
    console.log( userProfile );
    var buffer = userProfile.ToArrayBuffer();

}

function testToBase64(){

    var userProfile = new UserProfile({
        sex: 1,
        age: 23,
        weight: 50,
        stepTarget: 10000,
        caloriesTarget: 300,
        distanceTarget: 10,
        time: new Date(),
    }); 
    //console.log( userProfile );
    var buffer = userProfile.ToArrayBuffer();
    var binary = arrayBufferToBase64(buffer);
    console.log(binary);

}

function testInitRequest(){

    var insoleMessage = new InsoleMessage({head:{},body:{},});
    insoleMessage.initRequest({
        seq: 0,
        body: new ArrayBuffer(0),
        command: InsoleHead.Command.JSSDKResp,
    });
    console.log(insoleMessage.ToBase64());

}

function testArrayBufferCat(){

    var buffer1 = ToArrayBuffer([
         0x00, 0x0c, 0x00, 0x01, 
         0x00, 0x14, 0x00, 0x02 , 
         0x00, 0x00 ,0x00, 0x00
    ]);
    var buffer2 = ToArrayBuffer([
         0x11, 0x0c, 0x00, 0x01, 
         0x00, 0x14, 0x00, 0x02 , 
         0x00, 0x00 ,0x00, 0x22
    ]);
    var buffer = arraryBufferCat(buffer1,buffer2);
    console.log(arrayBufferToBase64(buffer));

}

