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
    },
             onClick: function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
                 switch (id) {
                     case "cancel": {

                     }
                         break;
                     case "retry": {
                         this.reconnect();
                     }
                         break;
                     default:
                     {
                         break;
                     }
                 }
             },
    // use this for initialization

             onLoad: function () {


                 // this.reuse();
             },

            reconnect:function () {
                NetManager.disconnectServer();
                NetManager.connectToServer(NetManager.serverAddr, NetManager.serverPort,function (result) {
                    if(result == 1)
                    {
                        let event1 = {
                            url:KeyValueManager['server_url'],
                            msg_id:C2G_REQ_HEARTBEAT ,
                            user_id:KeyValueManager['player_data']['user_id'],
                            session_key: KeyValueManager['session'],
                        };
                        NetManager.sendMsg(event1);
                        if(cc.sys.isNative) {
                            NetManager.sendMsg(KeyValueManager['Reconnect_Event']);
                            var event = EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
                        }
                        else if(cc.sys.isBrowser){
                            KeyValueManager['reconnect_layer'].active = false;
                        }
                        EventManager.pushEvent(event);
                    }
                    else
                    {
                        //显示隐藏按钮

                    }
                });
            },
             onEnable:function () {
                 this.reconnect();
                 let clip = this.getComponent(cc.Animation);
                 if (clip && clip.defaultClip) {
                     clip.play();
                 }
             },

    onDisable: function () {
                 let clip = this.getComponent(cc.Animation);
                 if (clip && clip.currentClip) {
                     clip.stop();
                 }

             },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
