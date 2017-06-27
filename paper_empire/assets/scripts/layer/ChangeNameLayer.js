/**
 * Created by ZZTENG on 2017/03/27.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils');
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
        nameEdit: cc.EditBox,
    },

    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
        this.nameEdit.string = KeyValueManager['player_data']['player_info']['name'];
    },
    unuse: function () {
    },
    onClick:function (event, id) {
        switch (id) {
            case 'sure': {
                KeyValueManager['player_data']['player_info']['name'] = this.nameEdit.string;
                let playerInfo = {'name':KeyValueManager['player_data']['player_info']['name']};
                let event = {
                    url: KeyValueManager['server_url'],
                    msg_id: C2G_REQ_UPDATE_PLAYER,
                    map_id: KeyValueManager['currentLevel'],
                    user_id: KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                    player_info:playerInfo

                };
                NetManager.sendMsg(event);
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
            }
            break;
            case 'cancel': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
            }
                break;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // },
});