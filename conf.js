var cryptor_key = "sgenhyunheeminyoungsehunjunheeseyeonsungsudongkyu";
var encryptor = require('simple-encryptor')(cryptor_key);


/*************************
 *      Redis Setting
 ************************/
exports.redisSelect = function(){
    return 7;
};
exports.redisAddr = function(){
    return "localhost";
};
exports.redisPort = function(){
    return 6739;
};

/*************************
 *         Cryptor
 ************************/

exports.encrypted = function(data)
{
    return encryptor.encrypt(data);
};

exports.decrypted = function(data)
{
    return encryptor.decrypt(data);
};