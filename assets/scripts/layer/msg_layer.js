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
        animNode: cc.Node,
        msgLabel:cc.Label,

    },
    // use this for initialization
    onLoad: function () {
        this.reuse();
    },
    reuse: function () {
        this.animNode.getComponent(cc.Animation).play();
        // let msgLabel = this.node.getChildByName("msg_label");
        // let label = msgLabel.getComponent('LabelLocalized');
        this.msgLabel.textKey = KeyValueManager['msg_text'];

        var classMsgLayer = function () {
            EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy':true});
            this.animNode.getComponent(cc.Animation).off("finished", classMsgLayer)
        }.bind(this);
        this.animNode.getComponent(cc.Animation).on("finished",classMsgLayer);
        // 这里的 this 指向 component
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
