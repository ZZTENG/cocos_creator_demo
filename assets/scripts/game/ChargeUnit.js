/**
 * Created by ZZTENG on 2017/04/12.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils');
let descrip_name = {
    '0': '一棒宝石',
    '1': '一小堆宝石',
    '2': '一小袋宝石',
    '3': '一麻袋宝石',
    '4': '一小箱宝石',
    '5': '一大箱宝石',
}
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
        rmb: cc.Label,
        coin: cc.Label,
        ico: cc.Sprite,
        description: cc.Label,
        _storeId: null,
        _rmb: null,
        _coin: null,
        _subject: null,
    },

    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
    },
    onDestroy: function () {
      this.unuse();
    },
    unuse: function () {
    },
    setData: function (data,index) {
        let self = this;
        this._storeId = data[0];
        this.coin.string = data[1][0][3];
        this._coin = data[1][0][3];
        this.rmb.string = data[2] / 100 + '元';
        this._rmb = data[2];
        this._subject = data[3];
        cc.loader.loadRes(data[4],cc.SpriteFrame,function (err,spriteFrame) {
            if(err){
                cc.log('load fail');
            }
            else {
                self.ico.spriteFrame = spriteFrame;
                cc.loader.setAutoReleaseRecursively(spriteFrame,true);
            }
        })
        this.description.string = descrip_name[index];
    },
    onClick: function (event,id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id){
          case 'charge': {
              if(KeyValueManager['platformLogin']) {
                  KeyValueManager['subject'] = this._subject;
                  KeyValueManager['dingdan_coin'] = this._coin;
                  KeyValueManager['dingdan_rmb'] = this._rmb;
                  KeyValueManager['storeId'] = this._storeId;
                  let event1 = {
                      url:KeyValueManager['server_url'],
                      msg_id:C2G_REQ_CHARGE,
                      user_id:KeyValueManager['player_data']['user_id'],
                      session_key: KeyValueManager['session'],
                      item_id: this._storeId
                  };
                  NetManager.sendMsg(event1);
              }
              else{
                  let event1 = {
                      url:KeyValueManager['server_url'],
                      msg_id:C2G_REQ_ADD_COIN,
                      user_id:KeyValueManager['player_data']['user_id'],
                      session_key: KeyValueManager['session'],
                      count: this._coin
                  };
                  Utils.addItem(CURRENCY_PACKAGE,COIN_ID,'count',this._coin);
                  NetManager.sendMsg(event1);
              }
          }
          break;
      }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});