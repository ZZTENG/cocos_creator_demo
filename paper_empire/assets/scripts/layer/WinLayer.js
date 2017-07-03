const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils')

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
        replay: cc.Node,
        goOn: cc.Node,
        memberList:[require('WinLoseMemUnit')]
    },
       onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case 'continue':{
                KeyValueManager['record_mode'] = false;
                KeyValueManager['GameOver'] = false;
                Utils.enterMainScene();
                cc.director.loadScene('loading');
            }
            break;
            case 'replay': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'replay_layer', 'hide_preLayer':false});
                KeyValueManager['mapNode'].setScale(0.5,0.5);
                KeyValueManager['mapNode'].setPosition(0,0);
            }
            break;
            case 'xuanyao': {
                KeyValueManager['msg_text'] = '暂时未开放';
                EventManager.pushEvent({
                    'msg_id': 'OPEN_LAYER',
                    'layer_id': 'msg_layer',
                    'hide_preLayer': false
                });
            }
            break;
        }
    },
    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    whichTeam: function (power) {
        let result = null
        for(let i = 0;i < KeyValueManager['camps'].length;i += 1){
            for(let j = 0;j < KeyValueManager['camps'][i].length;j += 1){
                if(power == KeyValueManager['camps'][i][j])
                    result = i;
            }
        }
        return result;
    },
    reuse: function () {
        let self = this;
        for(let i = 0;i < this.memberList.length;i += 1)
            this.memberList[i].node.active = false;
        let keys = Object.keys(KeyValueManager['panel']);
        //��ʤ���Ķ�������ǰ��
        let teamWin = [];
        for(let i =0;i < keys.length;i += 1){
            let team = this.whichTeam(keys[i]);
            if(team == KeyValueManager['teamWin']){
                teamWin.push(keys[i]);
                keys.splice(i,1);
                i -= 1;
            }
        }
        for(let i = 0;i < teamWin.length;i += 1){
            keys.unshift(teamWin[i]);
        }
        for(let i = 0;i < keys.length;i += 1){
            this.memberList[i].node.active = true;
            if(KeyValueManager['panel'][keys[i]]['mvp'])
                this.memberList[i].mvpSpr.node.active = true;
            else
                this.memberList[i].mvpSpr.node.active = false;
            if(KeyValueManager['panel'][keys[i]]['max_kill'])
                this.memberList[i].killerSpr.node.active = true;
            else
                this.memberList[i].killerSpr.node.active = false;
            if(KeyValueManager['panel'][keys[i]]['max_count'])
                this.memberList[i].shooterSpr.node.active = true;
            else
                this.memberList[i].shooterSpr.node.active = false;
            this.memberList[i].memberName.string = KeyValueManager['name'][keys[i]];
            this.memberList[i].killCount.string = KeyValueManager['panel'][keys[i]]['kill'];
            this.memberList[i].landCount.string = KeyValueManager['panel'][keys[i]]['count'];
            if(KeyValueManager['platformLogin']) {
                cc.loader.load(KeyValueManager['panel'][keys[i]]['head'], function (err, tex) {
                    if(err){
                        cc.log(err);
                    }
                    else {
                        let frame = new cc.SpriteFrame(tex);
                        self.memberList[i].teamLogo.getComponent(cc.Sprite).spriteFrame = frame;
                        cc.loader.setAutoReleaseRecursively(frame,true);
                    }
                });
            }
        }

        if(KeyValueManager['is_guide']){            //指引屏蔽回放
            this.goOn.setPositionX(0);
            this.replay.active = false;
        }
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip) {
            clip.play();
        }
    },
    onDisable: function () {
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.currentClip) {
            clip.stop();
        }
    },
    onMemberUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getMemberElement:function (index) {
        return this.memberList[index];
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
