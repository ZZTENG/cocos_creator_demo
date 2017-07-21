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
        head:cc.Sprite,
        memberName:cc.Label,
        themeBG:cc.Sprite,
        prepare: cc.Node,
    },
    setData: function (data) {
        let self = this;
        if(data instanceof Array) {
            this.node.active = true;
            this.memberName.string = data[0];
            let theme_id = data[2];
            cc.loader.loadRes(KeyValueManager['csv_kv']['person_theme_path']['value'] + KeyValueManager['csv_theme'][theme_id]['Theme'],cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log('load fail');
                }
                else {
                    self.themeBG.spriteFrame = spriteFrame;
                }
            });
            this.prepare.active = data[3];
            this.prepare.parent.active = data[3];

        }
        else {
            if(data == 0) {
                this.node.active = false;
            }
        }
    },
    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
