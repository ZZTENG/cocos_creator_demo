/**
 * Created by ZZTENG on 2017/03/01.
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
        themeName: cc.Label,
        discount: cc.Label,
        price: cc.Label,
        useCount: cc.Label,
        week_theme_bg: cc.Sprite,
    },

    // use this for initialization
    onLoad: function () {

    },
    setData: function (data,index) {
        let self = this;
        let themeId = data[0][1];
        let useCount = data[0][3];
        this._price = data[2][3];
        this.themeName.string = ThemeName[themeId];
        this.discount.string = data[1] + '折';
        this.useCount.string = '使用' + useCount + '次';
        this.price.string = this._price;
        cc.loader.loadRes(KeyValueManager['csv_kv']['week_theme_path']['value'] + KeyValueManager['csv_theme'][themeId]['Theme'],cc.SpriteFrame,function (err,spriteFrame) {
            if(err){
                cc.log('load fail');
            }
            else {
                self.week_theme_bg.spriteFrame = spriteFrame;
                cc.loader.setAutoReleaseRecursively(spriteFrame,true);
            }
        });
    },
    onClick: function (id,event) {
        switch (id) {
            case 'test': {
                cc.log('test');
            }
            break;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});