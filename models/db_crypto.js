var crypto = require('crypto');

exports.do_ciper = function(inputpass)
{
    // crypto salt
    // ex. akldfjiqwvkjzlxcjbljlakjeijriqewjroljlkdf
    var salt = "";
    // encryption iteration count
    var iterations = 300;
    // length of output
    var keylen = 24;

    // generate encrypted key
    var derivedKey = crypto.pbkdf2Sync(inputpass, salt, iterations, keylen);
    var paw = Buffer(derivedKey, 'binary').toString('hex');

    return paw;
};