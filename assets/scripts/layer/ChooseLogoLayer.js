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
        teamLogoUnit: cc.Node,
        _teamLogoList:[],
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
                if(KeyValueManager['selectLogoNode'].active) {
                    KeyValueManager['player_data']['player_info']['team_info']['logo'] = KeyValueManager['selectLogoId'];
                    let event1 = {
                        url: KeyValueManager['server_url'],
                        msg_id: C2G_REQ_CHOOSE_LOGO,
                        user_id: KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        id: KeyValueManager['selectLogoId']
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
        KeyValueManager['selectLogoNode'] = this.selectNode;
        this._teamLogoList = [];
        this._teamLogoList.push(this.teamLogoUnit.getComponent('TeamLogoUnit'));
        this.reuse();
    },
    reuse:function () {
        this._dataSource = this.getComponent('DataSource');
        this._dataSource = this._dataSource.getUnit();
        this._dataSource.host = this;
        this._dataSource.bindFunc = this.onteamLogoUnit;
        this._dataSource.getElementFunc = this.getTeamElement;
        let logoList = KeyValueManager['csv_teamlogo'];
        let data = [];
        for (let i in KeyValueManager['csv_teamlogo']) {
            let data1 = [];
            data1.push(i);
            data1.push(logoList[i]['TeamLogo']);
            data.push(data1);
        }
        this._dataSource.data = data;
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip) {
            clip.play();
        }

    },
    onteamLogoUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getTeamElement:function (index) {
        if(index >= this._teamLogoList.length){
            let node = cc.instantiate(this.teamLogoUnit);
            if(!node.active) node.active = true;
            node.parent = this.teamLogoUnit.parent;
            this._teamLogoList.push(node.getComponent("TeamLogoUnit"));

        }else{
            if(!this._teamLogoList[index].node.active) this._teamLogoList[index].node.active = true;
        }
        return this._teamLogoList[index];
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
