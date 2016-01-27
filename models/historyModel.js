var mysql = require('mysql');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);
var logger = require('../logger');

/*****************************
 *      alarm list
 *****************************/
exports.list = function(user_email, done)
{
    pool.getConnection(function(err, conn)
    {
        if (err) {
            logger.error("History list getConnection error : ", err);
            done(2, "History list DB error");
            conn.release();
        }
        else {
            var sql = "SELECT d.name as groupName, d.nickname as nickname, hw.name as hwName, d.timestamp as timestamp, hw.hw_status as hwStatus FROM hw JOIN (SELECT c.name, user.nickname, c.hw_id, c.timestamp FROM user JOIN (SELECT groups.name, b.USER_email, b.HW_id, b.timestamp FROM groups JOIN (SELECT a.GROUP_id, USER_email, HW_id, timestamp FROM history JOIN (SELECT GROUP_id FROM user_group WHERE USER_email=?) AS a ON history.GROUP_id = a.GROUP_id) AS b ON groups.id = b.GROUP_id) AS c ON user.email = c.USER_email) AS d ON hw.id = d.HW_id";
            conn.query(sql, user_email, function(err, rows)
            {
                if (err)
                {
                    logger.error("History list conn query error : ", err);
                    done(2, null, "History list DB error");
                    conn.release();
                }
                else
                {
                    done(1, rows, "History list success");
                    conn.release();
                }
            });
        }
    });
};