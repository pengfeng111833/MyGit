'use strict';

var deviceId = 'gh_b5f537230a2c_40b26b2605009568';

Wechat.login(function(result) {
    $('.access-token').text(result.authInfo.accessToken);
    $('.open-id').text(result.authInfo.openId);
    $('.nick-name').text(result.userInfo.nickname);
    $('.sex').text(result.userInfo.sex == 0 ? '男' : '女');
    $('.country').text(result.userInfo.country);
    $('.province').text(result.userInfo.province);
    $('.head-img').attr('src', result.userInfo.headimgurl);

    Wechat.applyJsConfig(function() {
        $('.js-sdk-config').text('Success');

        openWXDeviceLib(function(res) {
            alert('openWXDeviceLib: ' + JSON.stringify(res));
            getDeviceUnboundTicket(function(res) {
                alert('getWXDeviceTicket: ' + JSON.stringify(res));
                closeWXDeviceLib(function(res) {
                    alert('closeWXDeviceLib: ' + JSON.stringify(res));
                });
            });
        });
    }, function(err) {
        $('.js-sdk-config').text('Failed');
    });

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

    function getDeviceUnboundTicket(callback) {
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
});
