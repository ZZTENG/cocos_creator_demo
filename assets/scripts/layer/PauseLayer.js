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
        let volume = cc.audioEngine.getVolume(KeyValueManager['audioId_bgm']);
        if(volume == 1) {
            this.music_label.string = '音乐开';
        }
        else if(volume == 0) {
            this.music_label.string = '音乐关';
        }
        if(KeyValueManager['effect_volume'] == 1){
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
        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }
    },
    processEvent: function () {

    },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
    onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case "close": {
                let clip = this.getComponent(cc.Animation);
                let clips = clip.getClips();
                if (clips && clips[1]) {
                    KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
                }
                KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
            }
            break;
            case "music": {
                let volume = cc.audioEngine.getVolume(KeyValueManager['audioId_bgm']);
                if(volume == 1) {
                    this.music_label.string = '音乐关';
                    cc.audioEngine.setVolume(KeyValueManager['audioId_bgm'],0)
                }
                if(volume == 0) {
                    this.music_label.string = '音乐开';
                    cc.audioEngine.setVolume(KeyValueManager['audioId_bgm'],1)
                }
            }
            break;
            case "volume": {
                if(KeyValueManager['effect_volume'] == 0.0000001){
                    this.volume_label.string = '音效开';
                    KeyValueManager['effect_volume'] = 1;
                }
                else {
                    this.volume_label.string = '音效关';
                    KeyValueManager['effect_volume'] = 0.0000001;
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