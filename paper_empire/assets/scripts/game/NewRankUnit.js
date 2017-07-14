/**
 * Created by ZZTENG on 2017/07/12.
 **/
let Color_Rank = ['#D58A48','#FFFFFF','#FFF8C9'];
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
        player_name: cc.Label,
        grade: cc.Label,
        bg: cc.Node,
        headSprite: cc.Sprite,
        rankSprite: cc.Sprite,
        rankSpriteFrame: [cc.SpriteFrame],
        rankNumber: cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },
    setData: function (data) {
        let self = this;
        this.rankNumber.node.active = true;
        this.rankNumber.string = data[0];
        if(data[0] % 2 == 1){
            this.bg.active = true;
        }
        else {
            this.bg.active = false;
        }
        if(data[0]  <=  3 ){
            this.rankSprite.node.active = true;
            this.rankSprite.spriteFrame = this.rankSpriteFrame[data[0] -1];
            this.rankNumber.node.active = false;
        }
        else {
            this.rankSprite.node.active = false;
        }
        // cc.loader.load(data[1], function (err, tex) {
        //     if(err){
        //         cc.log(err);
        //     }
        //     else {
        //         let frame = new cc.SpriteFrame(tex);
        //         self.headSprite.spriteFrame = frame;
        //         cc.loader.setAutoReleaseRecursively(frame,true);
        //     }
        // });
        this.player_name.string = data[2];
        this.grade.string = data[3];
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});