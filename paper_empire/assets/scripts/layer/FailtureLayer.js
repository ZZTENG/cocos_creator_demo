/**
 * Created by ZZTENG on 2017/06/30.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
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
    },
    onClick: function (event,id) {
      if(id){
          cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
      }
      switch (id){
          case 'watch': {
              EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
          }
          break;
      }
    },
    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});