/**
 * Created by ZZTENG on 2017/04/25.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
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
        music_open: cc.Node,
        music_close: cc.Node,
        music_label: cc.Label,
        volume_open: cc.Node,
        volume_close: cc.Node,
        volume_label: cc.Label
    },
    onClick: function (event,id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,1);
        }
      switch (id) {
          case 'close': {
              EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
          }
          break;
          case 'music': {
              let volume = cc.audioEngine.getVolume(KeyValueManager['audioId_bgm']);
              if(volume == 1) {
                  this.music_open.active = false;
                  this.music_close.active = true;
                  this.music_label.string = '音乐关';
                  cc.audioEngine.setVolume(KeyValueManager['audioId_bgm'],0);
              }
              if(volume == 0) {
                  this.music_open.active = true;
                  this.music_close.active = false;
                  this.music_label.string = '音乐开';
                  cc.audioEngine.setVolume(KeyValueManager['audioId_bgm'],1);
              }
          }
          break;
          case 'volume': {
              cc.log(cc.audioEngine.getEffectsVolume());
              if(cc.audioEngine.getEffectsVolume() == 0){
                  this.volume_open.active = true
                  this.volume_close.active = false;
                  this.volume_label.string = '音效开';
                  cc.audioEngine.setEffectsVolume(1);
              }
              else {
                  this.volume_open.active = false
                  this.volume_close.active = true;
                  this.volume_label.string = '音效关';
                  cc.audioEngine.setEffectsVolume(0);
              }
          }
          break;
          case 'exit': {
              EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'exit_game_layer', 'hide_preLayer': false});
          }
      }
    },
    // use this for initialization
    onLoad: function () {
        this.music_open.active = true;
        this.music_close.active = false;
        this.volume_open.active = true;
        this.volume_close.active = false;
        this.reuse();
    },
    reuse: function () {
        let volume = cc.audioEngine.getVolume(KeyValueManager['audioId_bgm']);
        if(volume == 0) {
            this.music_open.active = false;
            this.music_close.active = true;
            this.music_label.string = '音乐关';
        }
        else if(volume == 1) {
            this.music_open.active = true;
            this.music_close.active = false;
            this.music_label.string = '音乐开';
        }
        if(cc.audioEngine.getEffectsVolume() == 1){
            this.volume_open.active = true
            this.volume_close.active = false;
            this.volume_label.string = '音效开';
        }
        else {
            this.volume_open.active = false
            this.volume_close.active = true;
            this.volume_label.string = '音效关';
        }
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip) {
            clip.play();
        }
    },
    onDisable: function () {
        let clip = this.getComponent(cc.Animation);
        if (clip) {
            clip.stop();
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});