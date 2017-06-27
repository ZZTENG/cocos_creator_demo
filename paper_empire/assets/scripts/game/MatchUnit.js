/**
 * Created by ZZTENG on 2017/03/31.
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
        head: [cc.Sprite],
        memberName: [cc.Label],
        _roomId: null,
    },
    onClick: function (event, id) {
        switch (id) {
            case 'watch': {
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_WATCH_BATTLE,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                    room_id: this._roomId
                };
                NetManager.sendMsg(event1);
            }
            break;
        }
    },
    setData: function (data, index) {
        this._roomId = data[0];
        this.memberName[0].string = data[1][0];
        this.memberName[1].string = data[2][0];
    },
    processEvent: function (event) {
      let msg_id = event['msg_id'];
      switch (msg_id){
          case C2G_REQ_WATCH_BATTLE: {
              if(event['result']){
                  KeyValueManager['danmu'] = true;
                  KeyValueManager['roomId'] = this._roomId;
                  KeyValueManager['camps'] = event['camps'];
                  KeyValueManager['camp'] = -1          //模拟自己为-1
                  KeyValueManager['name'] = event['name'];
                  KeyValueManager['rank'] = event['rank'];
                  KeyValueManager['currentTime'] = event['time'] * 1000;
                  KeyValueManager['startMap'] = event['map_data'];
                  KeyValueManager['width'] = event['width'];
                  KeyValueManager['height'] = event['height'];
                  let theme_id = event['theme'];
                  for(let i in theme_id){
                      let id = theme_id[i];
                      let teamType = i;
                      cc.loader.loadRes(KeyValueManager['csv_kv']['theme_path']['value'] + KeyValueManager['csv_theme'][id]['Theme'], cc.Prefab,
                          function (err, prefab) {
                              KeyValueManager['themeList'][teamType] = prefab;
                          });
                  }
                  Utils.enterGameScene();
                  cc.director.loadScene('loading');
              }
          }
          break;
      }

    },
    // use this for initialization
    onLoad: function () {

    },
    onEnable: function () {
        EventManager.registerHandler(C2G_REQ_WATCH_BATTLE, this);
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_WATCH_BATTLE, this);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});