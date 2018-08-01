'use strict';

Wechat.login(function(result) {

    Wechat.applyJsConfig(function() {
        $('.js-sdk-config').text('Success');

        openWXDeviceLib(function(res) {

            alert('openWXDeviceLib: ' + JSON.stringify(res));
            var deviceRequest = new HttpRequest('/person/devices');
            deviceRequest.getJSON(function( res ){
                var devices = res.data.devices;
                var device = devices[0];
                var deviceId = device.wechatId;
             //   alert( 'device Id is ' + deviceId );
                connectWXDevice(deviceId, function(res){
                    var insoleMessage = new InsoleMessage({head:{},body:{},});
                    insoleMessage.initRequest({
                        seq: 0,
                        body: new ArrayBuffer(0),
                        command: InsoleHead.Command.JSSDKReq,
                    });
                    var base64 =insoleMessage.ToBase64();
                    var binary = { 
                        message : base64,
                        feedBack : false,
                    };
                   // alert('send h5 connection request');
                    setInterval( function(){
                        if( !binary.feedBack ){
                            alert('发送了一次数据');
                            sendDataToWXDevice(deviceId, binary.message, function( res ){
                            });
                            //发送数据
                        }
                    } ,10000);
                    sendDataToWXDevice(deviceId, binary.message, function( res ){
                    });
                    bindReceiveDataEvent( deviceId, binary);
                });
            });
        });
    }, function(err) {
        $('.js-sdk-config').text('Failed');
    });
});

