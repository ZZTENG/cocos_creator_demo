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
        msgLabel:cc.Label,

    },
    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
        this.msgLabel.getComponent(cc.Animation).play();
        let msgLabel = this.node.getChildByName("msg_label");
        let label = msgLabel.getComponent('LabelLocalized');
        label.textKey = KeyValueManager['msg_text'];

        var classMsgLayer = function () {
            EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
            this.msgLabel.getComponent(cc.Animation).off("finished", classMsgLayer)
        }.bind(this);
        this.msgLabel.getComponent(cc.Animation).on("finished",classMsgLayer);
        // 这里的 this 指向 component
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
