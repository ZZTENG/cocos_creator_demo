/**
 * Created by ZZTENG on 2017/07/10.
 **/
const EventManager = require('EventManager');
const KeyValueManager = require('KeyValueManager');
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
        head_sprite: cc.Sprite,
        name_label: cc.Label,
        diamond_label: cc.Label,
        coin_label: cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },
    onEnable: function () {
        EventManager.registerHandler(C2G_REQ_ADD_COIN,this);
        EventManager.registerHandler('update_coin',this);

        let self = this;
        this.coin_label.string = Utils.getItem(CURRENCY_PACKAGE,COIN_ID,'count');
        // this.diamond_label.string = Utils.getItem(CURRENCY_PACKAGE,GOLD_ID,'count');
        if(KeyValueManager['platformLogin']) {
            cc.loader.load(KeyValueManager['player_data']['player_info']['head'], function (err, tex) {
                if(err){
                    cc.log(err);
                }
                else {
                    let frame = new cc.SpriteFrame(tex);
                    self.head_sprite.spriteFrame = frame;
                    cc.loader.setAutoReleaseRecursively(frame,true);
                }
            });
        }
        this.name_label.string = KeyValueManager['player_data']['player_info']['name'];
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_ADD_COIN,this);
    },
    onClick: function (event,id) {
        if(id){
            let id = cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
            cc.log(id);
        }
        switch (id){
            case "name":
            {
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'player_info_layer','hide_preLayer': false});
            }
                break;
            case 'buy': {
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'chongzhi_coin_layer','hide_preLayer': false});
            }
                break;
        }
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id) {
            case C2G_REQ_ADD_COIN: {
                if (event['result']) {
                    KeyValueManager['msg_text'] = '充值成功';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer': false});
                    this.coin_label.string = Utils.getItem(CURRENCY_PACKAGE, COIN_ID, 'count');
                }
            }
                break;
            case 'update_coin': {
                this.coin_label.string = Utils.getItem(CURRENCY_PACKAGE, COIN_ID, 'count');
            }
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});