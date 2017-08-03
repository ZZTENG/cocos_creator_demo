/**
 * Created by ZZTENG on 2017/08/03.
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

    // use this for initialization
    onEnable: function () {
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip) {
            clip.play();
        }
    },
    onClick: function (event ,id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id){
            case 'close':{
                let clip = this.getComponent(cc.Animation);
                let clips = clip.getClips();
                if (clips && clips[1]) {
                    KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
                }
                KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
            }
            break;
        }
    },
    onDisable: function () {
        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }
    },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});