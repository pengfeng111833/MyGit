'use strict';

const lib = {
    fs: require('./fs'),
    HttpClient: require('./http_client')
};

const https = require('https');
const base64 = require('base64-js');

class WechatDeviceApi {
    constructor(accessToken) {
        this._accessToken = accessToken;
        this._client = new lib.HttpClient();
    }

    transportMessage(deviceType, deviceId, openId, content) {
        const data = this.requestPost({
            path: '/device/transmsg',
            data: {
                device_type: deviceType,
                device_id: deviceId,
                open_id: openId,
                content: content
            }
        });

        return data;
    }

    getQrCode(deviceIds) {
        const data = this.requestPost({
            path: '/device/create_qrcode',
            data: {
                device_num: deviceIds.length,
                device_id_list: deviceIds
            }
        });

        return data;
    }

    authorizeDevices(productId, opType, devices) {
        const data = this.requestPost({
            path: '/device/authorize_device',
            data: {
                device_num: devices.length,
                device_list: devices,
                op_type: opType,
                product_id: productId
            }
        });

        return data;
    }

    getStatus(deviceId) {
        const data = this.requestGet({
            path: '/device/get_stat',
            query: {
                device_id: deviceId
            }
        });

        return {
            error: {
                code: data.errcode,
                message: data.errmsg
            },
            data: {
                status: data.status,
                statusInfo: data.status_info
            }
        };
    }

    getOpenIds(deviceType, deviceId) {
        const data = this.requestGet({
            path: '/device/get_openid',
            query: {
                device_id: deviceId,
                device_type: deviceType,
            }
        });

        return data;
        return data;
    }

    getDeviceUnbind(ticket, deviceId, openId) {
        const data = this.requestPost({
            path: '/device/unbind',
            data: {
                ticket: ticket,
                device_id: deviceId,
                openid: openId
            }
        });

        return data;
    }

    requestGet(options) {
        const query = Object.create(null);
        if ( options.query ) {
            Object.keys(options.query).forEach(key => {
                query[key] = options.query[key];
            });
        }
        query.access_token = this._accessToken;

        const result = this._client.requestSync({
            requester: https.request,
            method: 'get',
            host: 'api.weixin.qq.com',
            path: options.path,
            query: query
        });

        const data = JSON.parse(result.data);
        return data;
    }

    requestPost(options) {
        const query = Object.create(null);
        if ( options.query ) {
            Object.keys(options.query).forEach(key => {
                query[key] = options.query[key];
            });
        }
        query.access_token = this._accessToken;

        const result = this._client.requestSync({
            requester: https.request,
            method: 'post',
            host: 'api.weixin.qq.com',
            path: options.path,
            query: query,
            data: JSON.stringify(options.data),
            dataType: 'applicaton/json'
        });

        const data = JSON.parse(result.data);
        return data;
    }
}

function getApi() {
    const accessTokenData = lib.fs.readFile('./data/access_token.txt', 'utf8');
    const accessTokenObject = JSON.parse(accessTokenData);
    const accessToken = accessTokenObject.accessToken;

    const api = new WechatDeviceApi(accessToken);

    return api;
}

module.exports = {
    getApi
};
