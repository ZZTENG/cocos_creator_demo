const i18n = require('i18n');
cc.Class({
    extends: cc.Sprite,
             editor: {
                 executeInEditMode: true,
             },
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
        textKey: {
            default: 'TEXT_KEY',
            multiline: true,

            tooltip: '输入 i18n 关键字，文本在assets/i18n/data里面，代码中不允许修改这个值，仅在编辑器中使用',
            notify: function (value) {
                 // let self = this;
                 // let spritePath = i18n.t(this.textKey);
                // Editor.assetdb.queryAssets('db://assets/resources/*', 'prefab' , function (err, prefabs) {
                //     if (err)
                //     {
                //
                //     }
                // });
                //  var uuid = cc.AssetLibrary.parseUuidInEditor('db://assets/resources/' + spritePath);
                //  if (uuid)
                //  {
                //     Editor.log(JSON.stringify(uuid));
                //     cc.AssetLibrary.loadAsset(uuid, function (err, asset) {
                //         // ....
                //         if(!err) {
                //             self.spriteFrame = asset;
                //         }
                //     });
                //
                //
                // }

            }
        }
    },
    updateSprite:function () {
        if(this.textKey)
        {
            let self = this;
            let spritePath = i18n.t(this.textKey);
            cc.loader.loadRes(spritePath, cc.SpriteFrame, function (err, res) {
                if(!err)
                {
                    self.spriteFrame = res;
                    cc.loader.setAutoReleaseRecursively(spritePath, true);
                }
            });
        }
    },
    onDestroy:function () {
        if(this.textKey) {
            let spritePath = i18n.t(this.textKey);
            cc.loader.releaseRes(spritePath);
        }
    },
    // use this for initialization
    onLoad: function () {
        this.updateSprite();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
