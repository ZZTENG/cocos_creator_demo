const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
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
        loadingBar: cc.ProgressBar,
        loadingTip: cc.Node,
        loadingOver: false,
        wait_game_start: null
    },
    onDestroy:function () {
        EventManager.removeHandler(C2G_REQ_GAME_START, this);
        cc.loader.onProgress = null;
    },
    // use this for initialization
    onLoad: function () {
        EventManager.registerHandler(C2G_REQ_GAME_START, this);
        KeyValueManager['screen_direct'] = ScreenDirect.Portrait;
        this.loadingOver = false;
        let self = this;

        cc.loader.onProgress =function (complete, total) {
            if(KeyValueManager['loadProcess'] < KeyValueManager['loadTotalCount'])
            {
                self.loadingBar.progress = (KeyValueManager['loadProcess'] + complete / total) / KeyValueManager['loadTotalCount'];
                let barPos = self.loadingBar.node.getPosition();
                self.loadingTip.setPosition(barPos.x + self.loadingBar.totalLength * (self.loadingBar.progress - 0.5), barPos.y);
                // if (complete == total) {
                //     KeyValueManager['onLoadingFinished'].call();
                // }
            }

        };
        KeyValueManager['loadingFunc'].call(this, function (complete, total) {


            if (complete == total) {
                self.loadingOver = true;
                if(KeyValueManager['onLoadingFinished'])
                    KeyValueManager['onLoadingFinished'].call();
                if(!KeyValueManager['loadingWaitMsg'] && KeyValueManager['onLoadingEnd'])
                {
                    KeyValueManager['onLoadingEnd'].call();

                }
            }
        });


    },
             processEvent: function (event) {
                 let msg_id = event['msg_id'];
                 switch (msg_id) {
                     case C2G_REQ_GAME_START:
                     {
                         if (event['result']) {
                             //theme reduce 1
                             // let themeId = KeyValueManager['themeList'][KeyValueManager['camp']];
                             // if(themeId != KeyValueManager['csv_kv']['default_theme']['value']){
                             //     Utils.useItem(ITEM_PACKAGE,themeId,'count',1);
                             // }
                             KeyValueManager['currentTime'] = event['time'] * 1000;
                             KeyValueManager['loadingWaitMsg'] = false;
                             if(this.loadingOver && KeyValueManager['onLoadingEnd'])
                             {
                                 KeyValueManager['onLoadingEnd'].call();
                             }
                         }
                     }
                         break;
                 }

             },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(!KeyValueManager['wait_game_start'])
            return;
        let time = NetManager.getCurrentTime();
        if(!this.wait_game_start)
            this.wait_game_start = time;
        if(time - this.wait_game_start > WAIT_GAME_START){
            delete KeyValueManager['wait_game_start'];
            let event1 = {
                url:KeyValueManager['server_url'],
                msg_id: C2G_REQ_WAIT_GAME_START,
                user_id:KeyValueManager['player_data']['user_id'],
                session_key: KeyValueManager['session'],
            };
            NetManager.sendMsg(event1);
        }
    },
});
