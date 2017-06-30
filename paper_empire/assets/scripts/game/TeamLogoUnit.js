const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils');
var TeamLogoUnit = cc.Class({
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
        logoNode: cc.Node,
        _logoId: null
    },
    onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,1);
        }
        switch (id) {
            case "select": {
                KeyValueManager['selectLogoId'] = this._logoId;
                KeyValueManager['selectLogoNode'].active = true;
                KeyValueManager['selectLogoNode'].parent = this.logoNode.parent;
                KeyValueManager['selectLogoNode'].setPosition(0,0);
            }
            break;
        }
    },
    setData: function (data, index) {
        let self = this;
        this._logoId = data[0];
        cc.loader.loadRes(KeyValueManager['csv_kv']['logo_path']['value'] + data[1],cc.SpriteFrame,function (err,spriteFrame) {
            if(err){
                return ('load fail');
            }
            else {
                self.logoNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                cc.loader.setAutoReleaseRecursively(spriteFrame,true);
            }
        });
    },
    reuse:function () {
    },
    unuse: function () {
    },
    // use this for initialization
    onLoad: function () {
        this.reuse();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});