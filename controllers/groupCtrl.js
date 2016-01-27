var groupModel = require('../models/groupModel');
var logger = require('../logger');

/*****************************
 *      group list
 *****************************/
exports.list = function(req, res)
{
    groupModel.listGroup(req.session.email, function(status, group_list, message)
    {
        if (status==0)
            group_list = null;

        return res.json({
            "status": status,
            "message": message,
            "group_list": group_list
        });
    });
};

/*****************************
 *      group add
 *****************************/
exports.add = function(req, res)
{
    // parameter check
    if (!req.body.group_name)
    {
        return res.json({
            "status" : 0,
            "message" : "null input exist"
        });
    }
    else
    {
        var datas = {
            "session_user" : req.session.email,
            "list_user" : req.body.users,
            "group_name" : req.body.group_name
        };

        groupModel.addGroup(datas, function(status, message)
        {
            return res.json({
                "status" : status,
                "message" : message
            });
        });
    }
};

/*****************************
 *      group delete
 *****************************/
exports.delete = function(req, res)
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
        groupModel.deleteGroup(req.body.group_id, function(status, message)
        {
           return res.json({
               "status" : status,
               "message" : message
           })
        });
    }
};

/*****************************
 *      group manager check
 *****************************/
exports.managerCheck = function(req, res, next)
{
    // parameter check
    if(!req.body.group_id)
    {
        return res.json({
            "status" : 0,
            "message" : "null input exist"
        });
    }
    else
    {
        groupModel.checkManager(req.body.group_id, function(status, manager_id, message)
        {
            // parameter check
            if (manager_id.length == 0)
                return res.json({
                    "status" : 0,
                    "message" : "wrong input"
                });

            // If session.email is manager of group_id, pass
            // Else return fail message
            if (req.session.email == manager_id[0].manager)
                next();
            else
            {
                if (status != 2)
                {
                    status = 4;
                    message = "Permission denied";
                }
                return res.json({
                    "status" : status,
                    "message" : message
                });
            }
        });
    }
};

/*****************************
 *      group member check
 *****************************/
exports.memberCheck = function(req, res, next)
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
        var datas = {
            "email" : req.session.email,
            "group_id" : req.body.group_id
        };

        groupModel.memberCheck(datas, function(status, cnt, message)
        {
            // If session.email is member of group_id(cnt==1), pass
            // Else return fail message
            if (cnt[0].cnt >= 1)
                next();
            else
            {
                return res.json({
                    "status" : 5,
                    "message" : "Not a group member"
                });
            }
        });
    }
};