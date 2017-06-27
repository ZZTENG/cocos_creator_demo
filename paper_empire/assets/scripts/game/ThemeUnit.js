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
        __themeId: null,
        themeSprite: cc.Sprite,
        themeName: cc.Label,
        themeCount: cc.Label
    },
    onClick:function (event, id) {
        switch (id) {
            case "select": {
                KeyValueManager['selectThemeNode'].active = true;
                KeyValueManager['selectThemeNode'].parent = this.themeSprite.node.parent;
                KeyValueManager['selectThemeNode'].setPosition(0,0);
                KeyValueManager['selectThemeId'] = this._themeId;
            }
            break;
        }
    },
    setData: function (data, index) {
        let self = this;
        this._themeId = data[0];
        if(KeyValueManager['csv_kv']['default_theme']['value'] == this._themeId){
            this.themeCount.string = '可以使用无限次';
        }
        else {
            this.themeCount.string = '可以使用' + data[1] + '次';
        }
        this.themeName.string = ThemeName[this._themeId];
        let theme = KeyValueManager['csv_theme'][this._themeId]['Theme'];
        cc.loader.loadRes(KeyValueManager['csv_kv']['person_theme_path']['value'] + theme,cc.SpriteFrame,function (err,spriteFrame) {
            if(err){
                cc.log(err);
            }
            else {
                self.themeSprite.spriteFrame = spriteFrame;
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