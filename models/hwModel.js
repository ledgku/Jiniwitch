var mysql = require('mysql');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);
var logger = require('../logger');
var async = require('async');

/*****************************
 *      switch list
 *****************************/
exports.listSwitch = function(group_id, done)
{
    pool.getConnection(function(err, conn)
    {
        if (err)
        {
            logger.error("Switch list getConnection error : ", err);
            done(2, "Switch list DB error");
            conn.release();
        }
        else
        {
            // Query switches of group_id
            var sql = "SELECT id, name, hw_status, alarm_mode, alarm_onoff, GROUP_id FROM hw WHERE GROUP_id=?";
            conn.query(sql, group_id, function(err, rows)
            {
                if (err)
                {
                    logger.error("Switch list conn query error : ", err);
                    done(2, null, "Switch list DB error");
                    conn.release();
                }
                else
                {
                    done(1, rows, "Switch list success");
                    conn.release();
                }
            });
        }
    });
};

/*****************************
 *      switch add
 *****************************/
exports.addSwitch = function(datas, done)
{
    pool.getConnection(function(err, conn)
    {
        if (err)
        {
            logger.error("Switch add getConnection error : ", err);
            done(2, "Switch add DB error");
            conn.release();
        }
        else
        {
            // Insert switch data to HW table
            var sql = "INSERT INTO hw(name, product_no, GROUP_id, password, ip, port) VALUES(?,?,?,?,?,?)";
            conn.query(sql, [datas.name, datas.product_no, datas.group_id, datas.password, datas.ip, datas.port], function(err, rows)
            {
                if (err)
                {
                    logger.error("Switch add conn query error : ", err);
                    done(2, "Switch add DB error");
                    conn.release();
                }
                else
                {
                    done(1, "Switch add success");
                    conn.release();
                }
            });
        }
    });
};

/*****************************
 *      switch delete
 *****************************/
exports.deleteSwitch = function(datas, done)
{
    pool.getConnection(function(err, conn)
    {
        if (err)
        {
            logger.error("Switch delete getConnection error : ", err);
            done(2, "Switch delete DB error");
            conn.release();
        }
        else
        {
            async.waterfall([
                function(callback)
                {
                    // password check
                    // success : true
                    // fail : false
                    var sql = "SELECT password FROM hw WHERE id=?";
                    conn.query(sql, datas.hw_id, function(err, rows)
                    {
                        if (err)
                            callback(err);
                        else
                        {
                            if (rows[0].password == datas.password)
                                callback(null, true);
                            else
                                callback(null, false);
                        }
                    });
                }, function(flag, callback)
                {
                    // If password check success
                    if (flag)
                    {
                        // delete switch
                        var sql = "DELETE FROM hw WHERE id=?";
                        conn.query(sql, datas.hw_id, function(err, rows)
                        {
                            if (err)
                                callback(err);
                            else
                                callback(null, true);
                        });
                    }
                    // If password check fail
                    else
                        callback(null, false);
                }
            ],function(err, flag)
            {
                if (err)
                {
                    logger.error("Switch delete error", err);
                    done(2, "Switch delete DB error");
                    conn.release();
                }
                else
                {
                    if (flag)
                    {
                        done(1, "success");
                        conn.release();
                    }
                    else
                    {
                        done(0, "Incorrect password");
                        conn.release();
                    }
                }
            });
        }
    });
};

/*****************************
 *      switch info
 *****************************/
exports.infoSwitch = function(datas, done)
{
    pool.getConnection(function(err, conn)
    {
       if (err)
       {
           logger.error("Switch info getConnection error : ", err);
           done(2, null, "Switch info DB error");
           conn.release();
       }
        else
       {
           async.parallel([
               function(callback)
               {
                   // Query switch info
                   var sql = "SELECT id, name, product_no, hw_status, alarm_mode, alarm_onoff FROM hw WHERE id = ? and GROUP_id = ?";
                   conn.query(sql, [datas.hw_id, datas.group_id], function(err, rows)
                   {
                       if (err)
                           callback(err);
                       else
                           callback(null, rows);
                   });

               }, function(callback)
               {
                   // Query alarm data of switch
                   var sql = "SELECT alarm_day.day, a.alarm_time FROM alarm_day JOIN (SELECT id, alarm_time FROM hw WHERE GROUP_id = ? and id = ?) AS a ON alarm_day.HW_id = a.id;";
                   conn.query(sql, [datas.group_id, datas.hw_id], function(err, rows)
                   {
                       if (err)
                           callback(err);
                       else
                           callback(null, rows);
                   });
               }
           ],function(err, results)
           {
               if (err)
               {
                   logger.error("Switch info conn query error : ", err);
                   done(2, null, "Switch info DB error");
                   conn.release();
               }
               else
               {
                   done(1, results, "Switch info success");
                   conn.release();
               }
           });
       }
    });
};

