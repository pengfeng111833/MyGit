'use strict'

var gaitAnalysisPageClass = {
    el : '#page-wrapper',
    data : {
        walkSteps : '4000',
        runningSteps : '3510',
        upstairSteps : '2560',
        downstairSteps : '2560',
        totalSitTime: '1小时20分钟',
        device : '',
    },
    methods : {

    },
    created : function() {
        var self = this;
        var deviceRequest = new HttpRequest('/person/devices');
        deviceRequest.getJSON(function (res) {
            if ( res.successful == true ){
                var devices = res.data.devices;
                if ( !devices.length ) {
                    alert('未绑定设备');
                    window.location.href = Wechat.makeAuthUrl("/pages/home.html");

                    return;
                }
                self.device = devices[0];

                var request = new HttpRequest('/device/' + self.device.id + '/sportModel');
                request.getJSON(function (res){
                    if(res.successful){
                        self.walkSteps = res.data.walk;
                        self.runningSteps = res.data.run;
                        self.upstairSteps = res.data.upstairs;
                        self.downstairSteps = res.data.downstairs;
                        self.totalSitTime = res.data.statics + '小时';
                        $('#myLoading').hide();
                        $('#page-wrapper').show();
                    }
                    else {
                        alert("get Data failed");
                    }

                });
            }
        });
    }
}

Wechat.login(function(result) {
    Wechat.applyJsConfig(function() {
        openWXDeviceLib(function(res) {
            console.log('openDeviceLib successfully');
            var deviceRequest = new HttpRequest('/person/devices');
            deviceRequest.getJSON(function( res ){
                var devices = res.data.devices;
                var device = devices[0];
                var deviceId = device.wechatId;
                console.log('device id ',deviceId);
                connectWXDevice(deviceId, function(res){
                    console.log('connect device successfully')
                    var insoleMessage = new InsoleMessage({head:{},body:{},});
                    insoleMessage.initRequest({
                        seq: 0,
                        body: new ArrayBuffer(0),
                        command: InsoleHead.Command.JSSDKReq,
                    });
                    var binary = insoleMessage.ToBase64();
                    sendDataToWXDevice(deviceId, binary, function( res ){
                        console.log('send data successfully');
                    });
                    bindReceiveDataEvent( deviceId );
                });
            });
        });
    },function(err) {
        alert("配置微信JDK错误");
    });
    var request = new HttpRequest('/person/personInfoIsNull');
    request.getJSON(function(res) {
        if(res.successful == false) {

            var gaitAnalysisPage = new Vue(gaitAnalysisPageClass);
            
        }
        else {
            alert('请先完善个人信息');
            window.location.href = Wechat.makeAuthUrl("/pages/complete-personal-information.html");
        }
    });
}, function(){
    alert('登录失败');
});
