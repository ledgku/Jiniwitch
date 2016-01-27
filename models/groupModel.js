var mysql = require('mysql');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);
var logger = require('../logger');
var async = require('async');

/*****************************
 *      group list
 *****************************/
exports.listGroup = function(user_email, done)
{
    pool.getConnection(function(err, conn)
    {
        if (err)
        {
            logger.error("Group list getConnection error : ", err);
            done(2, "Group list DB error");
            conn.release();
        }
        else
        {
            var sql = "SELECT groups.id, groups.name FROM groups JOIN (SELECT GROUP_id FROM user_group WHERE USER_email=?) as a on groups.id = a.GROUP_id";
            conn.query(sql, user_email, function(err, rows)
            {
                if (err)
                {
                    logger.error("Group list conn query error : ", err);
                    done(2, null, "Group list DB error");
                    conn.release();
                }
                else
                {
                    done(1, rows, "Group list success");
                    conn.release();
                }
            });
        }
    });
};

/*****************************
 *      group add
 *****************************/
exports.addGroup = function(datas, done)
{
    pool.getConnection(function(err, conn)
    {
        if (err)
        {
            logger.error("Group add getConnection error : ", err);
            done(2, "Group add DB error");
        }
        else
        {
            // Transaction start
            // commit conditions : Insert group info to GROUPS table, Insert manager's info to USER_GROUP table, Insert member's info to USER_GROUP table
            conn.beginTransaction(function(err)
            {
                if (err)
                {
                    logger.error("Group add beginTransaction error : ", err);
                    done(2, "Group add DB error");
                    conn.release();
                }
                else
                {
                    async.waterfall([
                        function(callback)
                        {
                            var sql = "INSERT INTO groups(name, manager) VALUES(?, ?)";
                            conn.query(sql, [datas.group_name, datas.session_user], function(err, rows)
                            {
                                if (err)
                                {
                                    logger.error("GROUP add conn query error : ", err);
                                    callback(err, "GROUP add conn query error");
                                }
                                else
                                    callback(null, rows.insertId);
                            });
                        },
                        function(group_idx, callback)
                        {
                            var sql = "INSERT INTO user_group(USER_email, GROUP_id) values(?, ?)";
                            conn.query(sql, [datas.session_user, group_idx], function(err, rows)
                            {
                               if (err)
                               {
                                   logger.error("Group add conn query error : ", err);
                                   callback(err, "Group add conn query error");
                               }
                               else
                                   callback(null, group_idx);
                            });
                        },
                        function(group_idx, callback)
                        {
                            console.log(group_idx);
                            console.log(datas.list_user[0]);

                            async.each(datas.list_user, function iterator(user, callback)
                            {
                                var sql = "INSERT INTO user_group(USER_email, GROUP_id) values(?, ?)";
                                conn.query(sql, [user, group_idx], function(err, rows)
                                {
                                    if (err)
                                        callback(err);
                                    else
                                        callback();
                                });
                            }, function(err, message)
                            {
                                if (err)
                                    callback(err);
                                else
                                    callback(null, "success");
                            });
                        }
                    ], function(err, message)
                    {
                        if (err)
                        {
                            conn.rollback(function(){
                                logger.info("Group add fail, rollback : ", err);
                                done(2, "Group add DB error");
                                conn.release();
                            });

                        }
                        else
                        {
                            conn.commit(function(err)
                            {
                                if (err)
                                {
                                    logger.error("Group add commit error", err);
                                    done(2, "Group add DB error");
                                    conn.release();
                                }
                                else
                                {
                                    done(1, "Group add success");
                                    conn.release();
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

/*****************************
 *      group delete
 *****************************/
exports.deleteGroup = function(group_id, done)
{
    pool.getConnection(function(err, conn)
    {
       if (err)
       {
           logger.error("Group delete getConnection error : ", err);
           done(2, "Group delete DB error");
           conn.release();
       }
       else
       {
           var sql = "DELETE FROM groups WHERE id=?";
           conn.query(sql, group_id, function(err, rows) {
               if (err) {
                   logger.error("Group delete conn query error : ", err);
                   done(2, "Group delete DB error");
                   conn.release();
               }
               else
               {
                   done(1, "Group delete success");
                   conn.release();
               }
           });
       }
    });
};

/*****************************
 *      group manager check
 *****************************/
exports.checkManager = function(group_id, done)
{
    pool.getConnection(function(err, conn)
    {
       if (err)
       {
           logger.error("Group manager check getConnection error : ", err);
           done(2, null, "Group manager check DB error");
           conn.release();
       }
        else
       {
           var sql = "SELECT manager FROM groups WHERE id=?";
           conn.query(sql, group_id, function(err, rows)
           {
              if (err)
              {
                  logger.error("Group manager check conn query error : ", err);
                  done(2, null, "Group manager check DB error");
                  conn.release();
              }
              else
              {
                  done(1, rows, "success");
                  conn.release();
              }
           });
       }
    });
};

/*****************************
 *      group member check
 *****************************/
exports.memberCheck = function(datas, done)
{
    pool.getConnection(function(err, conn)
    {
        if (err)
        {
            logger.error("Group member check getConnection error : ", err);
            done(2, null, "Group member check DB error");
            conn.release();
        }
        else
        {
            var sql = "SELECT count(*) AS cnt FROM (SELECT GROUP_id FROM user_group WHERE USER_email = ?) AS a JOIN groups ON a.GROUP_id = groups.id WHERE groups.id=?;";
            conn.query(sql, [datas.email, datas.group_id], function(err, rows)
            {
                if (err)
                {
                    logger.error("Group member check conn query error : ", err);
                    done(2, null, "Group member check DB error");
                    conn.release();
                }
                else
                {
                    done(1, rows, "Group member check success");
                    conn.release();
                }
            });
        }
    });
};