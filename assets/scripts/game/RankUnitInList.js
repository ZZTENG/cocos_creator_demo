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
        rank: cc.Label,
        head: cc.Sprite,
        teamName: cc.Label,
        duanwei: cc.Sprite,
        gameCount: cc.Label,
        winRate: cc.Label,
        grade: cc.Label
    },
    setData: function (data,index) {
        this.rank.string = index + 1;
        this.teamName.string = data[1];
        this.gameCount.string = data[3];
        this.winRate.string = String(data[4]) + '%';
    },
    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});