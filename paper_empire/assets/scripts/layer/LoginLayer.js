const EventManager = require('EventManager');
const NetManager = require('NetManager');
const KeyValueManager = require('KeyValueManager');
const MD5 = require('md5');
const UUID = require('uuid');
const CSVModel = require('CSVModel');
const Utils = require('utils');
const LoginState = {
    RESITER: 1,
    LOGIN: 2,
};
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
        accountNode:cc.Node,
        pwdNode:cc.Node,
        _state: null,
    },
    onClickLogin:function (event, data) {
        let accountEdit = this.accountNode.getComponent(cc.EditBox);
        let pwdEdit = this.pwdNode.getComponent(cc.EditBox);
        if(!accountEdit.string)
        {
            KeyValueManager['msg_text'] = '帐号不能是空';
            EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
            return;
        }
        else if(!pwdEdit.string)
        {
            KeyValueManager['msg_text'] = '密码不能是空';
            EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
            return;
        }
        let pwd = MD5.hex_md5(pwdEdit.string);
        KeyValueManager['server_url'] = KeyValueManager['channel_info']['LoginURL'] + ':' + KeyValueManager['channel_info']['LoginPort'] + '/auth';
        let event1 = {
            url:KeyValueManager['server_url'],
            msg_id:C2A_HTTP_AUTH,
            auth_type:0,
            user_name:accountEdit.string,
            password:pwd
        };

        NetManager.sendMsg(event1);



    },
    onResiter: function () {
        this._state = LoginState.RESITER;
        KeyValueManager['server_url'] = KeyValueManager['channel_info']['LoginURL'] + ':' + KeyValueManager['channel_info']['LoginPort'] + '/auth';
        let device_id = UUID.genV1().toString();
        let event = {
            url:KeyValueManager['server_url'],
            msg_id:C2A_HTTP_AUTH,
            auth_type:1,
            device_id:device_id,
            user_name:UUID.genV1().toString()
        };
        if(!NET_HTTP)
        {
            NetManager.disconnectServer();
            NetManager.connectToServer(KeyValueManager['channel_info']['LoginURL'], KeyValueManager['channel_info']['LoginPort'],function (err) {
                if(err == 1)
                    NetManager.sendMsg(event);
            });
        }
        NetManager.sendMsg(event);
    },
    onClickGuest:function () {
        this._state = LoginState.LOGIN;
        KeyValueManager['server_url'] = KeyValueManager['channel_info']['LoginURL'] + ':' + KeyValueManager['channel_info']['LoginPort'] + '/auth';
        let device_id = UUID.genV1().toString();
        // if (cc.sys.isMobile && cc.sys.isNative)
        // {
        //     cc.log('cc.sys.isMobile');
        //     if(cc.sys.platform == cc.sys.ANDROID)
        //     {
        //         device_id = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "sdks", "(Ljava/lang/String;Ljava/lang/String;)V", "title", "hahahahha");
        //     }
        //     else
        //     {
        //         device_id = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "sdks", "(Ljava/lang/String;Ljava/lang/String;)V", "title", "hahahahha");
        //     }
        if(ANDROID_CHECK) {         //版本审核
            let accountEdit = this.accountNode.getComponent(cc.EditBox);
            if (!accountEdit.string) {
                KeyValueManager['msg_text'] = '帐号不能是空';
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer': false});
                return;
            }
        }
        let event = {
            url:KeyValueManager['server_url'],
            msg_id:C2A_HTTP_AUTH,
            auth_type:1,
            device_id:device_id,
            user_name:UUID.genV1().toString()
        };
        if(!NET_HTTP)
        {
            NetManager.disconnectServer();
            NetManager.connectToServer(KeyValueManager['channel_info']['LoginURL'], KeyValueManager['channel_info']['LoginPort'],function (err) {
                if(err == 1)
                    NetManager.sendMsg(event);
            });
        }
    },
    onDestroy: function () {
        EventManager.removeHandler(C2A_HTTP_AUTH, this);
        EventManager.removeHandler(C2G_REQ_LOGIN, this);
        EventManager.removeHandler(C2G_REQ_PLAYER_LOGIN, this);
        EventManager.removeHandler(C2G_REQ_TEST_LOGIN,this);
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id){
            case C2A_HTTP_AUTH:
            {
                cc.log('C2A_HTTP_AUTH');

                if(event['result'])
                {
                    KeyValueManager['player_data']['user_id'] = event['user_id'];
                    KeyValueManager['player_data']['token'] = event['token'];
                    KeyValueManager['player_data']['refresh_token'] = event['refresh_token'];
                    if(this._state == LoginState.RESITER){
                        let accountEdit = this.accountNode.getComponent(cc.EditBox);
                        accountEdit.string = event['user_id'];
                    }
                    else if(this._state == LoginState.LOGIN){
                        if(ANDROID_CHECK) {
                            let accountEdit = this.accountNode.getComponent(cc.EditBox);
                            KeyValueManager['player_data']['user_id'] = parseInt(accountEdit.string);
                        }
                        if (!NET_HTTP)
                        {
                            NetManager.disconnectServer();

                        }
                        //this.node.active = false;
                        KeyValueManager['server_url'] = KeyValueManager['channel_info']['ThirdURL'] + ':' + KeyValueManager['channel_info']['ThirdPort'] + '/gate_login';
                        let platform = 'windows';
                        if (cc.sys.isMobile && cc.sys.isNative)
                        {
                            if(cc.sys.platform == cc.sys.ANDROID)
                            {
                                platform ='Android';
                            }
                            else
                            {
                                platform ='IOS';
                            }
                        }
                        let event1 = {
                            url:KeyValueManager['server_url'],
                            msg_id:C2G_REQ_LOGIN,
                            user_id:KeyValueManager['player_data']['user_id'],
                            channel:'lanyu',
                            platform:platform,
                            token:KeyValueManager['player_data']['token'],
                            refresh_token:KeyValueManager['player_data']['refresh_token'],
                        };
                        if(!NET_HTTP)
                        {
                            NetManager.connectToServer(KeyValueManager['channel_info']['ThirdURL'], KeyValueManager['channel_info']['ThirdPort'],function (err) {
                                if(err == 1)
                                    NetManager.sendMsg(event1);
                            });
                        }
                        else
                        {
                            NetManager.sendMsg(event1);
                        }
                    }

                }
            }
                break;
            case C2G_REQ_LOGIN:
            {
                cc.log('C2G_REQ_LOGIN');
                if(event['result'])
                {
                    KeyValueManager['session'] = event['session_key'];
                    KeyValueManager['player_data']['token'] = event['token'];
                    KeyValueManager['player_data']['refresh_token'] = event['refresh_token'];


                    KeyValueManager['server_url'] = event['host'] + ':' + event['port'] + '/gate_http';
                    Utils.savePlayerData();
                    let event1 = {};
                    if(ANDROID_CHECK){
                        event1 = {
                            url:KeyValueManager['server_url'],
                            msg_id:C2G_REQ_TEST_LOGIN,
                            user_id:KeyValueManager['player_data']['user_id'],
                            session_key:KeyValueManager['session'],
                        };
                    }
                    else {
                        event1 = {
                            url: KeyValueManager['server_url'],
                            msg_id: C2G_REQ_PLAYER_LOGIN,
                            user_id: KeyValueManager['player_data']['user_id'],
                            session_key: KeyValueManager['session'],
                        };
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
            }
                break;
            case C2G_REQ_PLAYER_LOGIN:
            {
                if(event['result'])
                {
                    KeyValueManager['player_data']['player_package'] = event['data']['package'];
                    KeyValueManager['player_data']['player_info'] = event['data']['player_info'];
                    KeyValueManager['player_data']['player_cd_pool'] = event['data']['player_cd_pool'];
                    KeyValueManager['player_data']['player_id'] = event['player_id'];

                    let server_time = event['server_time'] * 1000;
                    let currentTime = NetManager.getCurrentMT();
                    KeyValueManager['timeDiff'] = currentTime - server_time;
                    KeyValueManager['in_game'] = event['in_game'];
                    Utils.savePlayerData();
                    Utils.enterGame();
                    //掉线重连的游戏登录
                    if(KeyValueManager['in_game']){
                        KeyValueManager['startMap'] = event['map_data'];
                        KeyValueManager['camps'] = event['camps'];
                        KeyValueManager['camp'] = event['camp'];
                        KeyValueManager['name'] = event['name'];
                        KeyValueManager['rank'] = event['rank']
                        KeyValueManager['currentTime'] = event['start_time'] * 1000;
                        let theme_id = event['theme'];
                        KeyValueManager['width'] = event['width'];
                        KeyValueManager['height'] =event['height'];
                        KeyValueManager['onLoadingFinished']= function () {
                            for(let i in theme_id){
                                let id = theme_id[i];
                                let teamType = i;
                                cc.loader.loadRes(KeyValueManager['csv_kv']['theme_path']['value'] + KeyValueManager['csv_theme'][id]['Theme'], cc.Prefab,
                                    function (err, prefab) {
                                        KeyValueManager['themeList'][teamType] = prefab;
                                    });
                            }
                        };
                    }
                    cc.director.loadScene('loading');

                }
            }
                break;
            case C2G_REQ_TEST_LOGIN: {
                if (event['result']) {
                    KeyValueManager['player_data']['player_package'] = event['data']['package'];
                    KeyValueManager['player_data']['player_info'] = event['data']['player_info'];
                    KeyValueManager['player_data']['player_cd_pool'] = event['data']['player_cd_pool'];
                    KeyValueManager['player_data']['player_id'] = event['player_id'];

                    let server_time = event['server_time'] * 1000;
                    let currentTime = NetManager.getCurrentMT();
                    KeyValueManager['timeDiff'] = currentTime - server_time;
                    KeyValueManager['in_game'] = event['in_game'];
                    Utils.savePlayerData();
                    Utils.enterGame();
                    //掉线重连的游戏登录
                    if (KeyValueManager['in_game']) {
                        KeyValueManager['startMap'] = event['map_data'];
                        KeyValueManager['camps'] = event['camps'];
                        KeyValueManager['camp'] = event['camp'];
                        KeyValueManager['name'] = event['name'];
                        KeyValueManager['rank'] = event['rank']
                        KeyValueManager['currentTime'] = event['start_time'] * 1000;
                        let theme_id = event['theme'];
                        KeyValueManager['width'] = event['width'];
                        KeyValueManager['height'] =event['height'];
                        KeyValueManager['onLoadingFinished'] = function () {
                            for (let i in theme_id) {
                                let id = theme_id[i];
                                let teamType = i;
                                cc.loader.loadRes(KeyValueManager['csv_kv']['theme_path']['value'] + KeyValueManager['csv_theme'][id]['Theme'], cc.Prefab,
                                    function (err, prefab) {
                                        KeyValueManager['themeList'][teamType] = prefab;
                                    });
                            }
                        };
                    }
                    cc.director.loadScene('loading');
                }
            }
            break;
        }




    },
    // use this for initialization
    onLoad: function () {
        EventManager.registerHandler(C2A_HTTP_AUTH, this);
        EventManager.registerHandler(C2G_REQ_LOGIN, this);
        EventManager.registerHandler(C2G_REQ_PLAYER_LOGIN, this);
        EventManager.registerHandler(C2G_REQ_TEST_LOGIN,this);
        KeyValueManager['currentScene'] = CurrentScene.SCENE_LOIN;
        KeyValueManager['themeList'] = {};
        if (!NET_HTTP)
        {
            NetManager.connectToServer(KeyValueManager['channel_info']['LoginURL'], KeyValueManager['channel_info']['LoginPort']);
        }

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
