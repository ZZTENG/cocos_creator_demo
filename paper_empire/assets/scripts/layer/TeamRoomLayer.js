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
         prepare: cc.Node,
         cancelPrepare: cc.Node,
         teamLogo: [cc.Sprite],
         teamName: [cc.Label],
         crown: [cc.Node],
         teamMemberList:[require('TeamMemberUnit')],
         _dataSource:null,
     },
     onClick:function (event, id) {
         if(id){
             cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
         }
         switch (id) {
             case 'return': {
                     let event1 = {
                         url:KeyValueManager['server_url'],
                         msg_id:C2G_REQ_EXIT_GAME_ROOM  ,
                         user_id:KeyValueManager['player_data']['user_id'],
                         session_key: KeyValueManager['session'],
                         room_id: KeyValueManager['roomId']
                     };
                     NetManager.sendMsg(event1);
                     EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                 }
                 break;
             case 'change': {
                     EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'choose_theme_layer', 'hide_preLayer':false});
                 }
                 break;
             case 'prepare': {
                     let event1 = {
                         url:KeyValueManager['server_url'],
                         msg_id:C2G_REQ_READY,
                         user_id:KeyValueManager['player_data']['user_id'],
                         session_key: KeyValueManager['session'],
                         room_id: KeyValueManager['roomId']
                     };
                     NetManager.sendMsg(event1);
                     this.prepare.active = false;
                     this.cancelPrepare.active = true;
                     KeyValueManager['memberData'][KeyValueManager['camp']][3] = true;
                     let data = KeyValueManager['memberData'][KeyValueManager['camp']];
                     this.teamMemberList[KeyValueManager['camp']].setData(data);
                 }
                 break;
             case 'cancel_prepare': {
                     let event1 = {
                         url:KeyValueManager['server_url'],
                         msg_id:C2G_REQ_CANCEL_READY ,
                         user_id:KeyValueManager['player_data']['user_id'],
                         session_key: KeyValueManager['session'],
                         room_id: KeyValueManager['roomId']
                     };
                     NetManager.sendMsg(event1);
                     this.prepare.active = true;
                     this.cancelPrepare.active = false;
                     KeyValueManager['memberData'][KeyValueManager['camp']][3] = false;
                     let data = KeyValueManager['memberData'][KeyValueManager['camp']];
                     this.teamMemberList[KeyValueManager['camp']].setData(data);
                 }
                 break;
         }
     },
    onTeamUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getTeamElement:function (index) {
        return this.teamMemberList[index];
    },
     // use this for initialization
     onLoad: function () {
         this.reuse();
     },
     reuse:function () {
         EventManager.registerHandler(C2G_REQ_EXIT_GAME_ROOM, this);
         EventManager.registerHandler(C2G_REQ_READY, this);
         EventManager.registerHandler(C2G_REQ_CANCEL_READY, this);
         EventManager.registerHandler(C2G_REQ_TEAM_ENTER_ROOM , this);

         KeyValueManager['memberData'] = {};
         for(let i = 0;i < this.crown.length;i += 1)
             this.crown[i].active = false;
         this._dataSource = this.getComponent('DataSource');
         this._dataSource = this._dataSource.getUnit();
         this._dataSource.host = this;
         this._dataSource.bindFunc = this.onTeamUnit;
         this._dataSource.getElementFunc = this.getTeamElement;
         this.setDataSource();
         let clip = this.getComponent(cc.Animation);
         if (clip && clip.defaultClip) {
             clip.play();
         }
     },

    onDisable: function () {
         EventManager.removeHandler(C2G_REQ_EXIT_GAME_ROOM, this);
         EventManager.removeHandler(C2G_REQ_READY, this);
         EventManager.removeHandler(C2G_REQ_CANCEL_READY, this);
         EventManager.removeHandler(C2G_REQ_TEAM_ENTER_ROOM , this);

         let clip = this.getComponent(cc.Animation);
         if (clip && clip.currentClip) {
             clip.stop();
         }
     },
    setDataSource: function () {
        let data = [];
        for (let i = 0; i < 2; ++i ){
            if(KeyValueManager['teamRoomData'][i].length > 0){
                let self = this;
                let memberData = KeyValueManager['teamRoomData'][i];
                this.crown[memberData[0]].active = true;
                this.teamName[i].node.active = true;
                this.teamName[i].string = memberData[1];
                if(memberData[2]) {
                    cc.loader.loadRes(KeyValueManager['csv_kv']['logo_path']['value'] + KeyValueManager['csv_teamlogo'][memberData[2]]['TeamLogo'], cc.SpriteFrame, function (err, spriteFrame) {
                        if (err) {
                            cc.log(err);
                        }
                        else {
                            cc.log(i);
                            self.teamLogo[i].node.active = true;
                            self.teamLogo[i].spriteFrame = spriteFrame;
                            cc.loader.setAutoReleaseRecursively(spriteFrame,true);
                        }
                    });
                }
                //meberData[3] 观战
                for(let j in KeyValueManager['teamRoomData'][i][4]){
                    let teamData = KeyValueManager['teamRoomData'][i][4][j];
                    KeyValueManager['memberData'][j] = teamData;
                }
            }
            else {
                this.teamLogo[i].node.active = false;
                this.teamName[i].node.active = false;
            }
        }
        for(let i = 0;i < 6;i += 1){
            if(KeyValueManager['memberData'][i])
                data.push(KeyValueManager['memberData'][i]);
            else
                data.push(0);
        }
        this._dataSource.data = data;
    },
     processEvent: function (event) {
         let msg_id = event['msg_id'];
         switch (msg_id){
             case C2G_REQ_TEAM_ENTER_ROOM: {
                 if (event['result']) {
                     if (event['is_team']) {
                         KeyValueManager['teamRoomData'] = event['team_info'];
                         this.setDataSource();
                     }
                 }
             }
             break;
             case C2G_REQ_READY: {
                 let camp = event['camp'];
                 KeyValueManager['memberData'][camp][3] = true;
                 let data =  KeyValueManager['memberData'][camp];
                 this.teamMemberList[camp].setData(data);
             }
             break;
             case C2G_REQ_CANCEL_READY: {
                 let camp = event['camp'];
                 KeyValueManager['memberData'][camp][3] = false;
                 let data =  KeyValueManager['memberData'][camp];
                 this.teamMemberList[camp].setData(data);
             }
             break;
             case C2G_REQ_EXIT_GAME_ROOM: {
                 let camps = event['camps'];
                 for(let i = 0;i < camps.length;i += 1) {
                     if (camps[i] == KeyValueManager['camp']) {
                         EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                     }
                     else{
                         if(camps[i] >= 3){
                             this.teamLogo[1].node.active = false;
                             this.teamName[1].node.active = false;
                         }
                         else {
                             this.teamLogo[0].node.active = false;
                             this.teamName[0].node.active = false;
                         }
                         KeyValueManager['memberData'][camps[i]] = 0;
                         let data = KeyValueManager['memberData'][camps[i]];
                         this.teamMemberList[camps[i]].setData(data);
                     }
                 }
             }
             break;
         }
     },
     // called every frame, uncomment this function to activate update callback
     // update: function (dt) {

     // },
    });
