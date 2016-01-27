var mysql = require('mysql');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);
var logger = require('../logger');
var async = require('async');

/*****************************
 *      USER Join
 *****************************/
exports.join = function(user_data, done)
{
    pool.getConnection(function(err, conn){
        if (err)
        {
            logger.error("User join getConnection error : ", err);
            done(2, "User join DB error");
            conn.release();
        }
        else
        {
            // email duplicate check
            var sql = "SELECT count(*) as cnt FROM user WHERE email = ?";
            conn.query(sql, user_data.user_email, function(err, rows)
            {
                if (err)
                {
                    logger.error("User join conn query error : ", err);
                    done(2, "User join DB error");
                    conn.release();
                }
                else
                {
                    // query result
                    // 0 : not duplicate
                    // 1 : duplicated
                    if (!rows[0].cnt)
                    {
                        // Insert data to USER table
                        var sql = "INSERT INTO user(email, password, nickname) VALUES(?,?,?)";
                        conn.query(sql, [user_data.user_email, user_data.user_password, user_data.user_nickname], function(err, rows)
                        {
                            if (err)
                            {
                                logger.error("User join conn query error : ", err);
                                done(2, "User join DB error");
                                conn.release();
                            }
                            else
                            {
                                done(1, "User join success");
                                conn.release();
                            }
                        });
                    }
                    else
                    {
                        done(3, "Duplicate email");
                        conn.release();
                    }
                }
            });
        }
    });
};

/*****************************
 *      USER login
 *****************************/
exports.login = function(user_data, done)
{
    pool.getConnection(function(err, conn) {
        if (err)
        {
            logger.error("User login getConnection error : ", err);
            done(2, "User login DB error");
            conn.release();
        }
        else
        {
            // Query email and password
            // If exist(cnt=1), login success
            // Else login fail
            var sql = "SELECT count(*) as cnt FROM user WHERE email=? and password=?";
            conn.query(sql, [user_data.user_email, user_data.user_password], function(err, rows)
            {
                if (err)
                {
                    logger.error("User login conn query error : ", err);
                    done(2, "User login DB error");
                    conn.release();
                }
                else
                {
                    if (!rows[0].cnt)
                    {
                        done(0, "Incorrect email or password");
                        conn.release();
                    }
                    else
                    {
                        done(1, "User login success");
                        conn.release();
                    }
                }
            });
        }

    });
};