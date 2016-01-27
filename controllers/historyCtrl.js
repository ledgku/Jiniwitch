var alarmModel = require('../models/historyModel');

/*****************************
 *      alarm list
 *****************************/
exports.list = function(req, res)
{
    alarmModel.list(req.session.email, function(status, alarm_list, message)
    {
        if (status==0)
            alarm_list = null;

        return res.json({
            "status": status,
            "message": message,
            "alarm_list": alarm_list
        });
    });
};