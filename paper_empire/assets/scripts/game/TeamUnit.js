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
        head: cc.Sprite,
        memberName: cc.Label,
        winRate: cc.Label,
        battleCount: cc.Label,
        level: cc.Sprite,
        memberCount: cc.Label,
        _index: 0,
        _data:null,
        _team_id:0,
    },
    onClick: function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,1);
        }
        switch (id) {
            case "request": {
                if(!KeyValueManager['player_data']['player_info']['team'])
                {
                    let event1 = {
                        url:KeyValueManager['server_url'],
                        msg_id:C2G_REQ_APPLY_JOIN_TEAM,
                        user_id:KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        id:this._team_id
                    };
                    NetManager.sendMsg(event1);

                }
                else
                {

                }

            }
                break;
        }
    },
     setData: function (data, index) {

         this._data = data;
         this._team_id = data[0];
         this._index = index;
         this.winRate.string = data[2] + ' %';
         this.battleCount.string = data[3];
         this.memberCount.string = data[4] + '/3';
         this.memberName.string = data[6];
         let self = this;
         // cc.loader.loadRes(KeyValueManager['csv_kv']['spr_path']['value'] + data[5], cc.SpriteFrame,
         //                   function (err, spriteFrame) {
         //                       self.head.spriteFrame = spriteFrame;
         //                       cc.loader.setAutoReleaseRecursively(
         //                           KeyValueManager['csv_kv']['spr_path']['value'] + data[7], true);
         //                   });
     },
     // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
