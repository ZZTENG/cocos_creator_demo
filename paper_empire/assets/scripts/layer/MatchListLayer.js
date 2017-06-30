/**
 * Created by ZZTENG on 2017/03/24.
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
        _dataSource : null,
        matchUnit: cc.Node,
        _machList:[],
        index:10,
        _currentTeamCount: 0,
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
             EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
         }
         break;
         case 'match':{
             if(KeyValueManager['player_data']['player_info']['is_master']) {
                 let mate_count = 0;
                 if(KeyValueManager['player_data']['player_info']['team_info']
                     && KeyValueManager['player_data']['player_info']['team_info']['mate_count'])
                     mate_count = KeyValueManager['player_data']['player_info']['team_info']['mate_count'];
                 if (mate_count == 3) {
                     KeyValueManager['game_mode'] = GameMode.MODE_TEAM;
                     let event1 = {
                         url: KeyValueManager['server_url'],
                         msg_id: C2G_REQ_GAME_MATCH,
                         user_id: KeyValueManager['player_data']['user_id'],
                         session_key: KeyValueManager['session'],
                         mode: KeyValueManager['game_mode']
                     };
                     NetManager.sendMsg(event1);
                 }
                 else {
                     KeyValueManager['msg_text'] ='队伍人数不足';
                     EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                 }
             }
             else {
                 KeyValueManager['msg_text'] = '只有队长才能进行匹配';
                 EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
             }
         }
         break;
         case 'rank': {
             if(KeyValueManager['player_data']['player_info']['is_master']) {
                 KeyValueManager['game_mode'] = GameMode.MODE_TIANTI;
                 EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
                 EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'tianti_layer', 'hide_preLayer': false});
             }
             else {
                 KeyValueManager['msg_text'] = '只有队长才能进行天梯';
                 EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
             }
         }
         break;

     }
 },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id){
            case C2G_REQ_GET_WATCH_TEAM_LIST: {
                if (event['result']) {
                    this._sendMsg = true;          //收到消息可以sendMsg
                    let teams = event['data'];
                    if (teams.length < this.index) {
                        this.index = teams.length;
                        this._sendMsg = false;
                    }
                    if(this.index == 0)
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
    },
    // use this for initialization
    onLoad: function () {
        this._machList = [];
        this._machList.push(this.matchUnit.getComponent('MatchUnit'));
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_GET_WATCH_TEAM_LIST, this);

        this._page = 1;
        this._sendMsg = true;
        this.index = 10;
        this.matchUnit.active = false;
        let event = {
            url: KeyValueManager['server_url'],
            msg_id: C2G_REQ_GET_WATCH_TEAM_LIST,
            user_id: KeyValueManager['player_data']['user_id'],
            session_key: KeyValueManager['session'],
            page: this._page
        };
        NetManager.sendMsg(event);
        this._dataSource = this.getComponent('DataSource');
        this._dataSource = this._dataSource.getUnit();
        this._dataSource.host = this;
        this._dataSource.bindFunc = this.onmatchUnit;
        this._dataSource.getElementFunc = this.getTeamElement;
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.currentClip) {
            clip.play();
        }
        this.scrollView.node.on('scroll-to-bottom', this.callback, this)
    },
    callback: function () {
        if(this._sendMsg) {
            this._sendMsg = false;
            this._page += 1;
            let event = {
                url: KeyValueManager['server_url'],
                msg_id: C2G_REQ_GET_WATCH_TEAM_LIST,
                user_id: KeyValueManager['player_data']['user_id'],
                session_key: KeyValueManager['session'],
                page: this._page
            };
            NetManager.sendMsg(event);
            cc.log('sendmsg');
        }
    },
    onmatchUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getTeamElement:function (index) {
        index = parseInt(index);
        index = (this._page - 1) * this.index + index;
        if(index >= this._machList.length){
            let node = cc.instantiate(this.matchUnit);
            if(!node.active) node.active = true;
            node.parent = this.matchUnit.parent;
            this._machList.push(node.getComponent("MatchUnit"));

        }else{
            if(!this._machList[index].node.active) this._machList[index].node.active = true;
        }
        return this._machList[index];
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_GET_WATCH_TEAM_LIST, this);

        for(let i = 0;i < this._machList.length;i += 1){
            if(this._machList[i].node.active)
                this._machList[i].node.active = false;
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
