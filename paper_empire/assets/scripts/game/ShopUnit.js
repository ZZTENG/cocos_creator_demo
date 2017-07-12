/**
 * Created by ZZTENG on 2017/03/01.
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
        theme: cc.Sprite,
        themeName: cc.Label,
        discount: cc.Label,
        price: cc.Label,
        useCount: cc.Label,
        storeId: null,
        _price: null,
        _themeId: null,
        _useCount: null,
        _itemId: null
    },

    // use this for initialization
    onLoad: function () {
    },
    onEnable: function () {
    },
    onDisable: function () {
    },
    setData: function (data,index) {
        this.storeId = data[0];
        this._themeId = data[1][0][1];
        this._useCount = data[1][0][3];
        this.useCount.string = '使用' + data[1][0][3] + '次';
        this.price.string = data[3][0][3];
        this._price = data[3][0][3];
        this._itemId = data[3][0][2];
        let discount = String(parseInt(data[3][0][3] / data[2][0][3] * 100)) + '%';
        this.discount.string = discount;
        let self = this;
        cc.loader.loadRes(KeyValueManager['csv_kv']['shop_theme_path']['value'] + data[4],cc.SpriteFrame,function (err,spriteFrame) {
            if(err){
                cc.log(err);
            }
            else {
                self.theme.spriteFrame = spriteFrame;
                cc.loader.setAutoReleaseRecursively(spriteFrame,true);
            }
        });
        this.themeName.string = data[5];
    },
    onClick: function (event,id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id){
            case 'buy': {
                let coins = Utils.getItem(CURRENCY_PACKAGE,this._itemId,'count');
                if(coins >= this._price) {
                    KeyValueManager['buy_price'] = this._price;
                    KeyValueManager['buy_themeId'] = this._themeId;
                    KeyValueManager['buy_useCount'] = this._useCount;
                    KeyValueManager['buy_itemId'] = this._itemId;
                    let event1 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_BUY_STORE_ITEM,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        store_item_id: this.storeId
                    };
                    NetManager.sendMsg(event1);
                }
                else {
                    EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'chongzhi_coin_layer','hide_preLayer': false});
                    if(this._itemId == COIN_ID){
                        KeyValueManager['msg_text'] ='金币不足，请充值';
                    }
                    else if(this._itemId == GOLD_ID){
                        KeyValueManager['msg_text'] ='砖石不足，请充值';
                    }
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});