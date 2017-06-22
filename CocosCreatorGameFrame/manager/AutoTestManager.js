/**
 * Created by ZZTENG on 2017/06/16.
 **/
const EventManager = require('EventManager');
const tag_test = 'auto_test';
const KeyValueManager = require('KeyValueManager');
const NetManager = require('NetManager');
let AutoTestManager = {
    StartTestModel: function (model) {
        switch (model){
            case Models.Mail: {
                //邮箱查看并领取所有邮件测试
                KeyValueManager['test_model'] = Models.Mail;
                cc.log(tag_test,'model mail test start');
                EventManager.pushEvent({'msg_id': 'mail_open'});
            }
            break;
            case Models.Wish: {
                //许愿池进行抽奖测试
                KeyValueManager['test_model'] = Models.Wish;
                cc.log(tag_test,'model wish test start');
                EventManager.pushEvent({'msg_id': 'wish_open'});
            }
            break;
            case Models.GameLevel: {
                //游戏关卡测试
                KeyValueManager['test_model'] = Models.GameLevel;
                cc.log(tag_test,'model game_level test start');
                EventManager.pushEvent({'msg_id': 'game_level_open'});
            }
            break;
            case Models.GameHeCheng: {

            }
            break;
            case Models.GameFuMo: {

            }
            break;
            case Models.GameUp: {

            }
            break;
            case Models.GameDream: {

            }
            break;
            case Models.Mission: {

            }
            break;
            default: {

            }
        }
    },
    EndTestModel: function (model) {
        switch (model){
            case Models.Mail: {
                //邮件测试正确，关闭邮件
                cc.log(tag_test,'mail test end');
                EventManager.pushEvent({'msg_id': 'mail_end'});
                KeyValueManager['test_model'] = Models.Wish;
            }
                break;
            case Models.Wish: {
                //许愿池测试正确，关闭许愿池
                cc.log(tag_test,'wish test end');
                EventManager.pushEvent({'msg_id': 'wish_end'});
                KeyValueManager['test_model'] = Models.GameLevel;
            }
                break;
            case Models.GameLevel: {
                //游戏关卡测试正确，关闭游戏关卡
                cc.log(tag_test,'wish test end');
                EventManager.pushEvent({'msg_id': 'game_level_end'});
            }
                break;
            case Models.GameHeCheng: {

            }
                break;
            case Models.GameFuMo: {

            }
                break;
            case Models.GameUp: {

            }
                break;
            case Models.GameDream: {

            }
                break;
            case Models.Mission: {

            }
                break;
            default: {

            }
        }
    },
    CheckTestModel: function (model) {
        switch (model){                     //目前check这块搞了个统一接口，以后细分的话，可以单独处理
            case Models.Mail: {
                //核查邮箱数据
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_TEST_GET_DATA,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key:KeyValueManager['session'],
                };
                NetManager.sendMsg(event1);
            }
                break;
            case Models.Wish: {
                //核查许愿池数据
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_TEST_GET_DATA,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key:KeyValueManager['session'],
                };
                NetManager.sendMsg(event1);
                // EventManager.pushEvent({'msg_id': 'wish_check'});
            }
                break;
            case Models.GameLevel: {
                //核查游戏关卡数据
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_TEST_GET_DATA,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key:KeyValueManager['session'],
                };
                NetManager.sendMsg(event1);
                // EventManager.pushEvent({'msg_id': 'game_level_check'});
            }
                break;
            case Models.GameHeCheng: {

            }
                break;
            case Models.GameFuMo: {

            }
                break;
            case Models.GameUp: {

            }
                break;
            case Models.GameDream: {

            }
                break;
            case Models.Mission: {

            }
                break;
            default: {

            }
        }
    },


};
module.exports = AutoTestManager;