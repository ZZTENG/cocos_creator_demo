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
        rank_head: cc.Sprite,
        duanWei: [cc.SpriteFrame],
        star: [cc.Sprite]
    },

    // use this for initialization
    onLoad: function () {

    },
    onEnable: function () {
        EventManager.registerHandler(C2G_REQ_ADD_COIN,this);
        EventManager.registerHandler('update_coin',this);

        let self = this;
        this.coin_label.string = Utils.getItem(CURRENCY_PACKAGE,COIN_ID,'count');
        this.diamond_label.string = Utils.getItem(CURRENCY_PACKAGE,GOLD_ID,'count');
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
        if(KeyValueManager['player_data']['player_info']['w']){     //可以用配置表,暂定在代码里面
            let grade = KeyValueManager['player_data']['player_info']['w'];
            if(grade < 500){
                this.rank_head.spriteFrame = this.duanWei[0];
                if(grade < 100){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 300){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 500){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
            }
            else if(grade < 1300){
                this.rank_head.spriteFrame = this.duanWei[1];
                if(grade < 1100){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 1200){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 1300){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
            }
            else if(grade < 2100){
                this.rank_head.spriteFrame = this.duanWei[2];
                if(grade < 1500){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 1800){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 2100){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
            }
            else if(grade < 3000){
                this.rank_head.spriteFrame = this.duanWei[3];
                if(grade < 2300){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 2700){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 3000){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
            }
            else if(grade < 5000){
                this.rank_head.spriteFrame = this.duanWei[4];
                if(grade < 3500){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 4000){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 5000){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
            }
            else {
                this.rank_head.spriteFrame = this.duanWei[5];
                if(grade < 7000){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else if(grade < 10000){
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
                else {
                    this.star[0].node.active = true;
                    this.star[1].node.active = false;
                    this.star[2].node.active = false;
                }
            }
        }

        //update coin
        EventManager.pushEvent({'msg_id': 'update_coin'});
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_ADD_COIN,this);
        EventManager.removeHandler('update_coin',this);
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
            case 'buy_diamond': {
                KeyValueManager['pay_type'] = PayType.RMB;
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'chongzhi_coin_layer','hide_preLayer': false});
            }
                break;
            case 'buy_coin': {
                KeyValueManager['pay_type'] = PayType.DiamondToCoin;
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'chongzhi_2_layer','hide_preLayer': false});
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
                    this.diamond_label.string = Utils.getItem(CURRENCY_PACKAGE, GOLD_ID, 'count');
                }
            }
                break;
            case 'update_coin': {
                this.coin_label.string = Utils.getItem(CURRENCY_PACKAGE, COIN_ID, 'count');
                this.diamond_label.string = Utils.getItem(CURRENCY_PACKAGE,GOLD_ID,'count');
            }
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});