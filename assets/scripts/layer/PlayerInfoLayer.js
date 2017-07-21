/**
 * Created by ZZTENG on 2017/03/22.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils');
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
        myName: cc.Label,
        head_sprite: cc.Sprite,
        person_theme: cc.Sprite,
        teamName: cc.Label,
        teamLogo: cc.Node,
        teamRate: cc.Label,
        teamGameCount: cc.Label,
        gameCount_1v1: cc.Label,
        rate_1v1: cc.Label,
        gameCount_2v2: cc.Label,
        rate_2v2: cc.Label,
        gameCount_3v3: cc.Label,
        rate_3v3: cc.Label,
        gameCount_2v2v2: cc.Label,
        rate_2v2v2: cc.Label,
        gameCount_3k: cc.Label,
        rate_3k: cc.Label,
        gameCount_team: cc.Label,
        rate_team: cc.Label,
        id: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_UPDATE_PLAYER,this);
        EventManager.registerHandler(C2G_REQ_CHOOSE_LOGO,this);
        EventManager.registerHandler(C2G_REQ_CHOOSE_THEME,this);
        EventManager.registerHandler(C2G_REQ_GET_PLAYER,this);
        let self = this;
        if(KeyValueManager['platformLogin']) {
            cc.loader.load(KeyValueManager['player_data']['player_info']['head'], function (err, tex) {
                if(err){
                    cc.log(err);
                }
                else {
                    let frame = new cc.SpriteFrame(tex);
                    self.head_sprite.spriteFrame = frame;
                    cc.loader.setAutoReleaseRecursively(frame,true);
                }
            });
        }
        if(KeyValueManager['player_data']['player_info']['theme_id']){
            let theme_id = KeyValueManager['player_data']['player_info']['theme_id'];
            cc.loader.loadRes(KeyValueManager['csv_kv']['person_theme_path']['value'] + KeyValueManager['csv_theme'][theme_id]['Theme'],cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log('load fail');
                }
                else {
                    self.person_theme.spriteFrame = spriteFrame;
                    cc.loader.setAutoReleaseRecursively(spriteFrame,true);
                }
            });
        }
        this.myName.string = KeyValueManager['player_data']['player_info']['name'];
        this.id.string = KeyValueManager['player_data']['player_info']['player_id'];
        if(KeyValueManager['player_data']['player_info']['team'] && KeyValueManager['player_data']['player_info']['team_info']){
            if(KeyValueManager['player_data']['player_info']['team_info']['name']) {
                this.teamName.node.active = true;
                this.teamName.string = KeyValueManager['player_data']['player_info']['team_info']['name'];
            }
            if(this.teamRate.string = KeyValueManager['player_data']['player_info']['team_info']['rate'])
                this.teamRate.string = KeyValueManager['player_data']['player_info']['team_info']['rate'] + '%';
            if(KeyValueManager['player_data']['player_info']['team_info']['game_count'])
                this.teamGameCount.string = KeyValueManager['player_data']['player_info']['team_info']['game_count'];
            if(KeyValueManager['player_data']['player_info']['team_info']['logo']) {
                let logoId = KeyValueManager['player_data']['player_info']['team_info']['logo'];
                    cc.loader.loadRes(KeyValueManager['csv_kv']['logo_path']['value'] + KeyValueManager['csv_teamlogo'][logoId]['TeamLogo'], cc.SpriteFrame, function (err, spriteFrame) {
                        if (err) {
                            return ('load fail');
                        }
                        else {
                            self.teamLogo.active = true;
                            self.teamLogo.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                            cc.loader.setAutoReleaseRecursively(spriteFrame,true);
                        }
                    });
                }
        }
        else {
            this.teamName.node.active = false;
            this.teamRate.string = '0%';
            this.teamGameCount.string = '0';
            this.teamLogo.active = false;
        }
        let event = {
            url: KeyValueManager['server_url'],
            msg_id: C2G_REQ_GET_PLAYER,
            user_id: KeyValueManager['player_data']['user_id'],
            session_key: KeyValueManager['session'],
            player_info: ['record']
        };
        NetManager.sendMsg(event);
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip) {
            clip.play();
        }
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_UPDATE_PLAYER,this);
        EventManager.removeHandler(C2G_REQ_CHOOSE_LOGO,this);
        EventManager.removeHandler(C2G_REQ_CHOOSE_THEME,this);
        EventManager.removeHandler(C2G_REQ_GET_PLAYER,this);
        KeyValueManager['anim_out_state'].off('finished',this.onCloseLayer,this);
    },
    onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case '1v1_record': {
                KeyValueManager['record_mode'] = RecordMode.MODE_1V1;
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': '1v1_record_layer','hide_preLayer': false});
            }
            break;
            case '2v2_record': {
                KeyValueManager['record_mode'] = RecordMode.MODE_2V2;
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': '2v2_record_layer','hide_preLayer': false});
            }
            break;
            case '3v3_record': {
                KeyValueManager['record_mode'] = RecordMode.MODE_3V3
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': '3v3_record_layer','hide_preLayer': false});
            }
            break;
            case '2v2v2_record': {
                KeyValueManager['record_mode'] = RecordMode.MODE_2V2V2;
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': '2v2v2_record_layer','hide_preLayer': false});
            }
            break;
            case '3k_record': {
                KeyValueManager['record_mode'] = RecordMode.MODE_IDENTITY;
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': '3k_record_layer','hide_preLayer': false});
            }
            break;
            case 'team_record':{
                KeyValueManager['record_mode'] = RecordMode.MODE_SELF_TEAM;
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'team_record_layer','hide_preLayer': false});
            }
            break;
            case 'change_theme': {
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'choose_theme_layer', 'hide_preLayer':false});
            }
            break;
            case 'change_team_logo': {
                if (KeyValueManager['player_data']['player_info']['team_info'] && KeyValueManager['player_data']['player_info']['is_master']) {
                    EventManager.pushEvent({
                        'msg_id': 'OPEN_LAYER',
                        'layer_id': 'choose_logo_layer',
                        'hide_preLayer': false
                    });
                }
                else {
                    KeyValueManager['msg_text'] ='你目前没有战队';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
            case 'name': {
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'change_name_layer','hide_preLayer': false});
            }
            break;
            case 'return': {
                let clip = this.getComponent(cc.Animation);
                let clips = clip.getClips();
                if (clips && clips[1]) {
                    KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
                }
                KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
            }
            break;
        }
    },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
    processEvent: function(event){
        let msg_id = event['msg_id'];
        let self = this;
        switch (msg_id) {
            case C2G_REQ_UPDATE_PLAYER: {
                if (event['result']) {
                    this.myName.string = KeyValueManager['player_data']['player_info']['name'];
                }
                else {
                    if(event['error_code'] == 20003){
                        KeyValueManager['msg_text'] ='修改失败，名字已被占用';
                        EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                    }
                    else if(event['error_code'] == 20004){
                        KeyValueManager['msg_text'] ='修改失败，修改前后名字相同';
                        EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                    }
                    else if(event['error_code'] == 20005){
                        KeyValueManager['msg_text'] ='修改失败，包含敏感词';
                        EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                    }
                }
            }
            break;
            case C2G_REQ_CHOOSE_LOGO: {
                if(event['result']){
                    let logoId = KeyValueManager['player_data']['player_info']['team_info']['logo'];
                    if(logoId) {
                        cc.loader.loadRes(KeyValueManager['csv_kv']['logo_path']['value'] + KeyValueManager['csv_teamlogo'][logoId]['TeamLogo'], cc.SpriteFrame, function (err, spriteFrame) {
                            if (err) {
                                return ('load fail');
                            }
                            else {
                                self.teamLogo.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                            }
                        });
                    }
                }
            }
            break;
            case C2G_REQ_CHOOSE_THEME: {
                if(event['result']){
                        KeyValueManager['msg_text'] ='更换成功';
                        EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                        let theme_id = KeyValueManager['player_data']['player_info']['theme_id'];
                        cc.loader.loadRes(KeyValueManager['csv_kv']['person_theme_path']['value'] + KeyValueManager['csv_theme'][theme_id]['Theme'],cc.SpriteFrame,function (err,spriteFrame) {
                            if(err){
                                cc.log(err);
                            }
                            else {
                                self.person_theme.spriteFrame = spriteFrame;
                                cc.loader.setAutoReleaseRecursively(spriteFrame,true);
                            }
                        });
                    }
                }
                break;
            case C2G_REQ_GET_PLAYER: {
                if(event['result']){
                    let player_info = event['player_info'];
                    for(let i in player_info){
                        KeyValueManager['player_data']['player_info'][i] = player_info[i];
                    }
                    if(KeyValueManager['player_data']['player_info']['record']) {
                        let record = KeyValueManager['player_data']['player_info']['record'];
                        if (record[GameMode.MODE_1V1]) {
                            this.gameCount_1v1.string = '场次:  ' + record[GameMode.MODE_1V1]['game_count'];
                            this.rate_1v1.string =  '胜率:  ' + record[GameMode.MODE_1V1]['rate'] + '%';
                        }
                        if (record[GameMode.MODE_2V2]) {
                            this.gameCount_2v2.string = '场次:  ' + record[GameMode.MODE_2V2]['game_count'];
                            this.rate_2v2.string = '胜率:  ' + record[GameMode.MODE_2V2]['rate'] + '%';
                        }
                        if (record[GameMode.MODE_3V3]) {
                            this.gameCount_3v3.string = '场次:  ' + record[GameMode.MODE_3V3]['game_count'];
                            this.rate_3v3.string =  '胜率:  ' + record[GameMode.MODE_3V3]['rate'] + '%';
                        }
                        if (record[GameMode.MODE_2V2V2]) {
                            this.gameCount_2v2v2.string = '场次:  ' + record[GameMode.MODE_2V2V2]['game_count'];
                            this.rate_2v2v2.string =  '胜率:  ' + ecord[GameMode.MODE_2V2V2]['rate'] + '%';
                        }
                        if (record[GameMode.MODE_IDENTITY]) {
                            this.gameCount_3k.string = '场次:  ' + record[GameMode.MODE_IDENTITY]['game_count'];
                            this.rate_3k.string =  '胜率:  ' + record[GameMode.MODE_IDENTITY]['rate'] + '%';
                        }
                        if (record[GameMode.MODE_TEAM]) {
                            this.gameCount_team.string = '场次:  ' + record[GameMode.MODE_TEAM]['game_count'];
                            this.rate_team.string =  '胜率:  ' + record[GameMode.MODE_TEAM]['rate'] + '%';
                        }
                    }
                    Utils.savePlayerData();
                }
            }
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});