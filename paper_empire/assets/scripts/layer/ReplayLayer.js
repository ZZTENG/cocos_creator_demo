/**
 * Created by ZZTENG on 2017/03/20.
 **/
const EventManager = require('EventManager');
const KeyValueManager = require('KeyValueManager');
const NetManager = require('NetManager');
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
        roundLabel: cc.Label,
        speed: cc.Label,
        initRoundTime: null,
        speedCount: null
    },

    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
        KeyValueManager['round_time'] = ROUND_TIME;
        this.initRoundTime = KeyValueManager['round_time'];
        this.speedCount = 0;
        this.roundLabel.string = KeyValueManager['roundCount'];
        let self = this;
        // this.node.on('touchmove',function (event) {
        //     Utils.nodeMove(event,self.node);
        // },this);
        let clip = this.getComponent(cc.Animation);
        if (clip) {
            clip.play();
        }
    },
    onDisable: function () {
        let clip = this.getComponent(cc.Animation);
        if (clip) {
            clip.stop();
        }
    },
    onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case 'play': {
                KeyValueManager['history'] = {}
                KeyValueManager['initReplay'] = true;
                KeyValueManager['history_start'] = 0;
                let start = KeyValueManager['history_start'];
                KeyValueManager['history_start'] += HISTORY_TURN_COUNT;
                let end = KeyValueManager['history_start'];
                let event1 = {
                    url:KeyValueManager['server_url'],
                    msg_id:C2G_REQ_WATCH_HISTORY,
                    user_id:KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                    start: start,
                    end: end,
                    id:KeyValueManager['gameId']
                };
                NetManager.sendMsg(event1);
            }
            break;
            case 'exit': {
                KeyValueManager['GameOver'] = false;
                KeyValueManager['onLoadingEnd'] = function () {
                    cc.director.loadScene(KeyValueManager['preloadScene'],function () {
                        if(KeyValueManager['record_mode'] || KeyValueManager['record_mode'] == 0){
                            EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'player_info_layer','hide_preLayer': false});
                        }
                    });
                };
                KeyValueManager['onLoadingFinished']= function () {

                };
                KeyValueManager['loadingFunc'] = function (onProgress) {
                    KeyValueManager['loadProcess'] = 0;
                    KeyValueManager['loadTotalCount'] = 0;
                    KeyValueManager['preloadScene'] = 'main';
                    cc.director.preloadScene('main', function (error, asset) {
                        if (onProgress) {
                            onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                        }
                    });
                    KeyValueManager['loadTotalCount']++;
                };
                cc.director.loadScene('loading');
            }
            break;
            case 'x2' : {
                let round_time = null;
                if(this.speedCount == 0){
                    this.speedCount += 1;
                    round_time = this.initRoundTime / 2;
                    this.speed.string = 'x2';
                }
                else if(this.speedCount == 1){
                    this.speedCount += 1;
                    round_time = this.initRoundTime / 4;
                    this.speed.string = 'x4';
                }
                else if(this.speedCount == 2){
                    this.speedCount = 0;
                    round_time = this.initRoundTime / 8
                    this.speed.string = 'x8';
                }
                KeyValueManager['round_time'] = round_time;
                KeyValueManager['fastCurrentTime'] = NetManager.getCurrentMT() - KeyValueManager['timeDiff'] - KeyValueManager['currentTime'];
                KeyValueManager['fastCurrentRound'] = KeyValueManager['roundCount'];
            }
            break;
        }
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.roundLabel.string = KeyValueManager['roundCount'];
    },
});