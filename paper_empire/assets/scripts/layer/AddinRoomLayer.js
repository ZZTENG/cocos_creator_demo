/**
 * Created by ZZTENG on 2017/03/28.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils');
const i18n = require('i18n');
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
        number: [cc.Label],
        numberData: null

    },
    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_ENTER_GAME_ROOM, this);
        this.numberData = [];
        for(let i = 0;i < this.number.length;i += 1)
            this.number[i].node.active = false;
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip) {
            clip.play();
        }
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_ENTER_GAME_ROOM, this);

        let clip = this.getComponent(cc.Animation);
        if (clip && clip.currentClip) {
            clip.stop();
        }
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id){
            case C2G_REQ_ENTER_GAME_ROOM: {
                if(event['result']){
                    EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'custom_layer', 'hide_preLayer':false});
                    KeyValueManager['customData'] = {};
                    KeyValueManager['customData'] = event['data'];
                    KeyValueManager['roomId'] = event['room_id'];
                    KeyValueManager['camp'] = event['camp'];
                }
                else {
                    cc.log('not enter room')
                }
            }
            break;
        }
    },
    setNumberData: function () {
        for(let i = 0;i < this.number.length;i += 1){
            if(i < this.numberData.length) {
                this.number[i].node.active = true;
                this.number[i].string = this.numberData[i];
            }
            else
                this.number[i].node.active = false;
        }
        if(this.numberData.length == 6){
            let room_id = parseInt(this.numberData.join(''));
            let event1 = {
                url:KeyValueManager['server_url'],
                msg_id:C2G_REQ_ENTER_GAME_ROOM,
                user_id:KeyValueManager['player_data']['user_id'],
                session_key: KeyValueManager['session'],
                room_id: room_id
            };
            NetManager.sendMsg(event1);
        }
    },
    onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case '1' : {
                if(this.numberData.length < 6) {
                    this.numberData.push(1);
                    this.setNumberData();
                }
            }
            break;
            case '2' : {
                if(this.numberData.length < 6)
                    this.numberData.push(2);
                this.setNumberData();
            }
            break;
            case '3' : {
                if(this.numberData.length < 6)
                    this.numberData.push(3);
                this.setNumberData();
            }
            break;
            case '4' : {
                if(this.numberData.length < 6)
                    this.numberData.push(4);
                this.setNumberData();
            }
            break;
            case '5' : {
                if(this.numberData.length < 6)
                    this.numberData.push(5);
                this.setNumberData();
            }
            break;
            case '6' : {
                if(this.numberData.length < 6)
                    this.numberData.push(6);
                this.setNumberData();
            }
            break;
            case '7' : {
                if(this.numberData.length < 6)
                    this.numberData.push(7);
                this.setNumberData();
            }
            break;
            case '8' : {
                if(this.numberData.length < 6)
                    this.numberData.push(8);
                this.setNumberData();
            }
            break;
            case '9' : {
                if(this.numberData.length < 6)
                    this.numberData.push(9);
                this.setNumberData();
            }
            break;
            case '0' : {
                if(this.numberData.length < 6)
                    this.numberData.push(0);
                this.setNumberData();
            }
            break;
            case 'delete' : {
                this.numberData.pop();
                this.setNumberData()
            }
            break;
            case 'reenter' : {
                this.numberData = [];
                this.setNumberData();
            }
            break;
            case 'return': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
            }
            break;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});