/**
 * Created by ZZTENG on 2017/03/01.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
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
        _dataSource : null,
        recommendUnit: cc.Node,
        _recommendList:[],
        pageView: cc.PageView
    },

    onClick:function (event, id) {
        switch (id) {
            case 'return': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
            }
            break;
            case 'get': {
                let index = this.pageView._curPageIdx;
                let csvId = Object.keys(KeyValueManager['csv_recommend'])[index];
                let themeId = JSON.parse(this._dataSource.data[index][0])[1];
                let useCount = JSON.parse(this._dataSource.data[index][0])[2];
                let canSend = true;
                if(KeyValueManager['player_data']['player_info']['recommend_list']){
                    for(let i = 0;i < KeyValueManager['player_data']['player_info']['recommend_list'].length;i += 1) {
                        if (KeyValueManager['player_data']['player_info']['recommend_list'][i] == themeId) {
                            canSend = false;
                            KeyValueManager['msg_text'] = '已经领过';
                        }
                        else {
                            KeyValueManager['msg_text'] = '领取成功';
                            KeyValueManager['player_data']['player_info']['recommend_list'].push(themeId);
                        }
                    }
                }
                else {
                    KeyValueManager['msg_text'] = '领取成功';
                    KeyValueManager['player_data']['player_info']['recommend_list'] = [];
                    KeyValueManager['player_data']['player_info']['recommend_list'].push(themeId);
                }
                EventManager.pushEvent({
                    'msg_id': 'OPEN_LAYER',
                    'layer_id': 'msg_layer',
                    'hide_preLayer': false
                });
                if(canSend){
                    if(KeyValueManager['player_data']['player_info']['theme_list'])
                        KeyValueManager['player_data']['player_info']['theme_list'].push(themeId);
                    Utils.addItem(ITEM_PACKAGE,themeId,'count',useCount);
                    let event1 = {
                        url:KeyValueManager['server_url'],
                        msg_id:C2G_REQ_GET_FREE_THEME,
                        user_id:KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        id: csvId
                    };
                    NetManager.sendMsg(event1);
                }
            }
            break;
            case 'buy': {
                let cur_index = this.pageView._curPageIdx;
                let recommendId  = Object.keys(KeyValueManager['csv_recommend'])[cur_index];
                let price = this._dataSource.data[cur_index][2][3];
                let coins = Utils.getItem(CURRENCY_PACKAGE,COIN_ID,'count');
                if(coins >= price) {
                    let event2 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_BUY_THEME,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        id: recommendId
                    };
                    NetManager.sendMsg(event2);
                }
                else {
                    EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'chongzhi_coin_layer','hide_preLayer': false});
                    KeyValueManager['msg_text'] ='金币不足，请充值';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                }
            }
            break;
        }
    },
    // use this for initialization
    onLoad: function () {
        this._recommendList = [];
        this._recommendList.push(this.recommendUnit.getComponent('RecommendUnit'));
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_GET_FREE_THEME , this);
        EventManager.registerHandler(C2G_REQ_BUY_THEME,this);
        this.recommendUnit.active = false;
        this._dataSource = this.getComponent('DataSource');
        this._dataSource = this._dataSource.getUnit();
        this._dataSource.host = this;
        this._dataSource.bindFunc = this.onTeamUnit;
        this._dataSource.getElementFunc = this.getTeamElement;
        let data = [];
        for(let i in KeyValueManager['csv_recommend']){
            let data1 = [];
            data1.push(JSON.parse(KeyValueManager['csv_recommend'][i]['Content']));
            data1.push(KeyValueManager['csv_recommend'][i]['Discount']);
            data1.push(JSON.parse(KeyValueManager['csv_recommend'][i]['Price']));
            data.push(data1);
        }
        this._dataSource.data = data;
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip){
            clip.play();
        }
    },
    onTeamUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getTeamElement:function (index) {
        if(index >= this._recommendList.length){
            let node = cc.instantiate(this.recommendUnit);
            if(!node.active) node.active = true;
            node.parent = this.recommendUnit.parent;
            this._recommendList.push(node.getComponent("RecommendUnit"));

        }else{
            if(!this._recommendList[index].node.active) this._recommendList[index].node.active = true;
        }
        return this._recommendList[index];
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_GET_FREE_THEME, this);
        EventManager.removeHandler(C2G_REQ_BUY_THEME,this);
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.currentClip) {
            clip.stop();
        }
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id) {
            case C2G_REQ_BUY_THEME: {
                if(event['result']){
                    let index = this.pageView._curPageIdx;
                    let themeId = this._dataSource.data[index][0][1];
                    let useCount = this._dataSource.data[index][0][3];
                    KeyValueManager['msg_text'] ='购买成功';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                    let price = this._dataSource.data[index][2][3];
                    Utils.useItem(CURRENCY_PACKAGE,COIN_ID,'count',price);
                    EventManager.pushEvent({'msg_id':'update_coin'});
                    if(KeyValueManager['player_data']['player_info']['theme_list'].indexOf(themeId) == -1){
                        KeyValueManager['player_data']['player_info']['theme_list'].push(themeId)
                        Utils.setItem(ITEM_PACKAGE,themeId,'count',useCount);
                    }
                    else {
                        Utils.addItem(ITEM_PACKAGE,themeId,'count',useCount);
                    }
                }
            }
        }

    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});