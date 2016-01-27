var hwModel = require('../models/hwModel');
var request = require('request');
var db_crypto = require('../models/db_crypto');

/*****************************
 *      switch list
 *****************************/
exports.list = function(req, res)
{
    // parameter check
    if (!req.body.group_id)
    {
        return res.json({
            "status" : 0,
            "message" : "null input exist"
        });
    }
    else
    {
        hwModel.listSwitch(req.body.group_id, function(status, hw_list, message)
        {
            if (status==0)
                hw_list = null;

            return res.json({
                "status": status,
                "message": message,
                "hw_list": hw_list
            });
        });
    }
};

/*****************************
 *      switch add
 *****************************/
exports.add = function(req, res)
{
    // parameter check
    if (!req.body.group_id || !req.body.name || !req.body.product_no || !req.body.password || !req.body.ip || !req.body.port)
    {
        return res.json({
            "status" : 0,
            "message" : "null input exist"
        });
    }
    else
    {
        var datas = {
            "group_id" : req.body.group_id,
            "name" : req.body.name,
            "product_no" : req.body.product_no,
            "password" : db_crypto.do_ciper(req.body.password),
            "ip" : req.body.ip,
            "port" : req.body.port
        };

        hwModel.addSwitch(datas, function(status, message)
        {
            return res.json({
                "status" : status,
                "message" : message
            });
        });
    }
};

/*****************************
 *      switch delete
 *****************************/
exports.delete = function(req, res)
{
    // parameter check
    if (!req.body.hw_id || !req.body.password)
    {
        return res.json({
            "status" : 0,
            "message" : "null input exist"
        });
    }
    else
    {
        var datas = {
            "hw_id" : req.body.hw_id,
            "password" : db_crypto.do_ciper(req.body.password)
        };
        hwModel.deleteSwitch(datas, function(status, message)
        {
           return res.json({
               "status" : status,
               "message" : message
           }) ;
        });
    }
};

/*****************************
 *      switch info
 *****************************/
exports.info = function(req, res)
{
    // parameter check
    if (!req.body.group_id || !req.body.hw_id)
    {
        return res.json({
            "status" : 0,
            "message" : "null input exist"
        });
    }
    else
    {
        var datas = {
            "group_id" : req.body.group_id,
            "hw_id" : req.body.hw_id
        };

        hwModel.infoSwitch(datas, function(status, info, message)
        {
            return res.json({
                "status" : status,
                "message" : message,
                "info" : info
            });
        });
    }
};

/*****************************
 *      switch on
 *****************************/
exports.on = function(req, res)
{
    if (!req.body.hw_id)
    {
        // parameter check
        return res.json({
            "status" : 0,
            "message" : "null input exist"
        });
    }
    else
    {
        hwModel.onSwitch(req.body.hw_id, function(status, datas, message){
            if (status != 1 || datas == null)
            {
                return res.json({
                    "status" : 2,
                    "message" : message
                });
            }
            var address = "http://"+datas[0].ip+":"+datas[0].port+"/";
            // Using Request module (Installed by npm)

            // Send data (request.body)
            //console.log(address);
            //request.post(
            //    address,
            //    { form: {key: '1'}},
            //    function (err, response, body)
            //    {
            //        if (!err && response.statusCode == 200)
            //            console.log(body);
            //    }
            //);

            // Send data (request.header)
            var options = {
                method: 'POST',
                url: address,
                headers: {
                    key: '1'
                }
            };

            function callback(error, response, body){
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    console.log(info.stargazers_count + " Stars");
                    console.log(info.forks_count + " Forks");
                }
            }

            // request to arduino(ESP8266)
            request(options, callback);

            return res.json({
                "status" : 1,
                "message" : "success"
            });
        });
    }
};

/*****************************
 *      switch off
 *****************************/
exports.off = function(req, res)
{
    if (!req.body.hw_id)
    {
        return res.json({
            "status" : 0,
            "message" : "null input exist"
        });
    }
    else
    {
        hwModel.offSwitch(req.body.hw_id, function(status, datas, message){
            if (status != 1 || datas == null)
            {
                return res.json({
                    "status" : 2,
                    "message" : message
                });
            }
            var address = "http://"+datas[0].ip+":"+datas[0].port+"/";

            // Using Request module (Installed by npm)

            // Send data (request.body)
            //console.log(address);
            //request.post(
            //    address,
            //    { form: {key: '1'}},
            //    function (err, response, body)
            //    {
            //        if (!err && response.statusCode == 200)
            //            console.log(body);
            //    }
            //);

            // Send data (request.header)
            var options = {
                method: 'POST',
                url: address,
                headers: {
                    key: '0'
                }
            };

            function callback(error, response, body){
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    console.log(info.stargazers_count + " Stars");
                    console.log(info.forks_count + " Forks");
                }
            }

            // request to arduino(ESP8266)
            request(options, callback);

            return res.json({
                "status" : 1,
                "message" : "success"
            });
        });
    }
};