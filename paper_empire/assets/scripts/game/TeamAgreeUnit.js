/**
 * Created by ZZTENG on 2017/04/26.
 **/
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
        leader_name: cc.Label,
        _teamId: null
    },

    // use this for initialization
    onLoad: function () {
    },
    setData: function (data) {
        this.leader_name.string = data[0];
        this._teamId = data[1];
    },
    onClick: function (event,id) {
        switch (id){
            case 'agree': {
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_AGREE_JOIN_APPLY,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                    id: this._teamId,
                    type: 2
                };
                NetManager.sendMsg(event1);
            }
                break;
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});