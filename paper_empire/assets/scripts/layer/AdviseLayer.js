const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils')
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
                 inputName: cc.EditBox,

             },
             onClick:function (event, id) {
                 if(id){
                     cc.audioEngine.play(KeyValueManager['click_clip'],false,1);
                 }
                 switch (id) {
                     case "create": {

                         let event1 = {
                             url: KeyValueManager['server_url'],
                             msg_id: C2G_REQ_INVITE_JOIN,
                             user_id: KeyValueManager['player_data']['user_id'],
                             id: parseInt(this.inputName.string),
                             session_key: KeyValueManager['session'],
                         };
                         NetManager.sendMsg(event1);

                         //
                     }
                         break;
                     case "return": {
                         EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                     }
                         break;
                 }


             },
             reuse:function () {
                 EventManager.registerHandler(C2G_REQ_INVITE_JOIN, this);
                 let clip = this.getComponent(cc.Animation);
                 if (clip && clip.defaultClip) {
                     clip.play();
                 }
             },
    onDisable: function () {
                 EventManager.removeHandler(C2G_REQ_INVITE_JOIN, this);
                 let clip = this.getComponent(cc.Animation);
                 if (clip && clip.currentClip) {
                     clip.stop();
                 }
             },
             processEvent: function (event) {
                 let msg_id = event['msg_id'];
                 switch (msg_id) {
                         case C2G_REQ_INVITE_JOIN: {
                         if (event['result']) {
                             EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                             KeyValueManager['msg_text'] ='已发送邀请，请等待回复';
                             EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});

                         }
                         else {
                             if(event['error_code'] == 91003){
                                 KeyValueManager['msg_text'] = '不存在此人';
                                 EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                             }
                             else if(event['error_code'] == 91009){
                                 KeyValueManager['msg_text'] = '对方不在线, 无法邀请';
                                 EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                             }
                             else if(event['error_code'] == 91008){
                                 KeyValueManager['msg_text'] = '该玩家已经在队伍内';
                                 EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                             }
                         }

                     }
                         break;
                 }
             },
             // use this for initialization
             onLoad: function () {
                 this.reuse();
             },

             // called every frame, uncomment this function to activate update callback
             // update: function (dt) {

             // },
         });
