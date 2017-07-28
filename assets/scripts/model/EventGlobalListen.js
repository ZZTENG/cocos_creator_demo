/**
 * Created by ZZTENG on 2017/04/26.
 **/
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const KeyValueManager = require('KeyValueManager');
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
    },

    // use this for initialization
    onLoad: function () {
        EventManager.registerHandler(G2C_REQ_INVITE_JOIN,this);
        EventManager.registerHandler(G2C_REQ_AGREE_JOIN_APPLY, this);
        EventManager.registerHandler(C2G_REQ_REMOVE_TEAMMATE,this)
        EventManager.registerHandler(C2G_REQ_EXIT_TEAM,this);
        EventManager.registerHandler(C2G_REQ_PLAYER_LOGOUT,this);
        if(KeyValueManager['open_team_agree_layer']){
            KeyValueManager['open_team_agree_layer'] = false;
            EventManager.pushEvent({
                'msg_id': 'OPEN_LAYER',
                'layer_id': 'team_agree_layer',
                'hide_preLayer': false
            });
        }
        if( KeyValueManager['open_team_layer']){
            KeyValueManager['open_team_layer'] = false;
            EventManager.pushEvent({
                'msg_id': 'OPEN_LAYER',
                'layer_id': 'team_agree_layer',
                'hide_preLayer': false
            });
        }
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id) {
            case G2C_REQ_AGREE_JOIN_APPLY: {
                if (event['result']) {
                    KeyValueManager['player_data']['player_info']['team'] = event['team_id'];
                    if (KeyValueManager['currentScene'] == CurrentScene.SCENE_MAIN) {
                        if (KeyValueManager['team_agree_layer'])
                            EventManager.pushEvent({
                                'msg_id': 'CLOSE_LAYER',
                                'layer_id': 'team_agree_layer',
                                'destroy': true
                            });
                        EventManager.pushEvent({
                            'msg_id': 'OPEN_LAYER',
                            'layer_id': 'team_layer',
                            'hide_preLayer': false
                        });
                        let event1 = {
                            url: KeyValueManager['server_url'],
                            msg_id: C2G_REQ_GET_TEAM_INFO,
                            user_id: KeyValueManager['player_data']['user_id'],
                            session_key: KeyValueManager['session'],
                            id: KeyValueManager['player_data']['player_info']['team']
                        };
                        NetManager.sendMsg(event1);
                    }
                    else if (KeyValueManager['currentScene'] == CurrentScene.SCENE_GAME) {
                        KeyValueManager['open_team_layer'] = true;
                    }
                }
                else {
                    cc.log(event['error_code']);
                }
            }
                break;
            case G2C_REQ_INVITE_JOIN: {
                if (event['result']) {
                    if (KeyValueManager['leader_name_list']) {
                        KeyValueManager['leader_name_list'].push(event['leader_name']);
                    }
                    else {
                        KeyValueManager['leader_name_list'] = [];
                        KeyValueManager['leader_name_list'].push(event['leader_name']);
                    }
                    if (KeyValueManager['invite_teamId_list']) {
                        KeyValueManager['invite_teamId_list'].push(event['team_id']);
                    }
                    else {
                        KeyValueManager['invite_teamId_list'] = [];
                        KeyValueManager['invite_teamId_list'].push(event['team_id']);
                    }
                    if (KeyValueManager['currentScene'] == CurrentScene.SCENE_MAIN) {
                        EventManager.pushEvent({
                            'msg_id': 'OPEN_LAYER',
                            'layer_id': 'team_agree_layer',
                            'hide_preLayer': false
                        });
                    }
                    else if (KeyValueManager['currentScene'] == CurrentScene.SCENE_GAME) {
                        KeyValueManager['open_team_agree_layer'] = true;
                    }
                }
            }
                break;
            case C2G_REQ_REMOVE_TEAMMATE: {
                if (event['id'] == KeyValueManager['player_data']['player_id']) {
                    if (KeyValueManager['player_data']['player_info']['team'])
                        delete KeyValueManager['player_data']['player_info']['team'];
                    if (KeyValueManager['player_data']['player_info']['is_master'])
                        delete KeyValueManager['player_data']['player_info']['is_master'];
                    Utils.savePlayerData();
                }
            }
                break;
            case C2G_REQ_EXIT_TEAM: {
                if (event['result']) {
                    if (event['is_leader']) {
                        if (KeyValueManager['player_data']['player_info']['team'])
                            delete KeyValueManager['player_data']['player_info']['team'];
                        if (KeyValueManager['player_data']['player_info']['is_master'])
                            delete KeyValueManager['player_data']['player_info']['is_master'];
                        Utils.savePlayerData();
                    }
                }
            }
                break;
             case C2G_REQ_PLAYER_LOGOUT: {
                 if(event['result']){

                 }
                 else if(event['error_code'] == 10010){
                     KeyValueManager['currentScene'] = CurrentScene.SCENE_OPENGING;
                     EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_button', 'hide_preLayer': false});
                 }
             }
             break
        }
    },
    onDestroy: function () {
        EventManager.removeHandler(G2C_REQ_INVITE_JOIN,this);
        EventManager.removeHandler(G2C_REQ_AGREE_JOIN_APPLY, this);
        EventManager.removeHandler(C2G_REQ_REMOVE_TEAMMATE,this)
        EventManager.removeHandler(C2G_REQ_EXIT_TEAM,this);
        EventManager.removeHandler(C2G_REQ_PLAYER_LOGOUT,this);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});