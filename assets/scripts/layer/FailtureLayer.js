/**
 * Created by ZZTENG on 2017/06/30.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
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
    },
    onClick: function (event,id) {
      if(id){
          cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
      }
      switch (id){
          case 'watch': {
              let clip = this.getComponent(cc.Animation);
              let clips = clip.getClips();
              if (clips && clips[1]) {
                  KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
              }
              KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
          }
          break;
          case 'cancel': {
              let event1 = {
                  url:KeyValueManager['server_url'],
                  msg_id:C2G_REQ_EXIT_GAME,
                  user_id:KeyValueManager['player_data']['user_id'],
                  session_key: KeyValueManager['session'],
              };
              NetManager.sendMsg(event1);
              Utils.enterMainScene();
              cc.director.loadScene('loading');
          }
          break;
      }
    },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
    onDisable: function () {
        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }
    },
    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});