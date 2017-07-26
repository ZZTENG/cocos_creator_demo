const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils');
const R = require('ramda');
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
        logo: cc.Sprite,
        teamName: cc.Label,
        rate: cc.Label,
        count: cc.Label,
        level: cc.Sprite,
        chatMsg: cc.RichText,
        editMsg: cc.EditBox,
        index:10,
        scrollView: cc.ScrollView,
        teammateList:[require('TeamMemUnitInTeam')],
        _dataSource:null,
        _page: null,
        _sendMsg: null,
        _msgList: null,
    },
             onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
                 switch (id)
                 {
                     case "change": {
                         if (KeyValueManager['player_data']['player_info']['team_info'] && KeyValueManager['player_data']['player_info']['is_master']) {
                             EventManager.pushEvent({
                                 'msg_id': 'OPEN_LAYER',
                                 'layer_id': 'choose_logo_layer',
                                 'hide_preLayer': false
                             });
                         }
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
                     case "record": {
                         KeyValueManager['record_mode'] = RecordMode.MODE_TEAM;
                         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'team_record_layer', 'hide_preLayer':false});
                     }
                         break;
                     case "request_list": {
                         if(KeyValueManager['player_data']['player_info']['is_master']) {
                             EventManager.pushEvent({
                                 'msg_id': 'OPEN_LAYER',
                                 'layer_id': 'request_layer',
                                 'hide_preLayer': false
                             });
                         }
                         else {
                             KeyValueManager['msg_text'] = '只有队长才能看申请列表';
                             EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});

                         }
                     }
                         break;
                     case "advise":
                     {
                         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'advise_layer', 'hide_preLayer':false});
                     }
                         break;
                     case "other": {
                         EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'team_list_layer', 'hide_preLayer':false});
                     }
                         break;
                     case "tichu1":{
                         id = this._dataSource.data[0][4];
                         if(id != KeyValueManager['player_data']['player_id'] && KeyValueManager['player_data']['player_info']['is_master'] == 1)
                         {
                             let event1 = {
                                 url:KeyValueManager['server_url'],
                                 msg_id:C2G_REQ_REMOVE_TEAMMATE,
                                 user_id:KeyValueManager['player_data']['user_id'],
                                 session_key: KeyValueManager['session'],
                                 id: id
                             };
                             NetManager.sendMsg(event1);
                         }
                     }
                     break;
                     case "tichu2":{
                         id = this._dataSource.data[1][4];
                         if(id != KeyValueManager['player_data']['player_id'] && KeyValueManager['player_data']['player_info']['is_master'] == 1)
                         {
                             let event1 = {
                                 url:KeyValueManager['server_url'],
                                 msg_id:C2G_REQ_REMOVE_TEAMMATE,
                                 user_id:KeyValueManager['player_data']['user_id'],
                                 session_key: KeyValueManager['session'],
                                 id: id
                             };
                             NetManager.sendMsg(event1);
                         }
                     }
                         break;
                     case "tichu3":{
                         id = this._dataSource.data[2][4];
                         if(id != KeyValueManager['player_data']['player_id'] && KeyValueManager['player_data']['player_info']['is_master'] == 1)
                         {
                             let event1 = {
                                 url:KeyValueManager['server_url'],
                                 msg_id:C2G_REQ_REMOVE_TEAMMATE,
                                 user_id:KeyValueManager['player_data']['user_id'],
                                 session_key: KeyValueManager['session'],
                                 id: id
                             };
                             NetManager.sendMsg(event1);
                         }
                     }
                         break;
                     case "sendmsg":
                     {
                         if(this.editMsg.string){
                             let msg = this.editMsg.string;
                             this.editMsg.string = '';
                             let msgNode = cc.instantiate(this.chatMsg.node);
                             msgNode.active = true;
                             msgNode.parent = this.chatMsg.node.parent;
                             msgNode.setSiblingIndex(0);
                             this._msgList.push(msgNode);
                             msgNode.getComponent(cc.RichText).string = msg;
                             let event1 = {
                                 url:KeyValueManager['server_url'],
                                 msg_id:C2G_REQ_SEND_MESSAGE,
                                 user_id:KeyValueManager['player_data']['user_id'],
                                 session_key: KeyValueManager['session'],
                                 message: msg,
                                 type: 1
                             };
                             NetManager.sendMsg(event1);
                             cc.log('chatmsg');
                         }
                     }
                         break;
                     case "quit": {
                         let event1 = {
                             url:KeyValueManager['server_url'],
                             msg_id:C2G_REQ_EXIT_TEAM,
                             user_id:KeyValueManager['player_data']['user_id'],
                             session_key: KeyValueManager['session'],
                         };
                         NetManager.sendMsg(event1);

                     }
                         break;
                 }
             },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
             // use this for initialization
             onLoad: function () {
                 this.reuse();
             },

             onTeamUnit:function (index, unit, data) {
                 if (unit&&unit.setData)
                     unit.setData(data);
             },
             getTeamElement:function (index) {
                 return this.teammateList[index];
             },
             reuse:function () {
                 EventManager.registerHandler(C2G_REQ_GET_TEAM_INFO, this);
                 EventManager.registerHandler(C2G_REQ_EXIT_TEAM, this);
                 EventManager.registerHandler(C2G_REQ_REMOVE_TEAMMATE, this);
                 EventManager.registerHandler(C2G_REQ_SEND_MESSAGE, this);
                 EventManager.registerHandler(C2G_REQ_GET_MESSAGE, this);
                 EventManager.registerHandler(C2G_REQ_AGREE_JOIN_APPLY, this);
                 EventManager.registerHandler(C2G_REQ_CHOOSE_LOGO,this);
                 this.logo.spriteFrame = KeyValueManager['defaultLogo'];
                 let event1 = {
                     url:KeyValueManager['server_url'],
                     msg_id:C2G_REQ_GET_TEAM_INFO,
                     user_id:KeyValueManager['player_data']['user_id'],
                     session_key: KeyValueManager['session'],
                     id:KeyValueManager['player_data']['player_info']['team']
                 };
                 NetManager.sendMsg(event1);
                 this._page = 1;
                 this._sendMsg = true;
                 this._msgList = [];
                 this._dataSource = this.getComponent('DataSource');
                 this._dataSource = this._dataSource.getUnit();
                 this._dataSource.host = this;
                 this._dataSource.bindFunc = this.onTeamUnit;
                 this._dataSource.getElementFunc = this.getTeamElement;

                 let clip = this.getComponent(cc.Animation);
                 if (clip && clip.defaultClip) {
                     clip.play();
                 }
                 let event = {
                     url: KeyValueManager['server_url'],
                     msg_id: C2G_REQ_GET_MESSAGE,
                     user_id: KeyValueManager['player_data']['user_id'],
                     session_key: KeyValueManager['session'],
                     type: 1,
                     page: this._page
                 };
                 NetManager.sendMsg(event);
                 this.scrollView.node.on('scroll-to-top', this.callback, this);
             },
             callback: function () {
                 if(this._sendMsg) {
                     this._sendMsg = false;
                     this._page += 1;
                     let event = {
                         url: KeyValueManager['server_url'],
                         msg_id: C2G_REQ_GET_MESSAGE,
                         user_id: KeyValueManager['player_data']['user_id'],
                         session_key: KeyValueManager['session'],
                         type: 1,
                         page: this._page
                     };
                     NetManager.sendMsg(event);
                     cc.log('sendmsg');
                 }
             },
    onDisable: function () {
                 EventManager.removeHandler(C2G_REQ_GET_TEAM_INFO, this);
                 EventManager.removeHandler(C2G_REQ_EXIT_TEAM, this);
                 EventManager.removeHandler(C2G_REQ_REMOVE_TEAMMATE, this);
                 EventManager.removeHandler(C2G_REQ_SEND_MESSAGE, this);
                 EventManager.removeHandler(C2G_REQ_GET_MESSAGE, this);
                 EventManager.removeHandler(C2G_REQ_AGREE_JOIN_APPLY, this);
                 EventManager.removeHandler(C2G_REQ_CHOOSE_LOGO,this);
                 for(let i  =0;i < this._msgList.length;i += 1){
                     this._msgList[i].destroy();
                 }
                 if(this.scrollView.node)
                     this.scrollView.node.off('scroll-to-top', this.callback, this);
        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }
             },
             processEvent: function (event) {
                 let msg_id = event['msg_id'];
                 switch (msg_id) {
                     case C2G_REQ_GET_TEAM_INFO: {
                         if (event['result']) {
                             let self = this;
                             let is_master = null;
                             if(event['master_id'] == KeyValueManager['player_data']['player_id'])
                             {
                                 KeyValueManager['player_data']['player_info']['is_master'] = true;
                                 is_master = 1;

                             }
                             else
                             {
                                 KeyValueManager['player_data']['player_info']['is_master'] = false;
                                 is_master = 0;
                             }
                             if(!KeyValueManager['player_data']['player_info']['team_info']){
                                 KeyValueManager['player_data']['player_info']['team_info'] = {};
                             }
                             KeyValueManager['player_data']['player_info']['team_info']['rate'] = event['team_info']['2'];
                             KeyValueManager['player_data']['player_info']['team_info']['game_count'] = event['team_info']['3'];
                             KeyValueManager['player_data']['player_info']['team_info']['logo'] = event['team_info']['5'];
                             KeyValueManager['player_data']['player_info']['team_info']['name'] = event['team_info']['6'];
                             this.rate.string = event['team_info'][2];
                             this.count.string = event['team_info'][3];
                             this.teamName.string = event['team_info'][6];
                             let logoId = KeyValueManager['player_data']['player_info']['team_info']['logo'];
                             if(logoId) {
                                 cc.loader.loadRes(KeyValueManager['csv_kv']['logo_path']['value'] + KeyValueManager['csv_teamlogo'][logoId]['TeamLogo'], cc.SpriteFrame, function (err, spriteFrame) {
                                     if (err) {
                                         return ('load fail');
                                     }
                                     else {
                                         self.logo.spriteFrame = spriteFrame;
                                         cc.loader.setAutoReleaseRecursively(spriteFrame,true);
                                     }
                                 });
                             }
                             let teamData = [];
                             KeyValueManager['player_data']['player_info']['team_info']['mate_count'] = event['teammates'].length;
                             for (let i = 0; i < 3; ++i )
                             {
                                 if(event['teammates'].length > i)
                                 {
                                     let data = event['teammates'][i];
                                     if(event['teammates'][i][4] == event['master_id'])
                                     {
                                         data.push(true);
                                     }
                                     else
                                     {
                                         data.push(false);
                                     }
                                     data.push(is_master);
                                     teamData.push(data);
                                 }
                                 else
                                 {
                                     teamData.push([0, is_master]);
                                 }
                             }
                             this._dataSource.data = teamData;
                         }
                     }
                         break;
                     case C2G_REQ_AGREE_JOIN_APPLY: {
                         if(event['result']){
                             let event1 = {
                                 url:KeyValueManager['server_url'],
                                 msg_id:C2G_REQ_GET_TEAM_INFO,
                                 user_id:KeyValueManager['player_data']['user_id'],
                                 session_key: KeyValueManager['session'],
                                 id:KeyValueManager['player_data']['player_info']['team']
                             };
                             NetManager.sendMsg(event1);
                             cc.log('team test');
                         }
                     }
                     break;
                     case C2G_REQ_EXIT_TEAM:
                     {
                         if (event['result']) {
                             if(event['is_leader']){
                                 delete KeyValueManager['player_data']['player_info']['team'];
                                 delete KeyValueManager['player_data']['player_info']['is_master'];
                                 Utils.savePlayerData();
                                 EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                                 return;
                             }
                             if(event['id'] == KeyValueManager['player_data']['player_id'])
                             {
                                 delete KeyValueManager['player_data']['player_info']['team'];
                                 delete KeyValueManager['player_data']['player_info']['is_master'];
                                 Utils.savePlayerData();
                                 EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                             }
                             else
                             {
                                 let data = this._dataSource.data;
                                 for (let i in data)
                                 {
                                     if(data[i].length > 2) {
                                         if (data[i][4] == event['id']) {
                                             let is_master = 0
                                             if (KeyValueManager['player_data']['player_info']['is_master'])
                                                 is_master = 1;
                                             data[i] = [0, is_master];
                                             break
                                         }
                                     }
                                 }
                                 this._dataSource.data = data;
                             }
                         }
                     }
                     break;
                     case C2G_REQ_REMOVE_TEAMMATE:
                     {
                         if (event['result']) {
                             if (event['id'] == KeyValueManager['player_data']['player_id']) {
                                 delete KeyValueManager['player_data']['player_info']['team'];
                                 delete KeyValueManager['player_data']['player_info']['is_master'];
                                 Utils.savePlayerData();
                                 EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
                             }
                             else {
                                 let data = this._dataSource.data;
                                 for (let i in data) {
                                     if(data[i].length > 2) {
                                         if (data[i][4] == event['id']) {

                                             let is_master = 0
                                             if (KeyValueManager['player_data']['player_info']['is_master'])
                                                 is_master = 1;
                                             data[i] = [0, is_master];
                                             break;
                                         }
                                     }
                                 }
                                 this._dataSource.data = data;
                             }
                         }
                     }
                         break;
                     case C2G_REQ_GET_MESSAGE: {
                         if(event['result']) {
                             let msg = event['data'];           //msg  ['4430,None,1490941051676,1']
                             if (msg) {
                                 if (msg.length == 0)
                                     this._sendMsg = false;
                                 else
                                     this._sendMsg = true;
                                 for(let i = 0;i < msg.length;i += 1) {
                                     let msgNode = cc.instantiate(this.chatMsg.node);
                                     msgNode.active = true;
                                     msgNode.parent = this.chatMsg.node.parent;
                                     this._msgList.push(msgNode);
                                     let msg_data =msg[i].split(',');
                                     msgNode.getComponent(cc.RichText).string = msg_data[3];
                                     cc.log('chatmsg');
                                 }
                             }
                         }
                     }
                     break;
                     case C2G_REQ_SEND_MESSAGE: {
                         if(event['result']) {
                             let msg = event['data'];
                             if (msg) {
                                 let msgNode = cc.instantiate(this.chatMsg.node);
                                 msgNode.active = true;
                                 msgNode.parent = this.chatMsg.node.parent;
                                 msgNode.setSiblingIndex(0);
                                 this._msgList.push(msgNode);
                                 msgNode.getComponent(cc.RichText).string = msg;
                                 cc.log(event['message']);
                             }
                         }
                     }
                     break;
                     case C2G_REQ_CHOOSE_LOGO: {
                         if(event['result']){
                             let self = this;
                             let logoId = KeyValueManager['player_data']['player_info']['team_info']['logo'];
                             cc.log(logoId,KeyValueManager['player_data']['player_info']['team_info']['logo']);
                             if(logoId) {
                                 cc.loader.loadRes(KeyValueManager['csv_kv']['logo_path']['value'] + KeyValueManager['csv_teamlogo'][logoId]['TeamLogo'], cc.SpriteFrame, function (err, spriteFrame) {
                                     if (err) {
                                         return ('load fail');
                                     }
                                     else {
                                         self.logo.spriteFrame = spriteFrame;
                                         cc.loader.setAutoReleaseRecursively(spriteFrame,true);
                                     }
                                 });
                             }
                         }
                     }
                     break;
                 }
             }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
