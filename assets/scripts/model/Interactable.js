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
        interactable: {
            "default": true,
            tooltip: "i18n:COMPONENT.button.interactable",
            animatable: false
        },
        clickEvents: {
            "default": [],
            type: cc.Component.EventHandler,
            tooltip: "i18n:COMPONENT.button.click_events"
        }
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
        this.node.on(cc.Node.EventType.MOUSE_ENTER, this._onMouseMoveIn, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this._onMouseMoveOut, this);
    },
    _onTouchEnded: function(event) {
        if (!this.interactable || !this.enabledInHierarchy) {
            return;
        }
        cc.Component.EventHandler.emitEvents(this.clickEvents, event);
        this.node.emit("click", this);
        event.stopPropagation();
    },
    _onTouchBegan: function(event) {
        if (!this.interactable || !this.enabledInHierarchy) {
            return;
        }
        event.stopPropagation();
        /*
         疯狂点击会导致界面卡死:界面动画未完成，界面未关闭只是透明度为零，增加预防措施
         如果屏蔽层的透明度还是零，再次点击关闭屏蔽层所在界面
         */
        if(this.node.opacity == 0){
            cc.log('pingbi layer opacity is 0');
            EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
        }
    },
    _onTouchMove: function(event) {
        if (!this.interactable || !this.enabledInHierarchy) {
            return;
        }
        event.stopPropagation();
    },
    _onTouchCancel: function() {
        if (!this.interactable || !this.enabledInHierarchy) {
            return;
        }
    },
    _onMouseMoveIn: function() {
        if (!this.interactable || !this.enabledInHierarchy) {
            return;
        }

    },
    _onMouseMoveOut: function() {

    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
