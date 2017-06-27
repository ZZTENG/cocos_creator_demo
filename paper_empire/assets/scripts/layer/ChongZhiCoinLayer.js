/**
 * Created by ZZTENG on 2017/04/12.
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
        chargeUnit: cc.Node,
        _chargeList:[],
    },

    // use this for initialization
    onLoad: function () {
        this._chargeList = [];
        this._chargeList.push(this.chargeUnit.getComponent('ChargeUnit'));
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_CHARGE, this);
        this._dataSource = this.getComponent('DataSource');
        this._dataSource = this._dataSource.getUnit();
        this._dataSource.host = this;
        this._dataSource.bindFunc = this.onTeamUnit;
        this._dataSource.getElementFunc = this.getTeamElement;
        let data = [];
        for(let i in KeyValueManager['csv_store']){
            if(KeyValueManager['csv_store'][i]['BuyType'] == 2) {
                let data1 = [];
                data1.push(i);
                data1.push(JSON.parse(KeyValueManager['csv_store'][i]['Content']));
                data1.push(JSON.parse(KeyValueManager['csv_store'][i]['RMB']));
                data1.push(KeyValueManager['csv_store'][i]['Name']);
                data1.push(KeyValueManager['csv_store'][i]['Ico']);
                data.push(data1);
            }
        }
        this._dataSource.data = data;
        let clip = this.getComponent(cc.Animation);
        if (clip) {
            clip.play();
        }
    },
    onTeamUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data,index);
    },
    getTeamElement:function (index) {
        if(index >= this._chargeList.length){
            let node = cc.instantiate(this.chargeUnit);
            if(!node.active) node.active = true;
            node.parent = this.chargeUnit.parent;
            this._chargeList.push(node.getComponent("ChargeUnit"));

        }else{
            if(!this._chargeList[index].node.active) this._chargeList[index].node.active = true;
        }
        return this._chargeList[index];
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_CHARGE, this);
        for(let i  = 0;i < this._chargeList.length;i += 1){
            if(this._chargeList[i].node.active)
                this._chargeList[i].node.active = false;
        }
        // if(KeyValueManager['subject']){
        //     delete KeyValueManager['subject'];
        // }
        // if(KeyValueManager['dingdan_coin']){
        //     delete KeyValueManager['dingdan_coin'];
        // }
        // if(KeyValueManager['dingdan_rmb']){
        //     delete KeyValueManager['dingdan_rmb'];
        // }
        // if(KeyValueManager['storeId']){
        //     delete KeyValueManager['storeId'];
        // }
        let clip = this.getComponent(cc.Animation);
        if (clip) {
            clip.stop();
        }
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id) {
            case C2G_REQ_CHARGE: {
                if (event['result']) {
                    KeyValueManager['orderInfo'] = event['data'];
                    EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
                    EventManager.pushEvent({'msg_id':'OPEN_LAYER','layer_id': 'dingdan_layer','hide_preLayer': false});
                }
            }
            break;
        }
    },
    onClick:function (event, id) {
        switch (id) {
            case 'return': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
            }
                break;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});