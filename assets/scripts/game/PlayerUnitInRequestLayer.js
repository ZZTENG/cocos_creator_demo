const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
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
                 head:cc.Sprite,
                 playerName:cc.Label,
                 headBorder:cc.Sprite,
                 rateLabel:cc.Label,
                 roundLabel:cc.Label,
                 _playerId:0,
             },
             onClick:function (event, id) {
                 if(id){
                     cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
                 }
                 switch (id) {
                     case "accept": {
                         let event = {
                             url: KeyValueManager['server_url'],
                             msg_id: C2G_REQ_AGREE_JOIN_APPLY,
                             user_id: KeyValueManager['player_data']['user_id'],
                             session_key: KeyValueManager['session'],
                             id:this._playerId,
                             type:1,
                         };
                         NetManager.sendMsg(event);
                     }
                         break;

                 }
             },
             // use this for initialization
             onLoad: function () {
                 this.reuse();
             },
             reuse: function () {
             },
             setData: function (data) {
                 this._playerId = data[0];
                 this.playerName.string = data[1];

                 this.roundLabel.string = data[3];
                 this.rateLabel.string = data[4];
             },

             // called every frame, uncomment this function to activate update callback
             // update: function (dt) {

             // },
         });
