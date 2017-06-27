const EventManager = require('EventManager');
const NetManager = require('NetManager');
const KeyValueManager = require('KeyValueManager');
cc.Class({
             extends: cc.Component,

             properties: {
                 // foo: {
                 //    default: null,      // The default value will be used only when the component attaching
                 //                           to a node for the first time
                 //    url: cc.Texture2D,  // optional, default is typeof default
                 //    serializable: true, // optional, default is true
                 //    visible: true,      // optional, default is true
                 //    displayName: 'Foo', // optional
                 //    readonly: false,    // optional, default is false
                 // },
                 // ...
                 _heartTime: null,
                 _suspendTime: null,
                 _reloginTime: null,
             },

             // use this for initialization
             onLoad: function () {
                 this._heartTime = NetManager.getCurrentTime();
                 this._suspendTime = NetManager.getCurrentTime();
                 this._reloginTime = NetManager.getCurrentTime();
             },
             update: function (dt) {
                 EventManager.processEvent();
                 //心跳检测
                 if(KeyValueManager['currentScene'] == CurrentScene.SCENE_OPENGING || KeyValueManager['currentScene'] == CurrentScene.SCENE_LOIN)
                    return;
                 let time = NetManager.getCurrentTime();
                 if(KeyValueManager['currentScene'] == CurrentScene.SCENE_GAME) {
                     if (time - this._suspendTime > SUSPEND_TIME) {          //游戏中，短时间脚本挂起，数据更新
                         let event = {
                             url: KeyValueManager['server_url'] ,
                             msg_id: C2G_REQ_SYNC_CHANGE,
                             user_id: KeyValueManager['player_data']['user_id'],
                             session_key: KeyValueManager['session'],
                         };
                         NetManager.sendMsg(event);
                         cc.log('woo');
                     }
                 }
                 this._suspendTime = time;
                 if(time - this._heartTime > HEARTBEAT_LAST_TIME){
                     this._heartTime += HEARTBEAT_LAST_TIME;
                     let event1 = {
                         url:KeyValueManager['server_url'],
                         msg_id:C2G_REQ_HEARTBEAT ,
                         user_id:KeyValueManager['player_data']['user_id'],
                         session_key: KeyValueManager['session'],
                     };
                     NetManager.sendMsg(event1);
                 }
                 if(time - this._reloginTime > SUSPEND_LOGIN_TIME){
                     KeyValueManager['EncryptKey'] = 'De262tmqLW5w1zONwg6ajl63UJ7';
                     KeyValueManager['currentScene'] = CurrentScene.SCENE_OPENGING;
                     cc.director.preloadScene('openning',function (error, asset) {
                         cc.director.loadScene('openning');
                     });
                 }
                 this._reloginTime = time;
             },
             // called every frame, uncomment this function to activate update callback
             // update: function (dt) {

             // },
         });
