/**
 * Created by ZZTENG on 2017/03/22.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils')
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
        recordUnit: cc.Node,
        _recordList:[],
        index:10,
    },

    // use this for initialization
    onLoad: function () {
        this._recordList = [];
        this._recordList.push(this.recordUnit.getComponent('RecordUnit'));
        this.reuse();
    },
    reuse: function () {
        EventManager.registerHandler(C2G_REQ_GET_BATTLE_HISTORY , this);
        EventManager.registerHandler(C2G_REQ_WATCH_HISTORY,this);
        this.recordUnit.active = false;
        let event = {
            url: KeyValueManager['server_url'],
            msg_id: C2G_REQ_GET_BATTLE_HISTORY,
            user_id: KeyValueManager['player_data']['user_id'],
            session_key: KeyValueManager['session'],
            record_mode: KeyValueManager['record_mode']
        };
        NetManager.sendMsg(event);
        this._dataSource = this.getComponent('DataSource');
        this._dataSource = this._dataSource.getUnit();
        this._dataSource.host = this;
        this._dataSource.bindFunc = this.onTeamUnit;
        this._dataSource.getElementFunc = this.getTeamElement;
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.defaultClip){
            clip.play();
        }
    },
    onTeamUnit:function (index, unit, data) {
        if (unit&&unit.setData)
            unit.setData(data);
    },
    getTeamElement:function (index) {
        if(index >= this._recordList.length){
            let node = cc.instantiate(this.recordUnit);
            if(!node.active) node.active = true;
            node.parent = this.recordUnit.parent;
            this._recordList.push(node.getComponent("RecordUnit"));

        }else{
            if(!this._recordList[index].node.active) this._recordList[index].node.active = true;
        }
        return this._recordList[index];
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id) {
            case C2G_REQ_GET_BATTLE_HISTORY:{
                if(event['result']) {
                    let record = event['record'];
                    if (Array.isArray(record)) {
                        if (record.length < this.index) {
                            this.index = record.length;
                        }
                        let data = [];
                        for (let i = 0; i < this.index; i++) {
                            data.push(record[i]);
                        }
                        this._dataSource.data = data;
                    }
                }
            }
            break;
            case C2G_REQ_WATCH_HISTORY:{
                if(event['result']){
                    KeyValueManager['msgData'] = event['barrage'];
                    KeyValueManager['width'] = event['width'];
                    KeyValueManager['height'] = event['height'];
                    KeyValueManager['history'] = Utils.deepCopy(event['history']);
                    if (KeyValueManager['history'][0]) {
                        if (KeyValueManager['history'][0]['name']) {
                            let name = KeyValueManager['history'][0]['name']
                            KeyValueManager['name'] = Utils.deepCopy(name);
                        }
                        if (KeyValueManager['history'][0]['panel']) {
                            let panel = KeyValueManager['history'][0]['panel']
                            KeyValueManager['panel'] = Utils.deepCopy(panel);
                        }
                        if (KeyValueManager['history'][0]['turn']) {
                            let turn = KeyValueManager['history'][0]['turn']
                            KeyValueManager['turn'] = turn + 1;
                        }
                        if (KeyValueManager['history'][0]['pid_2_camp']) {
                            let id = KeyValueManager['player_data']['player_id'];
                            let camp = KeyValueManager['history'][0]['pid_2_camp'][id];
                            KeyValueManager['camp'] = camp;
                        }
                        if (KeyValueManager['history'][0]['camps']) {
                            let camps = KeyValueManager['history'][0]['camps'];
                            KeyValueManager['camps'] = camps;
                        }
                        if (KeyValueManager['history'][0]['team_win']) {
                            let team_win = KeyValueManager['history'][0]['team_win'];
                            KeyValueManager['team_win'] = team_win;
                        }
                        if(KeyValueManager['history'][0]['theme']){
                            let theme_id = KeyValueManager['history'][0]['theme'];
                            for(let i in theme_id){
                                let id = theme_id[i];
                                let teamType = i;
                                cc.loader.loadRes(KeyValueManager['csv_kv']['theme_path']['value'] + KeyValueManager['csv_theme'][id]['Theme'], cc.Prefab,
                                    function (err, prefab) {
                                        KeyValueManager['themeList'][teamType] = prefab;
                                    });
                            }
                        }
                    }
                    KeyValueManager['isReplay'] = true;
                    Utils.enterGameScene();
                    cc.director.loadScene('loading');
                }
                break;
            }
        }
    },
    onDisable: function () {
        EventManager.removeHandler(C2G_REQ_GET_BATTLE_HISTORY, this);
        EventManager.removeHandler(C2G_REQ_WATCH_HISTORY,this);
        for(let i = 0;i < this._recordList.length;i += 1){
            if(this._recordList[i].node.active)
                this._recordList[i].node.active = false;
        }
        let clip = this.getComponent(cc.Animation);
        if (clip && clip.currentClip) {
            clip.stop();
        }
    },
    onClick:function (event, id) {
        switch (id) {
            case 'return': {
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER', 'destroy': true});
            }
            break;
            case 'watch': {
            }
            break;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});