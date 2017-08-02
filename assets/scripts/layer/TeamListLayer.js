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
        teamUnit: cc.Node,
        _teamList:[],
        index:10,
        _currentTeamCount: 0,
        scrollView: cc.ScrollView,
        _page: null,
        _sendMsg: null,
    },
     onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
         switch (id) {
             case "return": {
                 let clip = this.getComponent(cc.Animation);
                 let clips = clip.getClips();
                 if (clips && clips[1]) {
                     KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
                 }
                 KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
             }
             break;
             case "create": {
                 EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'create_team_layer', 'hide_preLayer':false});
             }
             break;
         }
     },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
     reuse:function () {
         EventManager.registerHandler(C2G_REQ_GET_TEAM_LIST, this);
         EventManager.registerHandler(C2G_REQ_APPLY_JOIN_TEAM, this);
         this._page = 1;
         this._sendMsg = true;
         this.index = 10;
         this.teamUnit.active = false;
         let event = {
             url: KeyValueManager['server_url'],
             msg_id: C2G_REQ_GET_TEAM_LIST,
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
         if (clip && clip.defaultClip) {
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
         if(index >= this._teamList.length){
             let node = cc.instantiate(this.teamUnit);
             if(!node.active) node.active = true;
             node.parent = this.teamUnit.parent;
             this._teamList.push(node.getComponent("TeamUnit"));

         }else{
             if(!this._teamList[index].node.active) this._teamList[index].node.active = true;
         }
         return this._teamList[index];
     },
     processEvent: function (event) {
         let msg_id = event['msg_id'];
         switch (msg_id) {
             case C2G_REQ_GET_TEAM_LIST: {
                 if (event['result']) {
                     this._sendMsg = true;          //收到消息可以sendMsg
                     let teams = event['teams'];
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
             case C2G_REQ_APPLY_JOIN_TEAM:
             {
                 if (event['result']) {
                     KeyValueManager['msg_text'] ='申请成功';
                     EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                 }
             }
             break;
         }
     },
    onDisable: function () {
         EventManager.removeHandler(C2G_REQ_GET_TEAM_LIST, this);
         EventManager.removeHandler(C2G_REQ_APPLY_JOIN_TEAM, this);
         for(let i = 0;i < this._teamList.length;i += 1){
             if(!this._teamList[i].node.active)
                 this._teamList[i].node.active = false;
         }
         if(this.scrollView.node)
             this.scrollView.node.off('scroll-to-bottom', this.callback, this);
        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }

     },
    // use this for initialization
    onLoad: function () {
        this._teamList = [];
        this._teamList.push(this.teamUnit.getComponent('TeamUnit'));
        this.reuse();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
