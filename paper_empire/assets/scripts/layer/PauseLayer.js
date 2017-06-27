/**
 * Created by ZZTENG on 2017/03/16.
 **/
const EventManager = require('EventManager');
const KeyValueManager = require('KeyValueManager');
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
        volume_label: require('LabelLocalized'),
        music_label: require('LabelLocalized')
    },

    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_EXIT_GAME,this);
        let clip = this.getComponent(cc.Animation);
        let volume = cc.audioEngine.getVolume(KeyValueManager['audioId']);
        if(volume == 1) {
            this.music_label.string = '音乐开';
        }
        else if(volume == 0) {
            this.music_label.string = '音乐关';
        }
        if(cc.audioEngine.getEffectsVolume() == 1){
            this.volume_label.string = '音效开';
        }
        else {
            this.volume_label.string = '音效关';
        }

        if (clip && clip.defaultClip) {
            clip.play();
        }
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_EXIT_GAME,this);
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.currentClip) {
            clip.stop();
        }
    },
    processEvent: function () {

    },
    onClick:function (event, id) {
        switch (id) {
            case "close": {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
            }
            break;
            case "music": {
                let volume = cc.audioEngine.getVolume(KeyValueManager['audioId']);
                if(volume == 1) {
                    this.music_label.string = '音乐关';
                    cc.audioEngine.setVolume(KeyValueManager['audioId'],0)
                }
                if(volume == 0) {
                    this.music_label.string = '音乐开';
                    cc.audioEngine.setVolume(KeyValueManager['audioId'],1)
                }
            }
            break;
            case "volume": {
                cc.log(cc.audioEngine.getEffectsVolume());
                if(cc.audioEngine.getEffectsVolume() == 0){
                    this.volume_label.string = '音效开';
                    cc.audioEngine.setEffectsVolume(1);
                }
                else {
                    this.volume_label.string = '音效关';
                    cc.audioEngine.setEffectsVolume(0);
                }
            }
            break;
            case "exit" : {
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
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});