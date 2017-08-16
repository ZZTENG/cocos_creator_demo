const EventManager = require('EventManager');
const NetManager = require('NetManager');
const KeyValueManager = require('KeyValueManager');
const MD5 = require('md5');
const UUID = require('uuid');
const CSVModel = require('CSVModel');
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
        musicURL: {
            url:cc.AudioClip,
            default: null
        },
        unlock: {
            url:cc.AudioClip,
            default: null
        },
        wrong_click: {
            url:cc.AudioClip,
            default: null
        },
        plane_click: {
            url:cc.AudioClip,
            default: null
        },
        click: {
            url:cc.AudioClip,
            default: null
        },
        win: {
            url:cc.AudioClip,
            default: null
        },
        lose: {
            url:cc.AudioClip,
            default: null
        },
        city_lose: {
            url:cc.AudioClip,
            default: null
        },
        city_win: {
            url:cc.AudioClip,
            default: null
        },
        flag: {
            url:cc.AudioClip,
            default: null
        },
        reconnect_layer: cc.Node,
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id){
                case C2G_REQ_LOGIN: {
                if (event['result']) {
                    KeyValueManager['session'] = event['session_key'];
                    KeyValueManager['player_data']['token'] = event['token'];
                    KeyValueManager['player_data']['refresh_token'] = event['refresh_token'];

                    KeyValueManager['server_url'] = event['host'] + ':' + event['port'] + '/gate_http';
                    Utils.savePlayerData();
                    let event1 = {
                        url:KeyValueManager['server_url'],
                        msg_id:C2G_REQ_PLAYER_LOGIN,
                        user_id:KeyValueManager['player_data']['user_id'],
                        session_key:KeyValueManager['session'],
                    };
                    if(KeyValueManager['platformLogin']) {
                        let url = window.location['href'];
                        let urlArr = url.split('?');
                        let objArr = urlArr[1].split('&');
                        for (let i = 0; i < objArr.length; i += 1) {
                            let arr = objArr[i].split('=');
                            if (arr[0] == 'uid') {
                                KeyValueManager['uid'] = arr[1];
                                event1['user_id'] = KeyValueManager['uid'];
                            }
                            else if(arr[0] == 'nick'){
                                let nick = decodeURIComponent(arr[1]);
                                event1[arr[0]] = nick.substr(0,7);
                                continue;
                            }
                            else if(arr[0] == 'paper_empire_gameId'){
                                KeyValueManager['gameId'] = event['paper_empire_gameId'];
                            }
                            else if(arr[0] == 'paper_empire_roomId'){
                                KeyValueManager['roomId'] = event['paper_empire_roomId'];
                            }
                            event1[arr[0]] = decodeURIComponent(arr[1]);
                        }
                    }
                    if(!NET_HTTP)
                    {
                        NetManager.disconnectServer();
                        NetManager.connectToServer(event['host'], event['port'],function (err) {
                            if(err == 1)
                                 NetManager.sendMsg(event1);
                        });
                    }
                    else
                    {
                        NetManager.sendMsg(event1);
                    }
                }
                else
                {
                    //第一次token过期，验证不过，重新登录
                    cc.sys.localStorage.removeItem('player_data')
                    cc.director.preloadScene('openning',function (error, asset) {
                        cc.director.loadScene('openning');
                    });
                    if (event['error_code'] == -1)
                    {
                        //进入离线模式
                        KeyValueManager['offline_mode'] = true;
                        //读取玩家信息
                        Utils.enterGame();
                        cc.director.loadScene('loading');
                    }
                }
            };
                break;
                case C2G_REQ_PLAYER_LOGIN:
            {
                if (event['result']) {
                    for (let i in event['data']) {
                        if(i == 'package'){          //服务端package和客户端player_package导致
                            KeyValueManager['player_data']['player_package'] = event['data']['package'];
                            continue;
                        }
                        KeyValueManager['player_data'][i] = event['data'][i];
                    }
                    if (KeyValueManager['platformLogin'])
                        KeyValueManager['player_data']['user_id'] = KeyValueManager['uid'];
                    // KeyValueManager['player_data']['player_package'] = event['data']['package'];
                    // KeyValueManager['player_data']['player_info'] = event['data']['player_info'];
                    // KeyValueManager['player_data']['player_cd_pool'] = event['data']['player_cd_pool'];
                    // KeyValueManager['player_data']['player_id'] = event['player_id'];

                    let server_time = event['server_time'] * 1000;
                    let currentTime = NetManager.getCurrentMT();
                    KeyValueManager['timeDiff'] = currentTime - server_time;
                    KeyValueManager['in_game'] = event['in_game'];
                    Utils.savePlayerData();
                    if(KeyValueManager['gameId']){
                        let event1 = {
                            url:KeyValueManager['server_url'],
                            msg_id:C2G_REQ_WATCH_HISTORY,
                            user_id:KeyValueManager['player_data']['user_id'],
                            session_key: KeyValueManager['session'],
                            start: 0,
                            end: 1,
                            id: KeyValueManager['gameId']
                        };
                        NetManager.sendMsg(event1);
                        return;
                    }
                    //掉线重连的游戏登录
                    if (KeyValueManager['in_game']) {
                        KeyValueManager['startMap'] = event['map_data'];
                        KeyValueManager['camps'] = event['camps'];
                        KeyValueManager['camp'] = event['camp'];
                        KeyValueManager['name'] = event['name'];
                        KeyValueManager['rank'] = event['rank'];
                        KeyValueManager['width'] = event['width'];
                        KeyValueManager['height'] = event['height'];
                        KeyValueManager['currentTime'] = event['start_time'] * 1000;
                        KeyValueManager['reTheme'] = event['theme'];
                    }
                    Utils.enterGame();
                    cc.director.loadScene('loading');
                }
                else {
                    cc.sys.localStorage.removeItem('player_data')
                    cc.director.preloadScene('openning',function (error, asset) {
                        cc.director.loadScene('openning');
                    });
                }

            }
                break;
            case C2G_REQ_WATCH_HISTORY: {
                if(event['result']){
                    KeyValueManager['msgData'] = event['barrage'];
                    KeyValueManager['width'] = event['width'];
                    KeyValueManager['height'] = event['height'];
                    KeyValueManager['history'] = Utils.deepCopy(event['history']);
                    if (KeyValueManager['history'][0]) {
                        if (KeyValueManager['history'][0]['name']) {
                            let name = KeyValueManager['history'][0]['name']
                            KeyValueManager['name'] = Utils.deepCopy(name);
                        }
                        if (KeyValueManager['history'][0]['panel']) {
                            let panel = KeyValueManager['history'][0]['panel']
                            KeyValueManager['panel'] = Utils.deepCopy(panel);
                        }
                        if (KeyValueManager['history'][0]['turn']) {
                            let turn = KeyValueManager['history'][0]['turn']
                            KeyValueManager['turn'] = turn + 1;
                        }
                        if (KeyValueManager['history'][0]['pid_2_camp']) {
                            let id = KeyValueManager['player_data']['player_id'];
                            let camp = KeyValueManager['history'][0]['pid_2_camp'][id];
                            KeyValueManager['camp'] = camp;
                        }
                        if (KeyValueManager['history'][0]['camps']) {
                            let camps = KeyValueManager['history'][0]['camps'];
                            KeyValueManager['camps'] = camps;
                        }
                        if (KeyValueManager['history'][0]['team_win']) {
                            let team_win = KeyValueManager['history'][0]['team_win'];
                            KeyValueManager['team_win'] = team_win;
                        }
                        if(KeyValueManager['history'][0]['theme']){
                            KeyValueManager['reTheme'] = KeyValueManager['history'][0]['theme'];
                        }
                    }
                    KeyValueManager['isReplay'] = true;
                    Utils.enterGame();
                    cc.director.loadScene('loading');
                }
            }
            break;
        };
    },

    onDestroy: function () {
        EventManager.removeHandler(C2G_REQ_LOGIN, this);
        EventManager.removeHandler(C2G_REQ_PLAYER_LOGIN, this);
        EventManager.removeHandler(C2G_REQ_WATCH_HISTORY,this);
    },
    // use this for initialization
    onLoad: function () {
        EventManager.registerHandler(C2G_REQ_LOGIN, this);
        EventManager.registerHandler(C2G_REQ_PLAYER_LOGIN, this);
        EventManager.registerHandler(C2G_REQ_WATCH_HISTORY,this);
        KeyValueManager['currentScene'] = CurrentScene.SCENE_OPENGING;
        //设置游戏帧率
        cc.game.setFrameRate(30);
        //设置游戏竖屏
        // cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
        //setting bgm
        //音效大小
        KeyValueManager['effect_volume'] = 1;
        if(typeof KeyValueManager['audioId_bgm'] == 'undefined')
            KeyValueManager['audioId_bgm'] = cc.audioEngine.play(this.musicURL,true,KeyValueManager['effect_volume']);
        //开始防沉迷动画
        let animation = this.node.getComponent(cc.Animation);
        animation.play();
        animation.on('finished',this.onFinishedAni,this);
    },
    onFinishedAni: function () {
        let self = this;
        KeyValueManager['player_data'] = {};
        KeyValueManager['themeList'] = {};
        KeyValueManager['land_around'] = {};
        KeyValueManager['order_require'] = {};
        //音效音频缓存
        KeyValueManager['unlock_clip'] = this.unlock;
        KeyValueManager['wrong_click_clip'] = this.wrong_click;
        KeyValueManager['plane_click_clip'] = this.plane_click;
        KeyValueManager['click_clip'] = this.click;
        KeyValueManager['win_clip'] = this.win;
        KeyValueManager['lose_clip'] = this.lose;
        KeyValueManager['city_win_clip'] = this.city_win;
        KeyValueManager['city_lose_clip'] = this.city_lose;
        KeyValueManager['flag_clip'] = this.flag;
        //web网络重连层,放在初始一看加载进来,设置常驻节点
        cc.game.addPersistRootNode(this.reconnect_layer);
        cc.loader.setAutoReleaseRecursively(this.reconnect_layer, false);
        KeyValueManager['reconnect_layer'] = this.reconnect_layer;
        //加载配置表
        Utils.loadCSV('csv_system', 'resources/csv/system.csv', 'ID', function () {
            Utils.loadCSV('csv_kv', 'resources/csv/kv.csv', 'key', function () {
            });
            let csv_system = KeyValueManager['csv_system'];
            let url = '';
            if(cc.sys.isBrowser)
                url = window.location['href'];
            KeyValueManager['platformLogin'] = true;
            //确定闪电玩平台（可以计算sign，计较相同来验证）
            if(url.indexOf('sign') == - 1){
                KeyValueManager['platformLogin'] = false;
            }
            if(ANDROID_CHECK){
                let channel = 'SYS001';
                KeyValueManager['channel_info'] = csv_system[channel];
                if(KeyValueManager['EncryptKey'] == 'De262tmqLW5w1zONwg6ajl63UJ7')
                    KeyValueManager['EncryptKey'] += '_' + KeyValueManager['channel_info']['key'];
                let aniCtrl = self.getComponent(cc.Animation);
                aniCtrl.play();
                cc.director.preloadScene('title', function (error, asset) {
                    cc.director.loadScene('title');
                });
                return;
            }
            // let channel = 'SYS001';
            // KeyValueManager['channel_info'] = csv_system[channel];
            // if(KeyValueManager['EncryptKey'] == 'De262tmqLW5w1zONwg6ajl63UJ7')
            //     KeyValueManager['EncryptKey'] += '_' + KeyValueManager['channel_info']['key'];
            // let aniCtrl = self.getComponent(cc.Animation);
            // aniCtrl.play();
            // cc.director.preloadScene('title', function (error, asset) {
            //     cc.director.loadScene('title');
            // });

            if(KeyValueManager['platformLogin']){
                let channel = 'SYS001';
                KeyValueManager['channel_info'] = csv_system[channel];
                if(KeyValueManager['EncryptKey'] == 'De262tmqLW5w1zONwg6ajl63UJ7')  //以防多次进行+
                    KeyValueManager['EncryptKey'] += '_' + KeyValueManager['channel_info']['key'];
                Utils.platformLogin();
            }
           else {
                let player_data = cc.sys.localStorage.getItem('player_data');
                if (player_data && JSON.parse(player_data)['token']) {
                    KeyValueManager['player_data'] = JSON.parse(player_data);

                    //自动登录
                    let user_id = KeyValueManager['player_data']['user_id'];
                    let channel = KeyValueManager['player_data']['channel'];
                    if (!channel)
                        channel = 'SYS001';
                    KeyValueManager['channel_info'] = csv_system[channel];
                    if(KeyValueManager['EncryptKey'] == 'De262tmqLW5w1zONwg6ajl63UJ7')  //以防多次进行+
                        KeyValueManager['EncryptKey'] += '_' + KeyValueManager['channel_info']['key'];
                    let token = KeyValueManager['player_data']['token'];
                    let refresh_token = KeyValueManager['player_data']['refresh_token'];
                    Utils.guestLogin(user_id, token, refresh_token);
                }
                else {
                    //这里取推荐服务器
                        let channel = 'SYS001';
                    KeyValueManager['channel_info'] = csv_system[channel];
                    if(KeyValueManager['EncryptKey'] == 'De262tmqLW5w1zONwg6ajl63UJ7')
                        KeyValueManager['EncryptKey'] += '_' + KeyValueManager['channel_info']['key'];
                    let aniCtrl = self.getComponent(cc.Animation);
                    aniCtrl.play();
                    cc.director.preloadScene('title', function (error, asset) {
                        cc.director.loadScene('title');
                    });

                }
            }
        });
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
