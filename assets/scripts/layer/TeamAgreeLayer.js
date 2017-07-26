/**
 * Created by ZZTENG on 2017/04/26.
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
        _teamAgreeList: null,
        teamAgreeUnit: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this._teamAgreeList = [];
        this._teamAgreeList.push(this.teamAgreeUnit.getComponent('TeamAgreeUnit'));
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_AGREE_JOIN_APPLY,this);
        KeyValueManager['team_agree_layer'] = true;
        this.teamAgreeUnit.active = false;
        this._dataSource = this.getComponent('DataSource');
        this._dataSource = this._dataSource.getUnit();
        this._dataSource.host = this;
        this._dataSource.bindFunc = this.onTeamUnit;
        this._dataSource.getElementFunc = this.getTeamElement;
        let data = [];
        for(let i = 0;i < KeyValueManager['leader_name_list'].length;i += 1){
            let data1 = [];
            data1.push(KeyValueManager['leader_name_list'][i]);
            data1.push(KeyValueManager['invite_teamId_list'][i]);
            data.push(data1);
        }
        this._dataSource.data = data;
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip){
            clip.play();
        }
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_AGREE_JOIN_APPLY,this);
        for(let i = 0;i < this._teamAgreeList.length;i += 1){
            if(this._teamAgreeList[i].node.active)
                this._teamAgreeList[i].node.active = false;
        }
        if(KeyValueManager['anim_out_state']) {
            KeyValueManager['anim_out_state'].off('finished', this.onCloseLayer, this);
        }
        if(KeyValueManager['leader_name_list'])
            delete KeyValueManager['leader_name_list'];
        if(KeyValueManager['invite_teamId_list'])
            delete KeyValueManager['invite_teamId_list'];
        if(KeyValueManager['team_agree_layer'])
            delete KeyValueManager['team_agree_layer'];
    },
    onTeamUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getTeamElement:function (index) {
        if(index >= this._teamAgreeList.length){
            let node = cc.instantiate(this.teamAgreeUnit);
            if(!node.active) node.active = true;
            node.parent = this.teamAgreeUnit.parent;
            this._teamAgreeList.push(node.getComponent("TeamAgreeUnit"));

        }else{
            if(!this._teamAgreeList[index].node.active) this._teamAgreeList[index].node.active = true;
        }
        return this._teamAgreeList[index];
    },
    onCloseLayer: function () {
        EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
    },
    onClick: function (event,id){
        if(id){
            cc.audioEngine.play(KeyValueManager['click_clip'],false,KeyValueManager['effect_volume']);
        }
        switch (id){
            case 'close': {
                let clip = this.getComponent(cc.Animation);
                let clips = clip.getClips();
                if (clips && clips[1]) {
                    KeyValueManager['anim_out_state'] = clip.play(clips[1].name);
                }
                KeyValueManager['anim_out_state'].on('finished',this.onCloseLayer,this);
            }
            break;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});