/**
 * Created by ZZTENG on 2017/04/19.
 **/
cc.Class({
    extends: cc.Label,

    properties: {
        sp: cc.Sprite,
        _space: 0,
    },
    // use this for initialization
    onLoad: function () {

        let width = this.node.width + this._space * 2;
        let height = this.node.height;
        this.sp.node.width = width;
        this.sp.node.height = height;
    },

    // called every frame
    update: function (dt) {
    }
});
