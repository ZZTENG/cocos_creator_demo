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
                 playerUnit: cc.Node,
                 _playerList:[],
                 index:10,
                 _currentPlayerCount: 0,
             },
             onClick:function (event, id) {
                 switch (id) {
                     case "return": {
                         EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                     }
                         break;
                 }


             },
             reuse:function () {
                 EventManager.registerHandler(C2G_REQ_GET_APPLY_LIST, this);
                 EventManager.registerHandler(C2G_REQ_AGREE_JOIN_APPLY, this);
                 this.playerUnit.active = false;
                 let event = {
                     url: KeyValueManager['server_url'],
                     msg_id: C2G_REQ_GET_APPLY_LIST,
                     user_id: KeyValueManager['player_data']['user_id'],
                     session_key: KeyValueManager['session'],
                 };
                 NetManager.sendMsg(event);
                 this._dataSource = this.getComponent('DataSource');
                 this._dataSource = this._dataSource.getUnit();
                 this._dataSource.host = this;
                 this._dataSource.bindFunc = this.onPlayerUnit;
                 this._dataSource.getElementFunc = this.getPlayerElement;
                 this._dataSource.clearElementFunc = this.clearElement;
                 let clip = this.getComponent(cc.Animation);
                 if (clip && clip.defaultClip) {
                     clip.play();
                 }
             },
             onPlayerUnit:function (index, unit, data) {
                 if (unit&&unit.setData)
                     unit.setData(data);
             },
             clearElement:function () {
                 for(let index  = 0;index < this._playerList.length;index += 1) {
                     if(this._playerList[index].node.active) this._playerList[index].node.active = false;
                 }
             },
             getPlayerElement:function (index) {
                 if(index >= this._playerList.length){
                     let node = cc.instantiate(this.playerUnit);
                     if(!node.active) node.active = true;
                     node.parent = this.playerUnit.parent;
                     this._playerList.push(node.getComponent("PlayerUnitInRequestLayer"));

                 }else{
                     if(!this._playerList[index].node.active) this._playerList[index].node.active = true;
                 }

                 return this._playerList[index];
             },

             processEvent: function (event) {
                 let msg_id = event['msg_id'];
                 switch (msg_id) {
                     case C2G_REQ_GET_APPLY_LIST: {
                         if (event['result']) {
                             let playerlist = event['apply_list'];
                             let data = [];
                             for (let i = 0; i < playerlist.length; i++) {
                                 if (i > this.index)
                                 {
                                     break;
                                 }
                                 data.push(playerlist[i]);
                             }
                             this._dataSource.data = data;
                         }
                     }
                         break;
                     case C2G_REQ_AGREE_JOIN_APPLY:
                     {
                         if (event['result']) {

                             //从列表里面删除
                             let data = this._dataSource.data;
                             for(let i = 0;i < data.length;i += 1)
                             {
                                 if(data[i][0] == event["id"])
                                 {
                                     data.splice(i, 1);
                                     this._playerList[i].node.active = false;
                                     this._playerList.splice(i,1);
                                     break;
                                 }
                             }
                             this._dataSource.data = data;
                             if (this._dataSource.data.length == 0)
                             {
                                 EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                             }
                             KeyValueManager['msg_text'] ='加入队伍';
                             EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                             let event1 = {
                                 url:KeyValueManager['server_url'],
                                 msg_id:C2G_REQ_GET_TEAM_INFO,
                                 user_id:KeyValueManager['player_data']['user_id'],
                                 id:KeyValueManager['player_data']['player_info']['team'],
                                 session_key: KeyValueManager['session'],
                             };
                             NetManager.sendMsg(event1);
                         }
                         else
                         {
                            if(event['error_code'] == 91001)
                            {
                                KeyValueManager['msg_text'] ='已加入另一队伍';
                                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                            }
                            else if(event['error_code'] == 91007)
                            {
                                KeyValueManager['msg_text'] ='队伍人数超过上限';
                                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                            }

                         }
                     }
                         break;
                 }
             },
    onDisable: function () {
                 EventManager.removeHandler(C2G_REQ_GET_APPLY_LIST, this);
                 EventManager.removeHandler(C2G_REQ_AGREE_JOIN_APPLY, this);
                 for(let i = 0;i < this._playerList.length;i += 1){
                     if(this._playerList[i].node.active)
                         this._playerList[i].node.active = false;
                 }
                 let clip = this.getComponent(cc.Animation);
                 if (clip && clip.currentClip) {
                     clip.stop();
                 }

             },
             // use this for initialization
             onLoad: function () {
                 this._playerList = [];
                 this._playerList.push(this.playerUnit.getComponent('PlayerUnitInRequestLayer'));
                 this.reuse();
             },

             // called every frame, uncomment this function to activate update callback
             // update: function (dt) {

             // },
         });

