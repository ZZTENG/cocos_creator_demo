/**
 * Created by ZZTENG on 2017/03/23.
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
        head: [cc.Sprite],
        memberName: [cc.Label],
        winPic: [cc.Node],
        _data: null,
        _index: null,
        _gameId: null,
    },
    onClick: function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case 'watch': {
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_WATCH_HISTORY,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                    start: 0,
                    end: 1,
                    id: this._gameId
                };
                KeyValueManager['gameId'] = this._gameId;
                NetManager.sendMsg(event1);
            }
            break;
        }
    },
    setData: function (data, index) {
        this._data = data;      //[id,index,[[[playerId,mingzi,touxiang],[mingzi,touxiang]],[[mingzi,touxiang]]] ]
        this._index = index;
        let number = 0;
        this._gameId = data[0];
        for(let i = 0;i < data[2].length;i += 1){
            if(i == data[1]){
                this.winPic[i].active = true;
            }
            else {
                this.winPic[i].active = false;
            }
            for(let j = 0;j < data[2][i].length;j += 1){
                if(KeyValueManager['record_mode'] == RecordMode.MODE_1V1 || KeyValueManager['record_mode'] == RecordMode.MODE_TEAM){
                    this.memberName[i].string = data[2][i][j][0];
                }
                let self = this;
                cc.loader.loadRes(data[2][i][j][1], function (err, tex) {
                    if(err){
                        cc.log(err);
                    }
                    else {
                        number = i + j;
                        let frame = new cc.SpriteFrame(tex);
                        self.head[number].spriteFrame = frame;
                        cc.loader.setAutoReleaseRecursively(
                            KeyValueManager['csv_kv']['spr_path']['value'] + data[2][i][j][1], true);
                    }
                });
            }
        }
    },
    // use this for initialization
    onLoad: function () {
    },
    onEnable: function () {

    },
    onDisable: function () {
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});