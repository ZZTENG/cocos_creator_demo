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
        roomIdLabel: cc.Label,
        prepare: cc.Node,
        cancelPrepare: cc.Node,
        memberList:[require('CustomMemberUnit')],
        toggle: [cc.Toggle],
        _dataSource: null,
        _canChage: null,
        _camp: null
    },
    onTeamUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getTeamElement:function (index) {
        return this.memberList[index];
    },
    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_ENTER_GAME_ROOM, this);
        EventManager.registerHandler(C2G_REQ_EXIT_GAME_ROOM, this);
        EventManager.registerHandler(C2G_REQ_CHANGE_TEAM, this);
        EventManager.registerHandler(C2G_REQ_READY, this);
        EventManager.registerHandler(C2G_REQ_CANCEL_READY, this);

        this._canChage = true;
        for(let i = 0; i < this.toggle.length; i += 1){
            if(i == 0){
                this.toggle[i].isChecked = true;
                continue;
            }
            this.toggle[i].isChecked = false;
        }
        this.roomIdLabel.string = KeyValueManager['roomId'];
        this._dataSource = this.getComponent('DataSource');
        this._dataSource = this._dataSource.getUnit();
        this._dataSource.host = this;
        this._dataSource.bindFunc = this.onTeamUnit;
        this._dataSource.getElementFunc = this.getTeamElement;
        let data = [];
        for (let i = 0; i < 6; ++i ){
            if(KeyValueManager['customData'][i]){
                if(KeyValueManager['customData'][i][0] == KeyValueManager['player_data']['player_info']['name'])
                    this._camp = i;
                let memberData = Utils.deepCopy(KeyValueManager['customData'][i]);
                data.push(memberData);
            }
            else {
                data.push(0);
            }
        }
        this._dataSource.data = data;
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip) {
            clip.play();
        }
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_ENTER_GAME_ROOM, this);
        EventManager.removeHandler(C2G_REQ_EXIT_GAME_ROOM, this);
        EventManager.removeHandler(C2G_REQ_CHANGE_TEAM, this);
        EventManager.removeHandler(C2G_REQ_READY, this);
        EventManager.removeHandler(C2G_REQ_CANCEL_READY, this);

        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }
    },
    processEvent: function (event) {
      let msg_id = event['msg_id'];
      switch (msg_id){
          case C2G_REQ_ENTER_GAME_ROOM:{
              if(event['result']){
                  let custom_data = event['data']
                  for(let i in custom_data){
                      KeyValueManager['customData'][i] = custom_data[i];
                  }
                  KeyValueManager['roomId'] = event['room_id'];
                  KeyValueManager['camp'] = event['camp'];
                  let data = [];
                  for (let i = 0; i < 6; ++i ){
                      if(KeyValueManager['customData'][i]){
                          let memberData = Utils.deepCopy(KeyValueManager['customData'][i]);
                          data.push(memberData);
                      }
                      else {
                          data.push(0);
                      }
                  }
                  this._dataSource.data = data;
              }
          }
          break;
          case C2G_REQ_READY: {
              if(event['result']) {
                  let camp = event['camp'];
                  if(camp == this._camp){
                      this.prepare.active = false;
                      this.cancelPrepare.active = true;
                  }
                  KeyValueManager['customData'][camp][3] = true;
                  let data = KeyValueManager['customData'][camp];
                  this.memberList[camp].setData(data);
              }
          }
          break;
          case C2G_REQ_CANCEL_READY: {
              if(event['result']) {
                  let camp = event['camp'];
                  if(camp == this._camp){
                      this.prepare.active = true;
                      this.cancelPrepare.active = false;
                  }
                  KeyValueManager['customData'][camp][3] = false;
                  let data = KeyValueManager['customData'][camp];
                  this.memberList[camp].setData(data);
              }
          }
          break;
          case C2G_REQ_CHANGE_TEAM: {
              if (event['result']) {
                  let camp = event['camp'];
                  cc.log(camp, event['camp']);
                  let new_team = event['new_team'];
                  KeyValueManager['customData'][camp][4] = new_team;
                  let data = KeyValueManager['customData'][camp];
                  this.memberList[camp].setData(data);
              }
          }
          break;
          case C2G_REQ_EXIT_GAME_ROOM: {
              if (event['result']) {
                  let camp = event['camp'];
                  if(camp || camp == 0) {
                      KeyValueManager['customData'][camp] = 0;
                      let data = KeyValueManager['customData'][camp];
                      this.memberList[camp].setData(data);
                  }
              }
          }
          break;
      }
    },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
    onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case 'share': {

            }
            break;
            case 'return': {
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_EXIT_GAME_ROOM ,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                    room_id: KeyValueManager['roomId']
                };
                NetManager.sendMsg(event1);
                delete KeyValueManager['roomId'];
                let clip = this.getComponent(cc.Animation);
                let clips = clip.getClips();
                if (clips && clips[1]) {
                    KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
                }
                KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
            }
            break;
            case 'change': {
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'choose_theme_layer', 'hide_preLayer':false});
            }
            break;
            case 'prepare': {
                this._canChage = false;
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_READY,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                    room_id: KeyValueManager['roomId']
                };
                NetManager.sendMsg(event1);
            }
            break;
            case 'cancel_prepare': {
                this._canChage = true;
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_CANCEL_READY ,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                    room_id: KeyValueManager['roomId']
                };
                NetManager.sendMsg(event1);
            }
            break;
            case 'team1':{
                if(this._canChage) {
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    KeyValueManager['customData'][KeyValueManager['camp']][4] = 0;
                    let data = KeyValueManager['customData'][KeyValueManager['camp']];
                    this.memberList[KeyValueManager['camp']].setData(data);
                    let event1 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_CHANGE_TEAM,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        new_team: 0,
                        old_team: old_team,
                        room_id: KeyValueManager['roomId']
                    };
                    NetManager.sendMsg(event1);
                }
                else {
                    this.toggle[0].isChecked = false;
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    this.toggle[old_team].isChecked = true;
                    KeyValueManager['msg_text'] ='准备时不能换队伍';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
            case 'team2':{
                if(this._canChage) {
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    KeyValueManager['customData'][KeyValueManager['camp']][4] = 1;
                    let data = KeyValueManager['customData'][KeyValueManager['camp']];
                    this.memberList[KeyValueManager['camp']].setData(data);
                    let event1 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_CHANGE_TEAM,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        new_team: 1,
                        old_team: old_team,
                        room_id: KeyValueManager['roomId']
                    };
                    NetManager.sendMsg(event1);
                }
                else {
                    this.toggle[1].isChecked = false;
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    this.toggle[old_team].isChecked = true;
                    KeyValueManager['msg_text'] ='准备时不能换队伍';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
            case 'team3': {
                if (this._canChage) {
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    KeyValueManager['customData'][KeyValueManager['camp']][4] = 2;
                    let data = KeyValueManager['customData'][KeyValueManager['camp']];
                    this.memberList[KeyValueManager['camp']].setData(data);
                    let event1 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_CHANGE_TEAM,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        new_team: 2,
                        old_team: old_team,
                        room_id: KeyValueManager['roomId']
                    };
                    NetManager.sendMsg(event1);
                }
                else {
                    this.toggle[2].isChecked = false;
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    this.toggle[old_team].isChecked = true;
                    KeyValueManager['msg_text'] ='准备时不能换队伍';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
            case 'team4': {
                if (this._canChage) {
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    KeyValueManager['customData'][KeyValueManager['camp']][4] = 3;
                    let data = KeyValueManager['customData'][KeyValueManager['camp']];
                    this.memberList[KeyValueManager['camp']].setData(data);
                    let event1 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_CHANGE_TEAM,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        new_team: 3,
                        old_team: old_team,
                        room_id: KeyValueManager['roomId']
                    };
                    NetManager.sendMsg(event1);
                }
                else {
                    this.toggle[3].isChecked = false;
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    this.toggle[old_team].isChecked = true;
                    KeyValueManager['msg_text'] ='准备时不能换队伍';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
            case 'team5':{
                if(this._canChage) {
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    KeyValueManager['customData'][KeyValueManager['camp']][4] = 4;
                    let data = KeyValueManager['customData'][KeyValueManager['camp']];
                    this.memberList[KeyValueManager['camp']].setData(data);
                    let event1 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_CHANGE_TEAM,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        new_team: 4,
                        old_team: old_team,
                        room_id: KeyValueManager['roomId']
                    };
                    NetManager.sendMsg(event1);
                }
                else {
                    this.toggle[4].isChecked = false;
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    this.toggle[old_team].isChecked = true;
                    KeyValueManager['msg_text'] ='准备时不能换队伍';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
            case 'team6': {
                if (this._canChage) {
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    KeyValueManager['customData'][KeyValueManager['camp']][4] = 5;
                    let data = KeyValueManager['customData'][KeyValueManager['camp']];
                    this.memberList[KeyValueManager['camp']].setData(data);
                    let event1 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_CHANGE_TEAM,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        new_team: 5,
                        old_team: old_team,
                        room_id: KeyValueManager['roomId']
                    };
                    NetManager.sendMsg(event1);
                }
                else {
                    this.toggle[5].isChecked = false;
                    let old_team = KeyValueManager['customData'][KeyValueManager['camp']][4];
                    this.toggle[old_team].isChecked = true;
                    KeyValueManager['msg_text'] ='准备时不能换队伍';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
        }

    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});