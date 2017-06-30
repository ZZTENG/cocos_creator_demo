/**
 * Created by ZZTENG on 2017/04/11.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
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
        price: cc.Label,
        _price: null
    },
    onClick: function (event,id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,1);
        }
      switch (id){
          case 'return': {
              EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
          }
          break;
          case 'reduce': {
              if(this._price > 0){
                  this._price -= 1;
                  this.price.string = this._price;
              }
          }
          break;
          case 'add': {
              this._price += 1;
              this.price.string = this._price;
          }
          break;
          case 'chongzhi': {
              EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
              EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'dingdan_layer','hide_preLayer': false});
          }
          break;
      }
    },
    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
      this._price = 0;
      this.price.string = this._price;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});