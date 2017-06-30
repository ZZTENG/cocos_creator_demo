const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
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
        count:cc.Label,
    },
    onClick:function () {
        cc.audioEngine.play(KeyValueManager['click_clip'],false,1);
        let event1 = {
            url:KeyValueManager['server_url'],
            msg_id:C2G_REQ_GAME_MATCH_CANCEL,
            user_id:KeyValueManager['player_data']['user_id'],
            session_key: KeyValueManager['session'],
        };
        NetManager.sendMsg(event1);
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
    },
    // use this for initialization
             onLoad: function () {


                 this.reuse();
             },

             send_match: function () {
                 if(KeyValueManager['game_mode'] || KeyValueManager['game_mode'] == 0) {
                     let event1 = {
                         url: KeyValueManager['server_url'],
                         msg_id: C2G_REQ_GAME_MATCH,
                         user_id: KeyValueManager['player_data']['user_id'],
                         session_key: KeyValueManager['session'],
                         mode: KeyValueManager['game_mode']
                     };
                     NetManager.sendMsg(event1);
                 }
             },
             send_cancel: function () {
                 this.scheduleOnce(this.send_match,1);
                 let event1 = {
                     url:KeyValueManager['server_url'],
                     msg_id:C2G_REQ_GAME_MATCH_CANCEL,
                     user_id:KeyValueManager['player_data']['user_id'],
                     session_key: KeyValueManager['session'],
                 };
                 NetManager.sendMsg(event1);
             },
             reuse:function () {


                 EventManager.registerHandler(G2C_REQ_GET_MATCH_COUNT, this);
                 this.schedule(this.send_cancel,10);
                 if(KeyValueManager['game_mode'] || KeyValueManager['game_mode'] == 0) {
                     let event1 = {
                         url: KeyValueManager['server_url'],
                         msg_id: C2G_REQ_GAME_MATCH,
                         user_id: KeyValueManager['player_data']['user_id'],
                         session_key: KeyValueManager['session'],
                         mode: KeyValueManager['game_mode']
                     };
                     NetManager.sendMsg(event1);
                 }
                 let clip = this.getComponent(cc.Animation);
                 if (clip && clip.defaultClip) {
                     clip.play();
                 }
             },

    onDisable: function () {
                 EventManager.removeHandler(G2C_REQ_GET_MATCH_COUNT, this);
                 this.unschedule(this.send_match);
                 this.unschedule(this.send_cancel);
                 let clip = this.getComponent(cc.Animation);
                 if (clip && clip.currentClip) {
                     clip.stop();
                 }
             },
             processEvent: function (event) {
                 let msg_id = event['msg_id'];
                 switch (msg_id) {
                     case G2C_REQ_GET_MATCH_COUNT:
                     {
                         if (event['result']) {
                             if( KeyValueManager['game_mode'] == GameMode.MODE_1V1 || KeyValueManager['game_mode'] == GameMode.MODE_TEAM)
                             {
                                 this.count.string = event['count']+'/2';
                             }
                             else if( KeyValueManager['game_mode'] == GameMode.MODE_2V2)
                             {
                                 this.count.string = event['count']+'/4';
                             }
                             else if( KeyValueManager['game_mode'] == GameMode.MODE_3V3 || KeyValueManager['game_mode'] == GameMode.MODE_2V2V2
                             || KeyValueManager['game_mode'] == GameMode.MODE_IDENTITY)
                             {
                                 this.count.string = event['count']+'/6';
                             }
                         }
                     }
                     break;
                 }
             },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
