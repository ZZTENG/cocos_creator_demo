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
        head:cc.Sprite,
        memberNameBG:cc.Node,
        memberName: cc.Label,
        headBorder:cc.Sprite,
        themeBG:cc.Sprite,
        tickOutBtn:cc.Button,
        addBtn:cc.Button,
        crownSpr: cc.Sprite,
    },

    // use this for initialization
    onLoad: function () {

    },
     setData: function (data) {
         let self = this;
         this.memberNameBG.active = false;
         this.head.node.active = false;
         this.headBorder.node.active = false;
         this.themeBG.node.active = false;
         this.tickOutBtn.node.active = false;
         this.addBtn.node.active = false;
         this.crownSpr.node.active = false;
         if(data[0] == 0 )
         {
             if(data[1] == 1)
                this.addBtn.node.active = true;
             return;
         }
         this.themeBG.node.active = true;
         this.memberNameBG.active = true;
         this.memberName.string = data[0];
         let theme_id = data[1];
         cc.loader.loadRes(KeyValueManager['csv_kv']['person_theme_path']['value'] + KeyValueManager['csv_theme'][theme_id]['Theme'],cc.SpriteFrame,function (err,spriteFrame) {
             if(err){
                 cc.log(err);
             }
             else {
                 self.themeBG.spriteFrame = spriteFrame;
                 cc.loader.setAutoReleaseRecursively(spriteFrame,true);
             }
         });
         if(data[5])
         {
             this.crownSpr.node.active = true;
         }
         if(data[4] != KeyValueManager['player_data']['player_id'] && data[6] == 1)
         {
             this.tickOutBtn.node.active = true;
         }

     },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
