// vim: set expandtab :
'use strict';

var config = require('../../config/config');

// Set the initial vars
var timestamp = +new Date(),
    delay = config.currencyRefresh * 60000,
    bitpayBBB = null,
    monatrBTCMONA = null;

exports.index = function(req, res) {

  var _xhr = function() {
    if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest !== null) {
      return new XMLHttpRequest();
    } else if (typeof require !== 'undefined' && require !== null) {
      var XMLhttprequest = require('xmlhttprequest').XMLHttpRequest;
      return new XMLhttprequest();
    }
  };

  var _request = function(url, cb) {
    var request;
    request = _xhr();
    request.open('GET', url, true);
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200) {
          return cb(false, request.responseText);
        }

        return cb(true, {
          status: request.status,
          message: 'Request error'
        });
      }
    };

    return request.send(null);
  };

  // Init
  var currentTime = +new Date();
  if (bitpayBBB !== null && monatrBTCMONA !== null && currentTime <= (timestamp + delay)) {
    res.jsonp({
      status: 200,
      data: {
        bitpayBBB: bitpayBBB,
        monatrBTCMONA: monatrBTCMONA,
      }
    });
  }else{
  // Fetch bitpayBBB.
    timestamp = currentTime;

    _request('https://bitpay.com/api/rates', function(err, data) {
      if (!err) bitpayBBB = JSON.parse(data);
      _request('https://api.monatr.jp/ticker?market=BTC_MONA', function(err, data) {
        if (!err) monatrBTCMONA = JSON.parse(data);
        res.jsonp({
          status: 200,
          data: {
            bitpayBBB: bitpayBBB,
            monatrBTCMONA: monatrBTCMONA,
          }
        });
      });
    });
  }
};
