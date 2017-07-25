/**
 * Created by ZZTENG on 2017/07/12.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils');
let game_type = cc.Enum({
    game_type_1v1: 0,
    game_type_2v2: 1,
    game_type_3v3: 2,
    game_type_2v2v2: 3,
    game_type_team: 4,
    game_type_tianti: 5,
});
let rank_type = cc.Enum({
    rank_type_week: 1,
    rank_type_month: 2,
    rank_type_total: 3,
})
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
        _dataSource : null,
        rankUnit: cc.Node,
        _rankList:[],
        index:20,
        scrollView: cc.ScrollView,
        ownRank: cc.Label,
        ownHead: cc.Sprite,
        ownName: cc.Label,
        ownGrade: cc.Label,
        _page: null,
        _sendMsg: null,
        _gameType: null,
        _rankType: null,
        _updateOwnData: null
    },

    onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case '1v1': {
                this._gameType = game_type.game_type_1v1;
            }
            break;
            case '2v2': {
                this._gameType = game_type.game_type_2v2;
            }
            break;
            case '3v3': {
                this._gameType = game_type.game_type_3v3;
            }
            break;
            case '2v2v2': {
                this._gameType = game_type.game_type_2v2v2;
            }
            break;
            case 'team': {
                this._gameType = game_type.game_type_team;
            }
            break;
            case 'tianti': {
                KeyValueManager['msg_text'] ='暂未开放';
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                this._gameType = game_type.game_type_tianti;
            };
            break;
            case 'week': {
                this._rankType = rank_type.rank_type_week;
            }
            break;
            case 'month': {
                this._rankType = rank_type.rank_type_month;
            }
            break;
            case 'total': {
                this._rankType = rank_type.rank_type_total;
            }
            break;
            case "return": {
                let clip = this.getComponent(cc.Animation);
                let clips = clip.getClips();
                if (clips && clips[1]) {
                    KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
                }
                KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
            }
                break;
        }
        if(id && id != 'return'){
            this.initState();
            let start = (this._page - 1) * this.index + 1;
            let end = this._page * this.index;
            let event1 = {
                url: KeyValueManager['server_url'],
                msg_id: C2G_REQ_GET_GAME_RANK,
                user_id: KeyValueManager['player_data']['user_id'],
                session_key: KeyValueManager['session'],
                game_type: this._gameType,
                rank_type: this._rankType,
                start: start,
                end: end
            };
            NetManager.sendMsg(event1);
        }
    },
    // use this for initialization
    onLoad: function () {
        this._rankList = [];
        this._rankList.push(this.rankUnit.getComponent('NewRankUnit'));
        // this.reuse();
    },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
    onEnable: function () {
        EventManager.registerHandler(C2G_REQ_GET_GAME_RANK , this);
        this._updateOwnData = true;
        this.ownName.string = KeyValueManager['player_data']['player_info']['name'];
        this.ownRank.string = 0;
        this.ownGrade.string = 0;
        let self = this
        cc.loader.load(KeyValueManager['player_data']['player_info']['head'], function (err, tex) {
            if(err){
                cc.log(err);
            }
            else {
                let frame = new cc.SpriteFrame(tex);
                self.ownHead.spriteFrame = frame;
                cc.loader.setAutoReleaseRecursively(frame,true);
            }
        });
        this._page = 1;
        this._sendMsg = true;
        this.rankUnit.active = false;
        this._gameType = game_type.game_type_1v1;
        this._rankType = rank_type.rank_type_week;
        let start = (this._page - 1) * this.index + 1;
        let end = this._page * this.index;
        let event = {
            url: KeyValueManager['server_url'],
            msg_id: C2G_REQ_GET_GAME_RANK,
            user_id: KeyValueManager['player_data']['user_id'],
            session_key: KeyValueManager['session'],
            game_type: this._gameType,
            rank_type: this._rankType,
            start: start,
            end: end
        };
        NetManager.sendMsg(event);
        this._dataSource = this.getComponent('DataSource');
        this._dataSource = this._dataSource.getUnit();
        this._dataSource.host = this;
        this._dataSource.bindFunc = this.onTeamUnit;
        this._dataSource.getElementFunc = this.getTeamElement;
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip){
            clip.play();
        }
        this.scrollView.node.on('scroll-to-bottom', this.callback, this);
    },
    callback: function () {
        if(this._sendMsg) {
            this._sendMsg = false;
            this._page += 1;
            let start = (this._page - 1) * this.index + 1;
            let end = this._page * this.index;
            let event = {
                url: KeyValueManager['server_url'],
                msg_id: C2G_REQ_GET_GAME_RANK,
                user_id: KeyValueManager['player_data']['user_id'],
                session_key: KeyValueManager['session'],
                game_type: this._gameType,
                rank_type: this._rankType,
                start: start,
                end: end
            };
            NetManager.sendMsg(event);
        }
    },
    onTeamUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getTeamElement:function (index) {
        index = parseInt(index);
        index = (this._page - 1) * this.index + index;
        if(index >= this._rankList.length){
            let node = cc.instantiate(this.rankUnit);
            if(!node.active) node.active = true;
            node.parent = this.rankUnit.parent;
            this._rankList.push(node.getComponent("NewRankUnit"));

        }else{
            if(!this._rankList[index].node.active) this._rankList[index].node.active = true;
        }
        return this._rankList[index];
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id) {
            case C2G_REQ_GET_GAME_RANK : {
                if (event['result']) {
                    if (event['result']) {
                        this._sendMsg = true;          //收到消息可以sendMsg
                        if(this._updateOwnData){
                            this._updateOwnData = false;
                            this.ownRank.string = event['player_rank_info'][0];
                            this.ownGrade.string = event['player_rank_info'][1];
                        }
                        let teams = event['rank_info'];
                        if (teams.length < this.index) {
                            this._sendMsg = false;
                        }
                        let data = [];
                        for (let i = 0; i < teams.length; i++) {
                            data.push(teams[i]);
                        }
                        this._dataSource.data = data;
                    }
                }
                break;
            }
        }
    },
    initState: function () {
        this._page = 1;
        this.index = 20;
        for(let i = 0;i < this._rankList.length;i += 1){
            if(this._rankList[i].node.active)
                this._rankList[i].node.active = false;
        }
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_GET_GAME_RANK, this);
        for(let i = 0;i < this._rankList.length;i += 1){
            if(this._rankList[i].node.active)
                this._rankList[i].node.active = false;
        }
        if(this.scrollView.node)
            this.scrollView.node.off('scroll-to-bottom', this.callback, this);
        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});