/**
 * Created by ZZTENG on 2017/03/23.
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
        shopUnit: cc.Node,
        _shopList:[],
        scrollView: cc.ScrollView
    },

    // use this for initialization
    onLoad: function () {
        this._shopList = [];
        this._shopList.push(this.shopUnit.getComponent('ShopUnit'));
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_BUY_STORE_ITEM, this);
        this.shopUnit.active = false;
        this._dataSource = this.getComponent('DataSource');
        this._dataSource = this._dataSource.getUnit();
        this._dataSource.host = this;
        this._dataSource.bindFunc = this.onTeamUnit;
        this._dataSource.getElementFunc = this.getTeamElement;
        let data = [];
        for(let i in KeyValueManager['csv_theme']){
            let data1 = [];
            let storeId = KeyValueManager['csv_theme'][i]['StoreId'];
            if(!storeId)
                continue;
            data1.push(storeId);
            data1.push(JSON.parse(KeyValueManager['csv_store'][storeId]['Content']));
            data1.push(JSON.parse(KeyValueManager['csv_store'][storeId]['Consume']));
            data1.push(JSON.parse(KeyValueManager['csv_store'][storeId]['RealConsume']));
            data1.push(KeyValueManager['csv_theme'][i]['Theme']);
            if(ThemeName[i])
                data1.push(ThemeName[i]);
            else
                data1.push('');
            data.push(data1);
        }
        this._dataSource.data = data;
        let clip = this.getComponent(cc.Animation);
        if (clip) {
            clip.play();
        }
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id){
            case C2G_REQ_BUY_STORE_ITEM: {
                if(event['result']){
                    Utils.useItem(CURRENCY_PACKAGE,COIN_ID,'count',KeyValueManager['buy_price']);
                    KeyValueManager['msg_text'] ='购买成功';
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
                    EventManager.pushEvent({'msg_id':'update_coin'});
                    if(KeyValueManager['player_data']['player_info']['theme_list'].indexOf(KeyValueManager['buy_themeId']) == -1){
                        KeyValueManager['player_data']['player_info']['theme_list'].push(KeyValueManager['buy_themeId'])
                        Utils.setItem(ITEM_PACKAGE,KeyValueManager['buy_themeId'],'count',KeyValueManager['buy_useCount']);
                    }
                    else {
                        Utils.addItem(ITEM_PACKAGE,KeyValueManager['buy_themeId'],'count',KeyValueManager['buy_useCount']);
                    }
                }
            }
        }
    },
    onTeamUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getTeamElement:function (index) {
        if(index >= this._shopList.length){
            let node = cc.instantiate(this.shopUnit);
            if(!node.active) node.active = true;
            node.parent = this.shopUnit.parent;
            this._shopList.push(node.getComponent("ShopUnit"));

        }else{
            if(!this._shopList[index].node.active) this._shopList[index].node.active = true;
        }
        return this._shopList[index];
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_BUY_STORE_ITEM, this);
        for(let i = 0;i < this._shopList.length;i += 1){
            if(this._shopList[i].node.active)
                this._shopList[i].node.active = false;
        }
        let clip = this.getComponent(cc.Animation);
        if (clip) {
            clip.stop();
        }
    },
    onClick:function (event, id) {
        switch (id) {
            case 'return': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
            }
            break;
        }
    },
    onDestroy: function () {
        if(KeyValueManager['buy_price'])
            delete KeyValueManager['buy_price'];
        if(KeyValueManager['buy_themeId'])
            delete KeyValueManager['buy_themeId'];
        if(KeyValueManager['buy_useCount'])
            delete KeyValueManager['buy_useCount'];
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});