const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils');
/**
 * Created by ZZTENG on 2017/04/05.
 **/
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
        gameTime: cc.Label,
        startHour: null,
        startMinute: null,
        endHour: null,
        endMinute: null
    },

    // use this for initialization
    onLoad: function () {
        this.startHour = 17;
        this.startMinute = 0;
        this.endHour = 17;
        this.endMinute = 30;
    },
    showTime: function () {
        let startHour = null;
        let startMinute = null;
        let endHour = null;
        let endMinute = null;
        if(this.startHour >= 10)
            startHour = String(this.startHour);
        else
            startHour = '0' + String(this.startHour);
        if(this.startMinute >= 10)
            startMinute = String(this.startMinute);
        else
            startMinute = '0' + String(this.startMinute);
        if(this.endHour >= 10)
            endHour = String(this.endHour);
        else
            endHour = '0' + String(this.endHour);
        if(this.endMinute >= 10)
            endMinute = String(this.endMinute);
        else
            endMinute = '0' + String(this.endMinute);
        this.gameTime.string = startHour + ': ' + startMinute + ' - ' + endHour + ': ' + endMinute;
    },
    onClick:function (event, id) {

        switch (id) {
            case 'sure': {
                KeyValueManager['startHour'] = this.startHour;
                KeyValueManager['startMinute'] = this.startMinute;
                KeyValueManager['endHour'] = this.endHour;
                KeyValueManager['endMinute'] = this.endMinute;
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
                EventManager.pushEvent({'msg_id': 'UPDATE_TIME'});
            }
            break;
            case 'cancel': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
            }
            break;
            case 'right': {
                if(this.startMinute == 30){
                    this.startMinute = 0;
                    this.startHour += 1;
                    if(this.startHour > 23)
                        this.startHour = 0;
                }
                else
                    this.startMinute = 30;
                if(this.endMinute == 30){
                    this.endMinute = 0;
                    this.endHour += 1;
                    if(this.endHour > 23)
                        this.endHour = 0;
                }
                else
                    this.endMinute = 30;
            }
            this.showTime();
            break;
            case 'left': {
                if(this.startMinute == 30)
                    this.startMinute = 0;
                else {
                    this.startMinute = 30;
                    this.startHour -= 1;
                    if(this.startHour < 0)
                        this.startHour = 23;
                }
                if(this.endMinute == 30)
                    this.endMinute = 0;
                else {
                    this.endMinute = 30;
                    this.endHour -= 1;
                    if(this.endHour < 0)
                        this.endHour = 23;
                }
                this.showTime();
            }
            break;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});