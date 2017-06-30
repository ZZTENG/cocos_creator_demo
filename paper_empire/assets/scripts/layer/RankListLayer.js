/**
 * Created by ZZTENG on 2017/03/22.
 **/
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
        _dataSource : null,
        rankUnit: cc.Node,
        _rankList:[],
        index:20,
        scrollView: cc.ScrollView,
        _page: null,
        _sendMsg: null,
    },

    onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,1);
        }
        switch (id) {
            case "return": {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
            }
                break;
        }
    },
    // use this for initialization
    onLoad: function () {
        this._rankList = [];
        this._rankList.push(this.rankUnit.getComponent('RankUnitInList'));
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_GET_RANK_TEAM_INFO , this);
        this._page = 1;
        this._sendMsg = true;
        this.rankUnit.active = false;
        let event = {
            url: KeyValueManager['server_url'],
            msg_id: C2G_REQ_GET_RANK_TEAM_INFO,
            user_id: KeyValueManager['player_data']['user_id'],
            session_key: KeyValueManager['session'],
            page: this._page
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
            let event = {
                url: KeyValueManager['server_url'],
                msg_id: C2G_REQ_GET_TEAM_LIST,
                user_id: KeyValueManager['player_data']['user_id'],
                session_key: KeyValueManager['session'],
                page: this._page
            };
            NetManager.sendMsg(event);
            cc.log('sendmsg');
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
            this._rankList.push(node.getComponent("RankUnitInList"));

        }else{
            if(!this._rankList[index].node.active) this._rankList[index].node.active = true;
        }
        return this._rankList[index];
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id) {
            case C2G_REQ_GET_RANK_TEAM_INFO : {
                if (event['result']) {
                    if (event['result']) {
                        this._sendMsg = true;          //收到消息可以sendMsg
                        let teams = event['data'];
                        if (teams.length < this.index) {
                            this.index = teams.length;
                            this._sendMsg = false;
                        }
                        if (this.index == 0)
                            this._sendMsg = false;
                        let data = [];
                        for (let i = 0; i < this.index; i++) {
                            data.push(teams[i]);
                        }
                        this._dataSource.data = data;
                    }
                }
                break;
            }
        }
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_GET_RANK_TEAM_INFO, this);
        for(let i = 0;i < this._rankList.length;i += 1){
            if(this._rankList[i].node.active)
                this._rankList[i].node.active = false;
        }
        if(this.scrollView.node)
            this.scrollView.node.off('scroll-to-bottom', this.callback, this);
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.currentClip) {
            clip.stop();
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});