/**
 * Created by ZZTENG on 2017/07/25.
 **/
const EventManager = require('EventManager');
const KeyValueManager = require('KeyValueManager');
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

    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        let size = cc.view.getVisibleSize();
        if(size.width > size.height && KeyValueManager['screen_direct'] == ScreenDirect.Portrait){
            KeyValueManager['screen_direct'] = ScreenDirect.LandSpace;
            EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'screen_turn_layer', 'hide_preLayer': false});
        }
        else if(size.width < size.height && KeyValueManager['screen_direct'] == ScreenDirect.LandSpace){
            KeyValueManager['screen_direct'] = ScreenDirect.Portrait;
            EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
            }
    },
});