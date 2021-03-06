/**
 * Created by ZZTENG on 2017/03/29.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager= require('EventManager');
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
        memberName: cc.Label,
        head: cc.Sprite,
        theme: cc.Sprite,
        prepare: cc.Node,
        belongTeam: [cc.Node]
    },
    onEnable: function () {
        EventManager.registerHandler(C2G_REQ_CHOOSE_THEME,this);
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_CHOOSE_THEME,this);
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id){
            case C2G_REQ_CHOOSE_THEME:{
                if(event['result']){
                    KeyValueManager['msg_text'] ='更换成功';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                    let theme_id = KeyValueManager['player_data']['player_info']['theme_id'];
                    let self = this;
                    cc.loader.loadRes(KeyValueManager['csv_kv']['person_theme_path']['value'] + KeyValueManager['csv_theme'][theme_id]['Theme'],cc.SpriteFrame,function (err,spriteFrame) {
                        if(err){
                            cc.log(err);
                        }
                        else {
                            self.theme.spriteFrame = spriteFrame;
                            cc.loader.setAutoReleaseRecursively(spriteFrame,true);
                        }
                    });
                }
            }
        }
    },
    setData: function (data) {
        let self = this;
        if(data instanceof  Array){
            this.node.active = true;
            this.memberName.string = data[0];
            this.prepare.active = data[3];
            for(let i = 0;i < this.belongTeam.length; i += 1){
                if(i == data[4])
                    this.belongTeam[i].active = true;
                else
                    this.belongTeam[i].active = false;
            }
            let theme_id = data[2];
            cc.loader.loadRes(KeyValueManager['csv_kv']['person_theme_path']['value'] + KeyValueManager['csv_theme'][theme_id]['Theme'],cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log(err);
                }
                else {
                    self.theme.spriteFrame = spriteFrame;
                    cc.loader.setAutoReleaseRecursively(spriteFrame,true);
                }
            });
            if(KeyValueManager['platformLogin']) {
                cc.loader.load(data[1], function (err, tex) {
                    if(err){
                        cc.log(err);
                    }
                    else {
                        let frame = new cc.SpriteFrame(tex);
                        self.head.getComponent(cc.Sprite).spriteFrame = frame;
                        cc.loader.setAutoReleaseRecursively(frame,true);
                    }
                });
            }
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