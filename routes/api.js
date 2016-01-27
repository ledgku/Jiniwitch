var indexCtrl = require('../controllers/indexCtrl');
var userCtrl = require('../controllers/userCtrl');
var groupCtrl = require('../controllers/groupCtrl');
var hwCtrl = require('../controllers/hwCtrl');
var historyCtrl = require('../controllers/historyCtrl');

exports.initApp = function(app){
    /***** index (for test) *****/
    // if you connect '/', Gini response your request.
    app.route('/')
        .post(indexCtrl.greeting);

    /***** userCtrl *****/
    // join : go to join of '/controllers/userCtrl'
    // parameters : email, password, nickname
    app.route('/jini/user/join')
        .post(userCtrl.join);
    // login : go to login of '/controllers/userCtrl'
    // parameters : email, password
    app.route('/jini/user/login')
        .post(userCtrl.login);
    // logout :
    // parameters : none (session check)
    // 1. check login session.
    // 2. if login session is exist, go to logout of '/controllers/userCtrl'
    // 3. Login session is not exist, return fail message.
    app.route('/jini/user/logout')
        .get(userCtrl.loginCheck, userCtrl.logout);

    /***** groupCtrl *****/
    // show group list, add new group, delete group
    // required : login session
    app.route('/jini/group')
        // show group list :
        // parameters : none (session check)
        // 1. check login session.
        // 2. if login session is exist, go to logout of '/controllers/groupCtrl'
        // 3. Login session is not exist, return fail message.
        .get(userCtrl.loginCheck, groupCtrl.list)
        // add new group :
        // parameters : users(list), group_name
        .post(userCtrl.loginCheck, groupCtrl.add)
        // delete group :
        // parameters : group_id
        // 1. check login session.
        // 2. if login session is exist, group manager check
        // 3. if you are manager of group_id. go to delete of '/controllers/groupCtrl'
        // 3. Else, return fail message.
        .delete(userCtrl.loginCheck, groupCtrl.managerCheck, groupCtrl.delete);

    /***** hwCtrl *****/
    // add new switch, delete switch, show switch list, show switch info, turn on, turn off
    // required : login session, manager or member permission
    app.route('/jini/hw')
        // add new switch
        // parameters :  group_id, name, product_no, password, ip, port
        // 1. check login session
        // 2. check user is manager of group_id(only manager of group can add the switch)
        // 3. If check fail, return fail message
        // 4. Else, go to add of '/controllers/hwCtrl'
        .post(userCtrl.loginCheck, groupCtrl.managerCheck, hwCtrl.add)
        // delete switch
        // parameters : hw_id, password, group_id
        .delete(userCtrl.loginCheck, groupCtrl.managerCheck, hwCtrl.delete);
    // show switch list
    // parameters : group_id
    // 1. check login session
    // 2. check user is member of group_id
    // 3. If check fail, return fail message
    // 4. Else, go to add of '/controllers/hwCtrl'
    app.route('/jini/hw/list')
        .post(userCtrl.loginCheck, groupCtrl.memberCheck, hwCtrl.list);
    // show switch info
    // parameters : group_id, hw_id
    app.route('/jini/hw/info')
        .post(userCtrl.loginCheck, groupCtrl.memberCheck, hwCtrl.info);
    // turn on the switch
    // parameters : group_id, hw_id
    app.route('/jini/hw/on')
        .post(userCtrl.loginCheck, groupCtrl.memberCheck, hwCtrl.on);
    // turn off the switch
    // parameters : group_id, hw_id
    app.route('/jini/hw/off')
        .post(userCtrl.loginCheck, groupCtrl.memberCheck, hwCtrl.off);

    /***** historyCtrl *****/
    // show switch on/off history
    // parameters : hw_id
    app.route('/jini/history')
        .get(userCtrl.loginCheck, historyCtrl.list);
};