const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
let NodePool = require('NodePool');
let LayerManager = cc.Class(
    {
        extends: cc.Component,
        properties: {
            defaultLayer: cc.Node,
            activeIDList: {
                default: [],
                type: cc.Integer,
                visible: false
            },
            activeLayerList: {
                default: {},
                visible: false
            },
            _layerPool: null,
            _layerPath: null
        },
        onDestroy: function () {
            EventManager.removeHandler('OPEN_LAYER', this);
            EventManager.removeHandler('CLOSE_LAYER', this);
            EventManager.removeHandler('CLOSE_LAYER_WITH_ID', this);
            EventManager.removeHandler('OPEN_HING_RAISE_LAYER', this);
            this._layerPool.clearAll();
            this._layerPool = null;
            this.activeLayerList = {};
            this.activeIDList = [];
        },
        onLoad: function () {
            this.activeLayerList = {};
            this.activeLayerList[this.defaultLayer.name] = this.defaultLayer;
            this.activeIDList.push(this.defaultLayer.name);
            this._layerPool = new NodePool();
            EventManager.registerHandler('OPEN_LAYER', this);
            EventManager.registerHandler('CLOSE_LAYER', this);
            EventManager.registerHandler('CLOSE_LAYER_WITH_ID', this);
            EventManager.registerHandler('OPEN_HING_RAISE_LAYER', this);
            if(KeyValueManager['csv_kv'] && KeyValueManager['csv_kv']['layer_path'])
                this._layerPath = KeyValueManager['csv_kv']['layer_path']['value'];

        },
        processEvent: function (event) {
            let msgId = event['msg_id'];
            switch (msgId) {
                case 'OPEN_LAYER': {
                    let layer_id = event['layer_id'];
                    let hide_preLayer = event['hide_preLayer'];
                    this.openLayer(layer_id, hide_preLayer);
                }
                    break;
                case 'CLOSE_LAYER': {
                    let destroy = event['destroy'];
                    this.closeLayer(destroy);
                }
                    break;
                case 'CLOSE_LAYER_WITH_ID': {
                    let layer_id = event['layer_id'];
                    let destroy = event['destroy'];
                    let hide_preLayer = event['hide_preLayer'];
                    this.closeLayerWithID(layer_id, destroy);
                }
                    break;
                case 'OPEN_HING_RAISE_LAYER':{
                    if(!cc.find("Canvas/hint_raise_layer")){
                        cc.loader.loadRes("prefabs/layer/hint_raise_layer", cc.Prefab, function (err, res) {
                            cc.instantiate(res).parent = cc.find("Canvas");
                            cc.loader.setAutoReleaseRecursively("prefabs/layer/hint_raise_layer", true);
                        });
                    }else{
                        EventManager.pushEvent({'msg_id': 'HINT_HINT'});
                    }
                }
                break;
            }
        },
        _showLayer: function (currentLayerID) {
            if (this.activeLayerList[currentLayerID]) {
                if (!this.activeLayerList[currentLayerID].active) {
                    this.activeLayerList[currentLayerID].active = true;
                }
            }
            else {
                let node = this._layerPool.get(currentLayerID);
                if (node) {
                    node.parent = this.node;
                    node.active = true;
                    node.setPosition(0, 0);
                    this.activeLayerList[currentLayerID] = node;
                    if (currentLayerID == 'wait_layer') {
                        KeyValueManager['load_wait_layer'] = true;
                        if (KeyValueManager['wait_to_close']) {
                            EventManager.pushEvent(
                                {
                                    'msg_id': 'CLOSE_LAYER_WITH_ID',
                                    'layer_id': 'wait_layer',
                                    'destroy': true
                                });
                            KeyValueManager['wait_to_close'] = false;
                            KeyValueManager['load_wait_layer'] = false;
                            return;
                        }
                    }
                }
                else {
                    let self = this;
                    cc.loader.loadRes(
                        this._layerPath + currentLayerID, cc.Prefab,
                        function (err, prefab) {
                            cc.loader.setAutoReleaseRecursively(self._layerPath + currentLayerID, true);
                            let node = cc.instantiate(prefab);
                            self.activeLayerList[currentLayerID] = node;
                            node.parent = self.node;
                            node.setPosition(0, 0);
                            if (currentLayerID == 'wait_layer') {
                                KeyValueManager['load_wait_layer'] = true;
                                if (KeyValueManager['wait_to_close']) {
                                    EventManager.pushEvent(
                                        {
                                            'msg_id': 'CLOSE_LAYER_WITH_ID',
                                            'layer_id': 'wait_layer',
                                            'destroy': true
                                        });
                                    KeyValueManager['wait_to_close'] = false;
                                    KeyValueManager['load_wait_layer'] = false;
                                    return;
                                }
                            }
                        }
                    );
                }

            }
        },
        closeLayerWithID: function (nID, bKillCurrent) {
            let currentLayerID = -1;
            let currentIDIndex = this.activeIDList.indexOf(nID);
            if (currentIDIndex != -1)
            {
                this.activeIDList.splice(currentIDIndex, 1);
                currentLayerID = nID;
            }
            else {
                return;
            }

            if (bKillCurrent) {
                this._layerPool.put(this.activeLayerList[currentLayerID], currentLayerID);
                delete this.activeLayerList[currentLayerID];
            }
            else {
                this.activeLayerList[currentLayerID].active = false;
            }
            //如果是最后一个， 则把倒数第二个显示出来
            if(currentIDIndex == this.activeIDList.length)
            {
                currentLayerID = this.activeIDList[this.activeIDList.length - 1];
                if (this.activeLayerList[currentLayerID]) {
                    if (!this.activeLayerList[currentLayerID].active) {
                        this.activeLayerList[currentLayerID].active = true;
                    }
                }
            }
        },
        closeLayer: function (bKillCurrent) {
            let currentLayerID = this.activeIDList[this.activeIDList.length - 1];

            if (bKillCurrent) {

                if (this.activeLayerList[currentLayerID] != null) {

                    this._layerPool.put(this.activeLayerList[currentLayerID], currentLayerID);
                    delete this.activeLayerList[currentLayerID];
                }
            }
            else {
                if (this.activeLayerList[currentLayerID]) {
                    this.activeLayerList[currentLayerID].active = false;
                }
            }

            this.activeIDList.splice(this.activeIDList.length - 1, 1);
            currentLayerID = this.activeIDList[this.activeIDList.length - 1];
            this._showLayer(currentLayerID);
            if (this.activeIDList.length <= 1) {
                EventManager.pushEvent({'msg_id': 'CLOSE_ALL_LAYER'});
            }
        },
        clear2Layer: function (layerID) {
            for (let i = 0; i < this.activeIDList.length; ++i) {
                if (this.activeIDList[i] != layerID && this.activeLayerList[this.activeIDList[i]]) {
                    this._layerPool.put(this.activeLayerList[this.activeIDList[i]], this.activeIDList[i]);
                    delete this.activeLayerList[this.activeIDList[i]];
                }
            }
            this.activeIDList = [];

            this.activeIDList.push(layerID);
            let currentLayerID = layerID;
            this._showLayer(currentLayerID);
        },
        rootOpenLayer: function (layerID) {
            for (let i in this.activeIDList) {
                this._layerPool.put(this.activeLayerList[this.activeIDList[i]], this.activeIDList[i]);
                delete this.activeLayerList[this.activeIDList[i]];
            }
            this.activeIDList = [];
            this.openLayer(layerID, false, true);
        },
        openLayer: function (layerID, bHidePreLayer) {
            for (let i in this.activeIDList) {
                let activeID = this.activeIDList[i];
                if (activeID == layerID
                    && this.activeLayerList[activeID]
                    && i != this.activeIDList.length - 1) {
                    this._layerPool.put(this.activeLayerList[activeID], activeID);
                    delete this.activeLayerList[activeID];
                    this.activeIDList.splice(i, 1);
                    break;
                }
            }
            let currentLayerID = this.activeIDList[this.activeIDList.length - 1];
            let oldLayer = currentLayerID;
            if (currentLayerID == layerID) {
                if (this.activeLayerList[currentLayerID] && !this.activeLayerList[currentLayerID].active) {
                    this.activeLayerList[currentLayerID].active = true;
                }
                return;
            }
            if (bHidePreLayer) {
                if (this.activeLayerList[oldLayer]) {
                    this.activeLayerList[oldLayer].active = false;
                }
            }
            this.activeIDList.push(layerID);
            currentLayerID = layerID;
            this._showLayer(currentLayerID);
        }

    });