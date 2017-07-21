/**
 * Created by ZZTENG on 2017/03/01.
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
        test_msg: cc.Label
    },

    // use this for initialization
    reuse: function () {
        this.test_msg.string =  KeyValueManager['msg_text'];
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});