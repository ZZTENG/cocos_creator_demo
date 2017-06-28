const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils');
const Guide = require('Guide');
const OrderState = {
    ORDER_INIT: 1,
    ORDER_SUCCESS: 2,
    ORDER_FAILURE: 3
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
        head_sprite: cc.Sprite,
        name_label: cc.Label,
        coin_label: cc.Label,
        zhiyin_node: cc.Node,
    },
    onClick:function (event, id) {
        switch (id) {
            case 'share': {
                let OBJECT = {
                    title: '纸上帝国',
                    desc: '来和我一决雌雄吧！',
                    success: function () {
                        cc.log('share success');
                    },
                    fail: function () {
                        cc.log('share fail');
                    },
                    cancel: function () {
                        cc.log('share cancel');
                    }
                };
                sdw.onSetShareOperate(OBJECT)
            }
            break;
            case "2V2":
            {
                KeyValueManager['game_mode'] = GameMode.MODE_2V2;
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'automatch_layer', 'hide_preLayer':false});
            }
            break;
            case "3V3":
            {

                KeyValueManager['game_mode'] = GameMode.MODE_3V3;
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'automatch_layer', 'hide_preLayer':false});
            }
                break;
            case "1V1": {
                if (KeyValueManager['is_guide']) {
                   //自定义数据初始化、
                    KeyValueManager['startMap'] = {'190':[2,-1,10],'192': [1,1,0],'209':[3,-1,0],'210':[1,5,0]};
                    KeyValueManager['main_city_index'] = 210;
                    KeyValueManager['empty_city_index'] = 190;
                    KeyValueManager['enemy_city_index'] = 192;
                    KeyValueManager['guide_move_count'] = 2;
                    KeyValueManager['search_move_over'] = false;
                    KeyValueManager['camps'] = [[5],[1]];
                    KeyValueManager['camp'] = 5;
                    KeyValueManager['name'] = {'5': KeyValueManager['player_data']['player_info']['name'],'1': '疼疼疼'};
                    KeyValueManager['width'] = 20;
                    KeyValueManager['height'] = 20;
                    let theme_id = {'5': 'TM0011','1': 'TM007'};
                    KeyValueManager['currentTime'] = NetManager.getCurrentMT() - KeyValueManager['timeDiff'];         //指引
                    for(let i in theme_id){
                        let id = theme_id[i];
                        let teamType = i;
                        cc.loader.loadRes(KeyValueManager['csv_kv']['theme_path']['value'] + KeyValueManager['csv_theme'][id]['Theme'], cc.Prefab,
                            function (err, prefab) {
                                KeyValueManager['themeList'][teamType] = prefab;
                            });
                    }
                    for(let i = 0;i < KeyValueManager['camps'].length;i += 1){
                        for(let j = 0;j < KeyValueManager['camps'][i].length;j += 1){
                            let camp = KeyValueManager['camps'][i][j];
                            cc.loader.loadRes(KeyValueManager['csv_kv']['land_around_path']['value'] + LAND_AROUND[camp], cc.Prefab,
                                function (err, prefab) {
                                    if(err){
                                        cc.log(err);
                                    }
                                    else{
                                        KeyValueManager['land_around'][camp] = prefab;
                                    }
                                });
                        }
                    }
                    Utils.enterGameScene();
                    cc.director.loadScene('loading');
                }
                else {
                    KeyValueManager['game_mode'] = GameMode.MODE_1V1;
                    EventManager.pushEvent({
                        'msg_id': 'OPEN_LAYER',
                        'layer_id': 'automatch_layer',
                        'hide_preLayer': false
                    });
                }
            }
                break;
            case "2V2V2":
            {
                KeyValueManager['game_mode'] = GameMode.MODE_2V2V2;
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'automatch_layer', 'hide_preLayer':false});
            }
                break;
            case "custom":
            {
                KeyValueManager['game_mode'] = GameMode.MODE_CUSTOM;
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'create_or_enter_room', 'hide_preLayer':false});

            }
                break;
            case "tuandui":
            {
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'match_list_layer', 'hide_preLayer':false});

            }
                break;
            case "sanguo":
            {
                KeyValueManager['game_mode'] = GameMode.MODE_IDENTITY;
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'automatch_layer','hide_preLayer': false});
            }
            case "shop":
            {
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'shop_layer','hide_preLayer': false});
            }
                break;
            case "paiming":
            {
                KeyValueManager['msg_text'] ='暂未开放';
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                // EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'team_rank_layer','hide_preLayer': false});
            }
                break;
            case "huodong":
            {
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'week_theme_layer','hide_preLayer': false});
            }
                break;
            case "duiwu":
            {
                if(!KeyValueManager['player_data']['player_info']['team'])
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'team_list_layer', 'hide_preLayer':false});
                else
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'team_layer', 'hide_preLayer':false});

            }
                break;
            case "name":
            {
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'player_info_layer','hide_preLayer': false});
            }
                break;
            case 'clear_data':{
                window.localStorage.clear();location.reload();
            }
            break;
            case 'config': {
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'setting_layer','hide_preLayer': false});
            }
            break;
            case 'buy': {
                EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'chongzhi_coin_layer','hide_preLayer': false});
            }
            break;
            case 'exit': {
                Utils.enterLoginScene();
                cc.director.loadScene('loading');
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
        let self = this;
        this.coin_label.string = Utils.getItem(CURRENCY_PACKAGE,COIN_ID,'count');
        KeyValueManager['currentScene'] = CurrentScene.SCENE_MAIN;
        if(KeyValueManager['platformLogin']) {
            cc.loader.load(KeyValueManager['player_data']['player_info']['head'], function (err, tex) {
                let frame = new cc.SpriteFrame(tex);
                self.head_sprite.spriteFrame = frame;
            });
        }
        // KeyValueManager['player_data']['player_info']['guide']  = true;
        if(KeyValueManager['player_data'] && KeyValueManager['player_data']['player_info'])
        {
            this.name_label.string = KeyValueManager['player_data']['player_info']['name'];
            KeyValueManager['is_guide'] = !KeyValueManager['player_data']['player_info']['guide'];
        }
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.exitGame,this);
        this.reuse();
    },
    exitGame: function (event) {
        if(event.keyCode == cc.KEY.back){
            EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'exit_game_layer', 'hide_preLayer': false});
        }
    },
    reuse:function () {
        EventManager.registerHandler(C2G_REQ_GET_FRIEND_HIGHEST_LEVEL, this);
        EventManager.registerHandler(C2G_REQ_NOTICE_AVATAR, this);
        EventManager.registerHandler(C2G_REQ_GAME_MATCH, this);
        EventManager.registerHandler(G2C_REQ_MATCH_COMPLETED , this);
        EventManager.registerHandler(C2G_REQ_LOAD_COMPLETED, this);
        EventManager.registerHandler(C2G_REQ_GET_CHARGE_STATUS,this);
        EventManager.registerHandler( 'CLOSE_ALL_LAYER', this);
        EventManager.registerHandler(C2G_REQ_UPDATE_PLAYER,this);
        EventManager.registerHandler(C2G_REQ_ADD_COIN,this);
        EventManager.registerHandler('update_coin',this);
        if(KeyValueManager['is_guide']){
            this.zhiyin_node.active = true;
            EventManager.registerHandler(Guide_Unit.Login_Start,this);
        }
        else {
            this.zhiyin_node.active  = false;
        }
        // //测试游戏初始数据是否正确
        // let event = {
        //     url: KeyValueManager['server_url'],
        //     msg_id: C2G_REQ_GET_FRIEND_HIGHEST_LEVEL,
        //     user_id: KeyValueManager['player_data']['user_id'],
        //     session_key: KeyValueManager['session'],
        // };
        // NetManager.sendMsg(event);
        // if(KeyValueManager['test_sign']){
        //     this.scheduleOnce(function () {
        //         let event1 = {
        //             url: KeyValueManager['server_url'],
        //             msg_id: C2G_REQ_GAME_MATCH,
        //             user_id: KeyValueManager['player_data']['user_id'],
        //             session_key: KeyValueManager['session'],
        //             mode: GameMode.MODE_1V1
        //         };
        //         NetManager.sendMsg(event1);
        //     },1)
        // }
    },

    onDestroy: function () {
        EventManager.removeHandler(C2G_REQ_GET_FRIEND_HIGHEST_LEVEL, this);
        EventManager.removeHandler(C2G_REQ_NOTICE_AVATAR, this);
        EventManager.removeHandler(C2G_REQ_GAME_MATCH, this);
        EventManager.removeHandler(G2C_REQ_MATCH_COMPLETED , this);
        EventManager.removeHandler(C2G_REQ_LOAD_COMPLETED, this);
        EventManager.removeHandler(C2G_REQ_GET_CHARGE_STATUS,this);
        EventManager.removeHandler( 'CLOSE_ALL_LAYER', this);
        EventManager.removeHandler(C2G_REQ_UPDATE_PLAYER,this);
        EventManager.removeHandler(C2G_REQ_ADD_COIN,this);
        EventManager.removeHandler('update_coin',this)
        if(KeyValueManager['is_guide']){
            Guide.removeUnitListenList(Guide_Unit.Login_Start);
            EventManager.removeHandler(Guide_Unit.Login_Start,this);
        }
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,this.exitGame,this);
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id) {
            case C2G_REQ_GET_FRIEND_HIGHEST_LEVEL:
                if (event['result']) {

                }
                break;
            case C2G_REQ_GAME_MATCH: {
                if (event['result']) {
                    if (event['is_team']) {
                        KeyValueManager['camp'] = event['camp'];
                        KeyValueManager['roomId'] = event['room_id'];
                        KeyValueManager['teamRoomData'] = event['team_info'];
                        EventManager.pushEvent({
                            'msg_id': 'OPEN_LAYER',
                            'layer_id': 'team_room_layer',
                            'hide_preLayer': false
                        });
                    }
                    if (event['is_rank']) {
                        EventManager.pushEvent({
                            'msg_id': 'OPEN_LAYER',
                            'layer_id': 'automatch_layer',
                            'hide_preLayer': false
                        });
                    }
                }
                else if (event['error_code'] == 91002) {
                    KeyValueManager['msg_text'] = '未加入任何战队';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer': false});
                }
                else if (event['error_code'] == 91004) {
                    KeyValueManager['msg_text'] = '不是队长, 权限不足';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer': false});
                }
                else if (event['error_code'] == 91011) {
                    KeyValueManager['msg_text'] = '队伍人数不足';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer': false});
                }
                else if (event['error_code'] == 93012) {
                    KeyValueManager['msg_text'] = '队友未上线';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer': false});
                }
                else if (event['error_code'] == 93014) {
                    KeyValueManager['msg_text'] = '与报名参赛时间不符';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer': false});
                }
            }
                break;

            case G2C_REQ_MATCH_COMPLETED : {
                //开始加载资源
                //关闭当前窗口进入loading


                if (event['result']) {
                    let self = this;

                    EventManager.pushEvent({'msg_id': 'CLOSE_ALL_LAYER'});
                    //初始map数据
                    // event['map_data'] = {145: [3, -1, 0], 146: [3, -1, 0], 122: [3, -1, 0], 166: [1, 1, 0], 143: [3, -1, 0]};
                    // event['camps'] = [[0], [1]];
                    // event['camp'] = 1;
                    // event['name'] = {0: '\xe5\xb1\x88\xe7\xa5\x81', 1: '\xe6\xb1\x9f\xe5\xad\x99'};
                    // event['width'] = 21;
                    // event['height'] = 21;
                    // event['theme'] = {0: 'TM0010', 1: 'TM008', 2: 'TM009', 3: 'TM0011', 4: 'TM0010', 5: 'TM007'};
                    KeyValueManager['startMap'] = event['map_data'];
                    KeyValueManager['camps'] = event['camps'];
                    KeyValueManager['camp'] = event['camp'];
                    KeyValueManager['name'] = event['name'];
                    KeyValueManager['width'] = event['width'];
                    KeyValueManager['height'] = event['height'];
                    let theme_id = event['theme'];
                    for (let i in theme_id) {
                        let id = theme_id[i];
                        let teamType = i;
                        cc.loader.loadRes(KeyValueManager['csv_kv']['theme_path']['value'] + KeyValueManager['csv_theme'][id]['Theme'], cc.Prefab,
                            function (err, prefab) {
                                KeyValueManager['themeList'][teamType] = prefab;
                            });
                    }
                    for(let i = 0;i < KeyValueManager['camps'].length;i += 1){
                        for(let j = 0;j < KeyValueManager['camps'][i].length;j += 1){
                            let camp = KeyValueManager['camps'][i][j];
                            cc.loader.loadRes(KeyValueManager['csv_kv']['land_around_path']['value'] + LAND_AROUND[camp], cc.Prefab,
                                function (err, prefab) {
                                    if(err){
                                        cc.log(err);
                                    }
                                    else{
                                        KeyValueManager['land_around'][camp] = prefab;
                                    }
                                });
                        }
                    }
                    KeyValueManager['onLoadingEnd'] = function () {
                        cc.director.loadScene(KeyValueManager['preloadScene']);
                    };
                    KeyValueManager['onLoadingFinished'] = function () {
                        KeyValueManager['wait_game_start'] = true;
                        let event1 = {
                            url: KeyValueManager['server_url'],
                            msg_id: C2G_REQ_LOAD_COMPLETED,
                            user_id: KeyValueManager['player_data']['user_id'],
                            session_key: KeyValueManager['session'],
                        };
                        NetManager.sendMsg(event1);
                    };
                    KeyValueManager['loadingWaitMsg'] = true;
                    KeyValueManager['loadingFunc'] = function (onProgress) {
                        KeyValueManager['loadProcess'] = 0;
                        KeyValueManager['loadTotalCount'] = 0;

                        //根据当前的关卡去生成关卡节点
                        KeyValueManager['preloadScene'] = 'game';
                        cc.director.preloadScene('game', function (error, asset) {
                            if (onProgress) {
                                onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                            }
                        });
                        KeyValueManager['loadTotalCount']++;
                    };
                    cc.director.loadScene('loading');
                }
            }
                break;
            case C2G_REQ_UPDATE_PLAYER: {
                if (event['result']) {
                    this.name_label.string = KeyValueManager['player_data']['player_info']['name'];
                }
            }
                break;
            case C2G_REQ_GET_CHARGE_STATUS: {
                if (event['result']) {
                    let order_info = event['order_info'];
                    for (let i in order_info) {
                        let status = order_info[i];
                        switch (status) {
                            case OrderState.ORDER_INIT: {
                                console.log(OrderState.ORDER_INIT);
                            }
                                break;
                            case OrderState.ORDER_SUCCESS: {
                                KeyValueManager['order_require'][i]['timestamp'] = ORDER_REQUIRE_OVER_TIMESTAMP;
                                console.log(OrderState.ORDER_SUCCESS);

                                let storeId = KeyValueManager['order_require'][i]['storeId']
                                let item = JSON.parse(KeyValueManager['csv_store'][storeId]['Content'])[0][1];
                                let count = JSON.parse(KeyValueManager['csv_store'][storeId]['Content'])[0][3];
                                Utils.addItem(CURRENCY_PACKAGE, item, 'count', count);
                            }
                                break;
                            case OrderState.ORDER_FAILURE: {
                                KeyValueManager['order_require'][i]['timestamp'] = ORDER_REQUIRE_OVER_TIMESTAMP;
                                console.log(OrderState.ORDER_FAILURE);
                            }
                                break;
                            default: {
                                KeyValueManager['order_require'][i]['timestamp'] = ORDER_REQUIRE_OVER_TIMESTAMP;
                            }
                        }
                    }
                }
            }
                break;
            case C2G_REQ_ADD_COIN: {
                if (event['result']) {
                    KeyValueManager['msg_text'] = '充值成功';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer': false});
                    this.coin_label.string = Utils.getItem(CURRENCY_PACKAGE, COIN_ID, 'count');
                }
            }
                break;
            case 'update_coin': {
                this.coin_label.string = Utils.getItem(CURRENCY_PACKAGE, COIN_ID, 'count');
            }
                break;
            case Guide_Unit.Login_Start: {
                //处理新手指引的主界面
            }
                break;
        }
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        let time = NetManager.getCurrentTime();
        if(!KeyValueManager['order_start'])
            KeyValueManager['order_start'] = time;
        if((time - KeyValueManager['order_start']) > ORDER_REQUIRE_SPACE_TIME) {
            KeyValueManager['order_start'] = time;
            let order_info = {};
            for (let i in KeyValueManager['order_require']) {
                let timestamp = KeyValueManager['order_require'][i]['timestamp'];
                if (timestamp == ORDER_REQUIRE_OVER_TIMESTAMP)
                    continue;
                let time = NetManager.getCurrentTime();
                let spaceTime = time - KeyValueManager['order_require'][i]['time'];
                if (spaceTime < ORDER_REQUIRE_LAST_TIME) {
                    order_info[i] = timestamp;
                }
                else {
                    KeyValueManager['order_require'][i]['timestamp'] = ORDER_REQUIRE_OVER_TIMESTAMP;
                }
            }
            if (Object.keys(order_info).length != 0) {
                let event1 = {
                    url: KeyValueManager['server_url'],
                    msg_id: C2G_REQ_GET_CHARGE_STATUS,
                    user_id: KeyValueManager['player_data']['user_id'],
                    session_key: KeyValueManager['session'],
                    channel: CHANNEL,
                    appId: APPID,
                    order_info: order_info
                };
                console.log(C2G_REQ_GET_CHARGE_STATUS);
                NetManager.sendMsg(event1);
            }
        }
    },
});
