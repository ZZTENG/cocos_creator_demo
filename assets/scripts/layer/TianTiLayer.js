/**
 * Created by ZZTENG on 2017/03/01.
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
        time: cc.Label,
        join: cc.Node,
        cancelJoin: cc.Node,
        rate: cc.Label,
        game_count: cc.Label,
        team_name: require('LabelLocalized'),
        team_logo: cc.Sprite
    },

    // use this for initialization
    onLoad: function () {
        if(KeyValueManager['player_data']['player_info']['order']){
            if(KeyValueManager['player_data']['player_info']['order'] == 47){
                this.join.active = false;
                this.cancelJoin.active = true;
            }
        }
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler('UPDATE_TIME', this);
        EventManager.registerHandler(C2G_REQ_SIGN_UP, this);
        EventManager.registerHandler(C2G_REQ_CANCEL_SIGN_UP , this);
        let self = this;
        if(KeyValueManager['player_data']['player_info']['team'] && KeyValueManager['player_data']['player_info']['team_info']) {
            if (KeyValueManager['player_data']['player_info']['team_info']['game_count'])
                this.game_count.string = KeyValueManager['player_data']['player_info']['team_info']['game_count'];
            if (KeyValueManager['player_data']['player_info']['team_info']['rate'])
                this.rate.string = KeyValueManager['player_data']['player_info']['team_info']['rate'] + '%';
            if(KeyValueManager['player_data']['player_info']['team_info']['name'])
                this.team_name.string = KeyValueManager['player_data']['player_info']['team_info']['name'];
            if(KeyValueManager['player_data']['player_info']['team_info']['logo']) {
                let logoId = KeyValueManager['player_data']['player_info']['team_info']['logo'];
                cc.loader.loadRes(KeyValueManager['csv_kv']['logo_path']['value'] + KeyValueManager['csv_teamlogo'][logoId]['TeamLogo'], cc.SpriteFrame, function (err, spriteFrame) {
                    if (err) {
                        return ('load fail');
                    }
                    else {
                        self.team_logo.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                        cc.loader.setAutoReleaseRecursively(spriteFrame,true);
                    }
                });
            }
        }

        KeyValueManager['startHour'] = 23;
        KeyValueManager['startMinute'] = 30;
    },
    onDisable: function () {
        EventManager.removeHandler('UPDATE_TIME', this);
        EventManager.removeHandler(C2G_REQ_SIGN_UP, this);
        EventManager.removeHandler(C2G_REQ_CANCEL_SIGN_UP , this);
    },
    processEvent: function (event) {
      let msg_id = event['msg_id'];
      switch (msg_id){
          case 'UPDATE_TIME': {
              let startHour = null;
              let startMinute = null;
              if(KeyValueManager['startHour'] >= 10)
                  startHour = String(KeyValueManager['startHour']);
              else
                  startHour = '0' + String(KeyValueManager['startHour']);
              if(KeyValueManager['startMinute'] >= 10)
                  startMinute = String(KeyValueManager['startMinute']);
              else
                  startMinute = '0' + String(KeyValueManager['startMinute']);
              this.time.string = startHour + ':' + startMinute;
              let gameCount = this.gameCount();
              if(KeyValueManager['player_data']['player_info']['order']){
                  if(KeyValueManager['player_data']['player_info']['order'] == gameCount){
                      this.join.active = false;
                      this.cancelJoin.active = true;
                  }
                  else {
                      this.join.active = true;
                      this.cancelJoin.active = false;
                  }
              }
          }
          break;
          case C2G_REQ_SIGN_UP: {
              if(event['result']){
                  this.join.active = false;
                  this.cancelJoin.active = true;
                  KeyValueManager['msg_text'] ='报名成功';
                  EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
              }
              else if(event['error_code'] == 93013){
                  KeyValueManager['msg_text'] ='当前场次已经开赛';
                  EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
              }
          }
          break;
          case C2G_REQ_CANCEL_SIGN_UP: {
              if(event['result']){
                  this.join.active = true;
                  this.cancelJoin.active = false;
                  KeyValueManager['msg_text'] ='取消成功';
                  EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
              }
              else if(event['error_code'] == 93013){
                  KeyValueManager['msg_text'] ='当前场次已经开赛';
                  EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
              }
          }
          break;
      }
    },
    gameCount: function () {
      let gameCount = KeyValueManager['startHour'] * 2;
      if(KeyValueManager['startMinute'] == 30)
          gameCount += 1;
      return gameCount;
    },
    onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case 'join': {
                let order = this.gameCount();
                let mate_count = 0;
                if(KeyValueManager['player_data']['player_info']['team_info']
                    && KeyValueManager['player_data']['player_info']['team_info']['mate_count'])
                    mate_count = KeyValueManager['player_data']['player_info']['team_info']['mate_count'];
                if(mate_count == 3){
                    KeyValueManager['player_data']['player_info']['order'] = order;
                    let event1 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_SIGN_UP,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        order: order
                    };
                    NetManager.sendMsg(event1);
                }
                else {
                    KeyValueManager['msg_text'] ='队伍人数不足';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
            case 'cancelJoin': {
                let order = this.gameCount();
                delete KeyValueManager['player_data']['player_info']['order'];
                Utils.savePlayerData();
                let event1 = {
                    url: KeyValueManager['server_url'],
                    msg_id: C2G_REQ_CANCEL_SIGN_UP,
                    user_id: KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                    order: order
                };
                NetManager.sendMsg(event1);
            }
            break;
            case 'return': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
            }
            break;
            case 'record': {
                KeyValueManager['record_mode'] = RecordMode.MODE_TIANTI;
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'tianti_record_layer', 'hide_preLayer':false});
            }
            break;
            case 'tianti': {
                if (KeyValueManager['player_data']['player_info']['order']) {
                    let data = new Date();
                    let currentTime = (data.getHours() * 60 + data.getMinutes()) * 60 * 1000;
                    let gameStartTime = (KeyValueManager['startHour'] * 60 + KeyValueManager['startMinute']) * 60 * 1000;
                    let gameEndTime = (KeyValueManager['endHour'] * 60 + KeyValueManager['endMinute']) * 60 * 1000;
                    let oneDay = 24 * 60 * 60 * 1000;
                    if (gameEndTime < gameStartTime)
                        gameEndTime = oneDay;
                    if (currentTime > gameStartTime && currentTime < gameEndTime) {
                        EventManager.pushEvent({
                            'msg_id': 'OPEN_LAYER',
                            'layer_id': 'automatch_layer',
                            'hide_preLayer': false
                        });
                    }
                    else {
                        KeyValueManager['msg_text'] = '不在参赛时间范围内';
                        EventManager.pushEvent({
                            'msg_id': 'OPEN_LAYER',
                            'layer_id': 'msg_layer',
                            'hide_preLayer': false
                        });
                    }
                }
                else {
                    KeyValueManager['msg_text'] ='未报名参赛';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
            case 'time': {
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'tianti_addin_layer', 'hide_preLayer':false});
            }
            break;
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});