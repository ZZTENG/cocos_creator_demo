/**
 * Created by ZZTENG on 2017/03/27.
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
        _dataSource : null,
        themeUnit: cc.Node,
        _themeList:[],
        selectNode: cc.Node
    },
    onClick:function (event, id) {
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id) {
            case 'notSelect': {
                this.selectNode.active = false;
            }
                break;
            case "return": {
                if(KeyValueManager['selectThemeNode'].active) {
                    KeyValueManager['player_data']['player_info']['theme_id'] = KeyValueManager['selectThemeId'];
                    let event1 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_CHOOSE_THEME,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        id: KeyValueManager['selectThemeId']
                    };
                    NetManager.sendMsg(event1);
                }
                let clip = this.getComponent(cc.Animation);
                let clips = clip.getClips();
                if (clips && clips[1]) {
                    KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
                }
                KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
            }
                break;
        }
    },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
    // use this for initialization
    onLoad: function () {
        KeyValueManager['selectThemeNode'] = this.selectNode;
        this._themeList = [];
        this._themeList.push(this.themeUnit.getComponent('ThemeUnit'));
        this.reuse();
    },
    reuse:function () {
        this._dataSource = this.getComponent('DataSource');
        this._dataSource = this._dataSource.getUnit();
        this._dataSource.host = this;
        this._dataSource.bindFunc = this.onthemeUnit;
        this._dataSource.getElementFunc = this.getTeamElement;
        let themeList = KeyValueManager['player_data']['player_info']['theme_list'];
        let data = [];
        for (let i = 0; i < themeList.length; i++) {
            let data1 = [];
            data1.push(themeList[i]);
            let themeCount = Utils.getItem(ITEM_PACKAGE,themeList[i],'count');
            data1.push(themeCount);
            data.push(data1);
        }
        this._dataSource.data = data;
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip) {
            clip.play();
        }

    },
    onthemeUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getTeamElement:function (index) {
        if(index >= this._themeList.length){
            let node = cc.instantiate(this.themeUnit);
            if(!node.active) node.active = true;
            node.parent = this.themeUnit.parent;
            this._themeList.push(node.getComponent("ThemeUnit"));

        }else{
            if(!this._themeList[index].node.active) this._themeList[index].node.active = true;
        }
        return this._themeList[index];
    },
    onDisable: function () {
        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
