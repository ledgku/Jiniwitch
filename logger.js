var winston = require('winston');
var moment = require('moment');

var logger = new winston.Logger({
    transports : [
        new winston.transports.Console({
            level:'info',
            colorize: true,
            timestamp: function(){
                return moment.utc().format();
            },
            json: true,
            prettyPrint: true
        })
    ]
});

module.exports = logger;