'use strict'

var deviceInfoPageClass = {
    el: '#page-wrapper',
    data: {
        device: {
            id: '',
            macAddress: '',
            snCode: '',
            batteryInfo: '',
            version: '',
            wechatType: '',
            wechatId: '',
        },
        weSDKinited: false,
    },
    created: function() {
        var self = this;
        var request = new HttpRequest('/person/devices');
        request.getJSON(function(res) {
            if( res.successful == true ){
                var devices = res.data.devices;
                if ( !(devices.length) ) {
                    alert('未绑定设备');
                    window.location.href = Wechat.makeAuthUrl("/pages/home.html");
                    return;
                }

                self.device = devices[0];
                $('#myLoading').hide();
                $('#page-wrapper').show();
            }
        });
    },
    methods: {
        unbind: function() {
            var self = this;
            if( !(self.weSDKinited) ){
                alert('页面正在初始化，请稍后');
            }
            else{
                var isToUnbind = confirm('您确定要解除绑定该设备吗？');
                if ( !isToUnbind ) {
                    return;
                }

                var wechatDeviceId = this.device.wechatId;
                getDeviceUnboundTicket(wechatDeviceId, function(res) {
                    if ( res.err_msg != 'getWXDeviceTicket:ok' ) {
                        alert('获取解绑权限失败');
                        return;
                    }

                    var ticket = res.ticket; 
                    self.sendUnbindRequest(ticket);
                }); 
            }
        },
        sendUnbindRequest: function(ticket) {
            var self = this;
            var deviceId = this.device.id;

            var request = new HttpRequest('/device/' + deviceId + '/unbound');
            request.postJSON({
                ticket: ticket
            },function(res) {
                if(res.successful === true)
                {
                    alert("解绑完毕");
                    window.location.href = Wechat.makeAuthUrl("/pages/home.html");
                }
                else{
                    alert("解绑失败");
                }
            });
        }
    },
}

Wechat.login(function(result) {
    var deviceInfoPage = new Vue(deviceInfoPageClass);

    Wechat.applyJsConfig(function() {
        openWXDeviceLib(function(res) {
            deviceInfoPage.weSDKinited = true;
            var deviceRequest = new HttpRequest('/person/devices');
            deviceRequest.getJSON(function( res ){
                var devices = res.data.devices;
                var device = devices[0];
                var deviceId = device.wechatId;
                connectWXDevice(deviceId, function(res){
                    var insoleMessage = new InsoleMessage({head:{},body:{},});
                    insoleMessage.initRequest({
                        seq: 0,
                        body: new ArrayBuffer(0),
                        command: InsoleHead.Command.JSSDKReq,
                    });
                    var binary = {
                        feedBack : false,
                        message : insoleMessage.ToBase64(),
                    };

                    setInterval( function(){
                        if( !binary.feedBack ){
                            console.log('发送了一次数据');
                            sendDataToWXDevice(deviceId, binary.message, function( res ){
                            });
                            //发送数据
                        }
                    } ,10000);
                    bindReceiveDataEvent( deviceId, binary );
                });
            });
        });
    },function(err) {
        alert("配置微信JDK错误");
    });

}, function(){
    alert('登录失败');
});