/*****************************
 *      switch on
 *****************************/
exports.onSwitch = function(hw_id, done)
{
    pool.getConnection(function(err, conn)
    {
        if (err) {
            logger.error("Switch on getConnection error : ", err);
            done(2, null, "Switch on DB error");
            conn.release();
        }
        else
        {
            // Transaction start
            // commit conditions : switch status is off, update switch status of HW table, query hw's ip and port
            conn.beginTransaction(function(err)
            {
                if (err)
                {
                    logger.error("Switch on beginTransaction error : ", err);
                    done(2, "Switch on DB error");
                    conn.release();
                }
                else
                {
                    async.waterfall([
                        function(callback)
                        {
                            var sql = "SELECT hw_status FROM hw WHERE id=?";
                            conn.query(sql, hw_id, function(err, rows)
                            {
                                if (err)
                                {
                                    logger.error("Switch on conn query error : ", err);
                                    callback(err);
                                }
                                else
                                {
                                    if (rows[0].hw_status == 1) {
                                        done(2, null, "Switch on");
                                        conn.release();
                                    }
                                    else
                                        callback(null);
                                }
                            });
                        },
                        function(callback)
                        {
                            var sql = "UPDATE hw SET hw_status = 1 WHERE id=?";
                            conn.query(sql, hw_id, function(err, rows) {
                                if (err)
                                {
                                    logger.error("Switch on conn query error : ", err);
                                    callback(err);
                                }
                                else
                                    callback(null);
                            });
                        }, function(callback)
                        {
                            var sql = "SELECT ip, port FROM hw WHERE id=?";
                            conn.query(sql, hw_id, function(err, rows)
                            {
                                if (err)
                                {
                                    logger.error("Switch on conn query error : ", err);
                                    callback(err);
                                }
                                else
                                    callback(null, rows);
                            });
                        }
                    ],function(err, rows)
                    {
                        if (err)
                        {
                            conn.rollback(function()
                            {
                                logger.info("Switch on fail, rollback : ", err);
                                done(2, null, "Switch on DB error");
                                conn.release();
                            });
                        }
                        else
                        {
                            conn.commit(function(err)
                            {
                               if (err)
                               {
                                   logger.info("Switch on commit error : ", err);
                                   done(2, null, "Switch on DB error");
                                   conn.release();
                               }
                                else
                               {
                                   done(1, rows, "Switch on success");
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
 *      switch off
 *****************************/
exports.offSwitch = function(hw_id, done)
{
    pool.getConnection(function(err, conn)
    {
        if (err) {
            logger.error("Switch off getConnection error : ", err);
            done(2, null, "Switch off DB error");
            conn.release();
        }
        else
        {
            // Transaction start
            // commit conditions : switch status is on, update switch status of HW table, query hw's ip and port
            conn.beginTransaction(function(err)
            {
                if (err)
                {
                    logger.error("Switch off beginTransaction error : ", err);
                    done(2, "Switch off DB error");
                    conn.release();
                }
                else
                {
                    async.waterfall([
                        function(callback)
                        {
                            var sql = "SELECT hw_status FROM hw WHERE id=?";
                            conn.query(sql, hw_id, function(err, rows)
                            {
                                if (err)
                                {
                                    logger.error("Switch on conn query error : ", err);
                                    callback(err);
                                }
                                else
                                {
                                    if (rows[0].hw_status == 0) {
                                        done(2, null, "Switch off");
                                        conn.release();
                                    }
                                    else
                                        callback(null);
                                }
                            });
                        },
                        function(callback)
                        {
                            var sql = "UPDATE hw SET hw_status = 0 WHERE id=?";
                            conn.query(sql, hw_id, function(err, rows) {
                                if (err)
                                {
                                    logger.error("Switch off conn query error : ", err);
                                    callback(err);
                                }
                                else
                                    callback(null);
                            });
                        }, function(callback)
                        {
                            var sql = "SELECT ip, port FROM hw WHERE id=?";
                            conn.query(sql, hw_id, function(err, rows)
                            {
                                if (err)
                                {
                                    logger.error("Switch off conn query error : ", err);
                                    callback(err);
                                }
                                else
                                    callback(null, rows);
                            });
                        }
                    ],function(err, rows)
                    {
                        if (err)
                        {
                            conn.rollback(function()
                            {
                                logger.info("Switch off fail, rollback : ", err);
                                done(2, null, "Switch off DB error");
                                conn.release();
                            });
                        }
                        else
                        {
                            conn.commit(function(err)
                            {
                                if (err)
                                {
                                    logger.info("Switch off commit error : ", err);
                                    done(2, null, "Switch off DB error");
                                    conn.release();
                                }
                                else
                                {
                                    done(1, rows, "Switch off success");
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