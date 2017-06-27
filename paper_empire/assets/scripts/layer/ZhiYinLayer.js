/**
 * Created by ZZTENG on 2017/03/01.
 **/
const Guide = require('Guide');
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
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
        maskNode: cc.Node,
        guideLabel: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        KeyValueManager['maskNode'] = this.maskNode;
        KeyValueManager['zhiYinLayer'] = this.node;
        KeyValueManager['guide_label'] = this.guideLabel;
        Guide.initGuide();
    },
    onClick: function (event,data) {
        switch (data){
            case 'dianji': {
                EventManager.pushEvent({'msg_id': 'guide_dianji','touch_event': event});
            }
            break;
            case 'move': {

            }
            break;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});