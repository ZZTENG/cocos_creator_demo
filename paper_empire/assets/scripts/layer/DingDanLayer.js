/**
 * Created by ZZTENG on 2017/04/11.
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
        coin: cc.Label,
        dingdan: cc.Label,
        price: cc.Label,
    },
    complete: function (res) {
        if(res['cpOrderId']) {
            let time = NetManager.getCurrentTime();
            KeyValueManager['order_start'] = time;
            let cpOrderId = KeyValueManager['orderInfo']['cpOrderId'];
            KeyValueManager['order_require'][cpOrderId] = {};
            KeyValueManager['order_require'][cpOrderId]['time'] = time;
            KeyValueManager['order_require'][cpOrderId]['storeId'] = KeyValueManager['storeId'];
            KeyValueManager['order_require'][cpOrderId]['timestamp'] = String(KeyValueManager['orderInfo']['timestamp']);
        }
    },

    onClick: function (event,id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case 'cancel': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
            }
            break;
            case 'pay': {
                let obj = {
                    subject: KeyValueManager['subject'],
                    appId: APPID,
                    gameName: GAMENAME,
                    accountId: KeyValueManager['player_data']['user_id'],
                    amount: KeyValueManager['dingdan_rmb'],
                    memo: KeyValueManager['orderInfo']['memo'],
                    cpOrderId: KeyValueManager['orderInfo']['cpOrderId'],
                    // paychannel:0,
                    call_back_url:'https://sandboxpay.17m3.com/paytest/demo_agent_return.aspx',
                    merchant_url:'https://sandboxpay.17m3.com/paytest/demo_agent_return.aspx',
                    sign: KeyValueManager['orderInfo']['sign'],
                    timestamp: String(KeyValueManager['orderInfo']['timestamp']),
                    channel: CHANNEL,
                    wxopenid: '',
                    complete: this.complete
                }
                sdw.chooseSDWPay(obj);
            }
            break;
        }
    },
    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_GET_CHARGE_STATUS,this);
        this.coin .string = KeyValueManager['dingdan_coin'];
        this.price.string = KeyValueManager['dingdan_rmb'] / 100 + ' 元';
        this.dingdan.string = KeyValueManager['orderInfo']['cpOrderId'];
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_GET_CHARGE_STATUS,this);
        if(KeyValueManager['orderInfo']){
            KeyValueManager['orderInfo'] = {};
            delete KeyValueManager['orderInfo'];
        }
        if(KeyValueManager['dingdan_coin'])
            delete KeyValueManager['dingdan_coin'];
        if(KeyValueManager['dingdan_rmb'])
            delete KeyValueManager['dingdan_rmb'];
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id) {
            // case C2G_REQ_GET_CHARGE_STATUS: {
            //     if(event['result']){
            //         let status = event['status'];
            //         switch (status){
            //             case OrderState.ORDER_INIT: {
            //                 console.log(OrderState.ORDER_INIT);
            //             }
            //             break;
            //             case OrderState.ORDER_SUCCESS: {
            //                 console.log(OrderState.ORDER_SUCCESS);
            //                 let item = JSON.parse(KeyValueManager['csv_store'][KeyValueManager['storeId']]['Content'])[0][1];
            //                 let count = JSON.parse(KeyValueManager['csv_store'][KeyValueManager['storeId']]['Content'])[0][3];
            //                 Utils.addItem(CURRENCY_PACKAGE,item,'count',count);
            //             }
            //             break;
            //             case OrderState.ORDER_FAILURE: {
            //                 console.log(OrderState.ORDER_FAILURE);
            //             }
            //             break;
            //         }
            //     }
            // }
            // break;
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});