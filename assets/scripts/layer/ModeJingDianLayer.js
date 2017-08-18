/**
 * Created by ZZTENG on 2017/07/10.
 **/
const EventManager = require('EventManager');
const KeyValueManager = require('KeyValueManager');
const Utils = require('utils');
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
        zhiyin_node: cc.Node
    },

    // use this for initialization
    onLoad: function () {

    },
    onEnable: function () {
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip){
            clip.play();
        }
        if(KeyValueManager['is_guide']){
            this.zhiyin_node.active = true;
        }
        else {
            this.zhiyin_node.active = false;
        }
    },
    onDisable: function () {
        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }
    },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
    onClick: function (event,id) {
        if(id){
            let id = cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
            cc.log(id);
        }
        switch (id){
            case 'back': {
                let clip = this.getComponent(cc.Animation);
                let clips = clip.getClips();
                if (clips && clips[1]) {
                    KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
                }
                KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
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
                KeyValueManager['msg_text'] ='暂未开放';
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                return;
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
                    KeyValueManager['name'] = {'5': KeyValueManager['player_data']['player_info']['name'],'1': 'zzteng'};
                    KeyValueManager['head'] = {'5': KeyValueManager['player_data']['player_info']['head'], '1': 'http://castle-pic-online.oss-cn-shanghai.aliyuncs.com/head/zzteng.png' };
                    KeyValueManager['width'] = 20;
                    KeyValueManager['height'] = 20;
                    KeyValueManager['reTheme'] = {'5': 'TM0011','1': 'TM007'};
                    KeyValueManager['currentTime'] = NetManager.getCurrentMT() - KeyValueManager['timeDiff'];         //指引
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
                KeyValueManager['msg_text'] ='暂未开放';
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                return;
                KeyValueManager['game_mode'] = GameMode.MODE_2V2V2;
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'automatch_layer', 'hide_preLayer':false});
            }
                break;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});