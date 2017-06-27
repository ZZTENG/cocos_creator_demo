/**
 * Created by ZZTENG on 2017/03/28.
 **/
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
    },
    onClick:function (event, id) {
        switch (id) {
            case 'create':{
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_ENTER_GAME_ROOM,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                };
                NetManager.sendMsg(event1);
            }
            break;
            case 'enter': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'addin_room_layer', 'hide_preLayer':false});
            }
            break;
            case 'return': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
            }
        }
    },
    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_ENTER_GAME_ROOM, this);
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip) {
            clip.play();
        }
    },

    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_ENTER_GAME_ROOM, this);
        let clip = this.getComponent(cc.Animation);
        if (clip) {
            clip.stop();
        }
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id){
            case C2G_REQ_ENTER_GAME_ROOM:{
                if(event['result']){
                    EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'custom_layer', 'hide_preLayer':false});
                    KeyValueManager['customData'] = {};
                    KeyValueManager['customData'] = event['data'];
                    KeyValueManager['roomId'] = event['room_id'];
                    KeyValueManager['camp'] = event['camp'];
                }
                else {
                    cc.log('not create room');
                }
            }
            break;
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});