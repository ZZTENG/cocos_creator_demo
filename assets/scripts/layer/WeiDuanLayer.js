/**
 * Created by ZZTENG on 2017/08/22.
 **/
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
        btLabel: cc.Label
    },

    // use this for initialization
    onEnable: function () {
        cc.log('sdw_desktop: ',KeyValueManager['sdw_desktop']);
        cc.log('sdw.canAddDesktop: ',sdw.canAddDesktop);
        if(KeyValueManager['sdw_desktop']){
            this.btLabel.string = '领 取';
        }
        else {
           this.btLabel.string = '设 置';
        }
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip) {
            clip.play();
        }
    },
    onGetOrSet: function () {
        cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        if(KeyValueManager['sdw_desktop']){
            //领取微端奖励
            let event1 = {
                url:KeyValueManager['server_url'],
                msg_id:C2G_REQ_GET_WD_REWARD,
                user_id:KeyValueManager['player_data']['user_id'],
                session_key: KeyValueManager['session'],
            };
            NetManager.sendMsg(event1);
        }
        else {
            //添加微端
            if(sdw.canAddDesktop){
                sdw.addDesktop();
            }
            else {
                //添加微端异常
                KeyValueManager['msg_text'] = '设置微端异常';
                EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer': false});
            }
        }
    },
    onClickClose: function () {
        cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        let clip = this.getComponent(cc.Animation);
        let clips = clip.getClips();
        if (clips && clips[1]) {
            KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
        }
        KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
    },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
        if(KeyValueManager['win_get_coin']){
            delete KeyValueManager['win_get_coin'];
        }
    },
    onDisable: function () {
        if(KeyValueManager['win_get_coin']){
            delete KeyValueManager['win_get_coin'];
        }
        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});