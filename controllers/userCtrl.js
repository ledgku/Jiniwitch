var userModel = require('../models/userModel');
var db_crypto = require('../models/db_crypto');
var logger = require('../logger');

/*****************************
 *  USER Join
 *****************************/
exports.join = function(req, res)
{
    // parameter check
    if (!req.body.email || !req.body.password || !req.body.nickname)
    {
        return res.json({
            "status" : 0,
            "message" : "null input exist"
        });
    }
    else
    {
        var user_data = {
            "user_email" : req.body.email,
            //"user_password" : conf.decrypted(req.body.password),
            "user_password" : db_crypto.do_ciper(req.body.password),
            "user_nickname" : req.body.nickname
        };
        userModel.join(user_data, function(status, message)
        {
            return res.json({
               "status" : status,
                "message" : message
            });
        });
    }
};

/*****************************
 *      USER login
 *****************************/
exports.login = function(req, res)
{
    // parameter check
    if (!req.body.email || !req.body.password)
    {
        return res.json({
            "status" : 0,
            "message" : "null input exist"
        });
    }
    else
    {
        var user_data = {
            "user_email" : req.body.email,
            //"user_password" : conf.decrypted(req.body.password),
            "user_password" : db_crypto.do_ciper(req.body.password)
        };
        userModel.login(user_data, function(status, message)
        {
            if (status==1)
                req.session.email = user_data.user_email;

            return res.json({
                "status" : status,
                "message" : message
            });
        });
    }
};

/*****************************
 *      USER login Check
 *****************************/
exports.loginCheck = function(req, res, next)
{
    // check login session
    // exist : pass
    // not exist : return fail message
    if (req.session.email)
        next();
    else
        return res.json({
            "status" : 0,
            "message" : "Login Required"
        });
};

/*****************************
 *      USER logout
 *****************************/
exports.logout = function(req, res)
{
    // destory login session
    req.session.destroy();

    return res.json({
        "status" : 1,
        "message" : "Logout"
    });
};
