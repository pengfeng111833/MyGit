'use strict';

// 通过orderId向后端请求获取支付宝支付参数alidata
function getArg(str,arg) {
    var reg = new RegExp('(^|&)' + arg + '=([^&]*)(&|$)', 'i');
    var r = str.match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
  }
  
  var alipayParam = {
    _input_charset: getArg(alidata,'_input_charset'),
    body: getArg(alidata,'body'),
    it_b_pay: getArg(alidata, 'it_b_pay'),
    notify_url: getArg(alidata, 'notify_url'),
    out_trade_no: getArg(alidata, 'out_trade_no'),
    partner: getArg(alidata, 'partner'),
    payment_type: getArg(alidata, 'payment_type'),
    return_url: getArg(alidata, 'return_url'),
    seller_id: getArg(alidata, 'seller_id'),
    service: getArg(alidata, 'service'),
    show_url: getArg(alidata, 'show_url'),
    subject: getArg(alidata, 'subject'),
    total_fee: getArg(alidata, 'total_fee'),
    sign_type: getArg(alidata, 'sign_type'),
    sign: getArg(alidata, 'sign'),
    app_pay: getArg(alidata, 'app_pay')
  };
  
  res.render('artist/alipay',{
    // 其他参数
    alipayParam: alipayParam
  });

// //将支付宝发来的数据生成有序数列
// function getVerifyParams(params) {
//     var sPara = [];
//     if(!params) return null;
//     for(var key in params) {
//         if((!params[key]) || key == "sign" || key == "sign_type") {
//             continue;
//         };
//         sPara.push([key, params[key]]);
//     }
//     sPara = sPara.sort();
//     var prestr = '';
//     for(var i2 = 0; i2 < sPara.length; i2++) {
//         var obj = sPara[i2];
//         if(i2 == sPara.length - 1) {
//             prestr = prestr + obj[0] + '=' + obj[1] + '';
//         } else {
//             prestr = prestr + obj[0] + '=' + obj[1] + '&';
//         }
//     }
//     return prestr;
// }

// //验签
// function veriySign(params) {
//     try {
//         var publicPem = fs.readFileSync('./rsa_public_key.pem');
//         var publicKey = publicPem.toString();
//         var prestr = getVerifyParams(params);
//         var sign = params['sign'] ? params['sign'] : "";
//         var verify = crypto.createVerify('RSA-SHA1');
//         verify.update(prestr);
//         return verify.verify(publicKey, sign, 'base64')

//     } catch(err) {
//         console.log('veriSign err', err)
//     }
// }

// //回调验签
// function getAlipay(req, res) {
//     console.log(req.body)
//     var params = req.body
//     var mysign = veriySign(params);
//     //验证支付宝签名mysign为true表示签名正确
//     console.log(mysign)
//     try {
//         //验签成功
//         if(mysign) {
//             if(params['notify_id']) {
//                 var partner = AlipayConfig.partner;
//                 //生成验证支付宝通知的url
//                 var url = 'https://mapi.alipay.com/gateway.do?service=notify_verify&' + 'partner=' + partner + '&notify_id=' + params['notify_id'];
//                 console.log('url:' + url)
//                 //验证是否是支付宝发来的通知
//                 https.get(url, function(text) {
//                     //有数据表示是由支付宝发来的通知
//                     if(text) {
//                         //交易成功
//                         console.log('success')
//                     } else {
//                         //交易失败
//                         console.log('err')
//                     }
//                 })
//             }
//         }
//     } catch(err) {
//         console.log(err);
//     }
// }

// module.exports = {
//     getVerifyParams,
//     veriySign,
//     getAlipay,
// };
