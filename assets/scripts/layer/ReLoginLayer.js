/**
 * Created by ZZTENG on 2017/07/26.
 **/
const KeyValueManager = require('KeyValueManager');
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
    onLoad: function () {

    },
    onclick: function () {
        cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        KeyValueManager['EncryptKey'] = 'De262tmqLW5w1zONwg6ajl63UJ7';
        KeyValueManager['currentScene'] = CurrentScene.SCENE_OPENGING;
        cc.director.preloadScene('openning',function (error, asset) {
            cc.director.loadScene('openning');
        });

    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});