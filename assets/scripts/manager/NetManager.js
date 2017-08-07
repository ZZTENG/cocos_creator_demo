const MD5 = require('md5');
const EventManager = require('EventManager');
const KeyValueManager = require('KeyValueManager');
const msgPack = require('msgPack');
const R = require('ramda');
const ErrorCodeManager = require('ErrorCodeManager');
let NetManager = {
    serverAddr: null,
    socket: null,
    serverPort: 0,
    serverTime: 0,
    serverTimeDelta: 0,
    userid: 0,
    userName: null,
    userKey: null,
    reconnectCount: 0,
    eventList:{},
    randInt: function (start, end) {
        return start + Math.floor(Math.random() * (end - start));
    },
    getCurrentTime: function () {
        return parseInt(new Date().getTime() / 1000);
    },
    getCurrentMT: function () {
        return new Date().getTime();
    },
    sendMsg: function (pEvent, showWait) {
        if(NET_HTTP)
            this.sendHttpMsg(pEvent, showWait);
        else
            this.sendTCPMsg(pEvent, showWait);
    },
    extend: function (o, n) {
        for (let p in n) {
            if (n.hasOwnProperty(p) && !o.hasOwnProperty(p) ) {
                o[p] = n[p];
            }
        }
        return o;
    },
    connectToServer:function(szServerAddr, nServerPort, cb)
    {
        this.serverAddr = szServerAddr;
        this.serverPort = nServerPort;
        this.socket = new WebSocket("ws://" + szServerAddr +":"+ nServerPort);
        this.socket.binaryType = "arraybuffer";
        var self = this;
        this.socket.onopen = function (evt) {
            //已经建立连接
            if(cb)
                cb(1);
        };
        this.socket.onclose = function (evt) {
            //已经关闭连接
            if(cb)
                cb(0);

        };
        this.socket.onmessage = function (evt) {
            self.processRecive(evt);
        };
        this.socket.onerror = function (evt) {
            //产生异常
            if(cb)
                cb(-1);
        };
    },
    disconnectServer:function()
    {
        if(this.socket != null) {
            if (this.socket.readyState != WebSocket.CLOSING)
                this.socket.close();
        }
    },
    processRecive:function(evt)
    {
        var data = evt.data;
        //先按两个两个切割开来
        var ele = data.substring(0,2);
        var low = parseInt(ele,16);
        ele = data.substring(2,4);
        var high = parseInt(ele,16);
        var flags = high << 8 ;
        flags +=low;
        if(flags != EVENT_FLAG)
        {
            return;
        }
        ele = data.substring(4,6);
        low = parseInt(ele,16);
        ele = data.substring(6,8);
        high = parseInt(ele,16);
        var length = high << 8 ;
        length += low;

        ele = data.substring(8,10);
        var low1 = parseInt(ele,16);
        ele = data.substring(10,12);
        var low2 = parseInt(ele,16);

        ele = data.substring(12,14);
        var high1 = parseInt(ele,16);

        ele = data.substring(14,16);
        var high2 = parseInt(ele,16);

        var nEventID = high2 << 24 ;

        nEventID += high1 << 16;
        nEventID += low2 << 8;
        nEventID += low1;

        ele = data.substring(16,18);
        low = parseInt(ele,16);
        ele = data.substring(18,20);
        high = parseInt(ele,16);
        var keyStart = high << 8 ;
        keyStart += low;


        var protocolData = data.substring(20, data.length);
        var data = [];
        for(var i = 0; i < protocolData.length / 2; ++i)
        {
            ele = protocolData.substring(i * 2, i *2 + 2);
            low = parseInt(ele, 16);
            data.push(low);
        }

        this.unEncryptData(data, keyStart, data.length);
        let msg = msgPack.decode(data, true);

        let pNetEvent = {};
        pNetEvent['msg_id'] = nEventID;
        pNetEvent = JSON.parse(msg);
        //handle error code
        if(pNetEvent['error_code']){
            ErrorCodeManager.handle_error_code(pNetEvent['error_code']);
        }
        cc.log('msg_id: ',pNetEvent['msg_id'],'error_code:',pNetEvent['error_code']);
        if(pNetEvent['error_code'] == 10004){           //token not right
            cc.sys.localStorage.removeItem('player_data')
            cc.director.preloadScene('openning',function (error, asset) {
                cc.director.loadScene('openning');
            });
        }
        for(let i in this.eventList)
        {
            if(nEventID == parseInt(i))
            {
                pNetEvent = this.extend(pNetEvent, this.eventList[i]);
                this.eventList[i] = null;
                delete this.eventList[i];
                break;
            }
        }
        EventManager.pushEvent(pNetEvent);
    },
    encryptData:function(data, keyStart, length)
    {
        let keyLength = KeyValueManager['EncryptKey'].length;
        let keyIndex = keyStart;
        for( let i = 0; i< length; ++i )
        {
            let index = keyIndex % keyLength;
            keyIndex++;
            let dat = KeyValueManager['EncryptKey'].charCodeAt(index);
            data[i] ^= dat;
        }
    },
    unEncryptData:function( data, keyStart, length )
    {
        let keyLength = KeyValueManager['EncryptKey'].length;
        let keyIndex = keyStart;
        for( let i = 0; i< length; ++i )
        {
            let index = keyIndex % keyLength;
            keyIndex++;
            let dat = KeyValueManager['EncryptKey'].charCodeAt(index);
            data[i] ^= dat;
        }
    },
    sendTCPMsg: function (pEvent, showWait) {
        if (this.socket && this.socket.readyState == WebSocket.OPEN)
        {
            this.reconnectCount = 0;
            if(pEvent != null) {
                var stream = [];
                var eventID = pEvent["msg_id"];
                delete pEvent['msg_id'] ;
                delete pEvent['url'];
                var data = JSON.stringify(pEvent);
                // var data = pEvent;
                var dataStream = [];
                var keyStart = this.randInt(0, KeyValueManager['EncryptKey'].length);
                dataStream = msgPack.encode(dataStream, data, 0);
                this.encryptData(dataStream, keyStart, dataStream.length);
                var length = dataStream.length + 10;
                stream.splice(0, 0, EVENT_FLAG  & 0xff);
                stream.splice(1, 0, EVENT_FLAG >>> 8);
                stream.splice(2, 0, length & 0xff);
                stream.splice(3, 0, length >>> 8);
                stream.splice(4, 0, eventID & 0xff);
                stream.splice(5, 0,(eventID >>> 8) & 0xff);
                stream.splice(6, 0,(eventID >>> 16) & 0xff);
                stream.splice(7, 0, eventID >>> 24);
                stream.splice(8, 0, keyStart & 0xff);
                stream.splice(9, 0, keyStart >>> 8);

                for(var i = 0;i < dataStream.length;i += 1)
                {
                    stream.push(dataStream[i]);
                }
                var msg = '';
                for(var i  = 0;i < stream.length;i += 1)
                {
                    var hex = 0;
                    if(typeof(stream[i]) == 'string' )
                    {
                        hex = stream[i].charCodeAt(0).toString(16);
                    }
                    else
                    {
                        hex = stream[i].toString(16);
                    }

                    if(hex.length > 1 )
                        msg += hex;
                    else
                        msg += "0" + hex;
                }
                this.socket.send(msg);
                this.eventList[eventID] = pEvent;
            }
        }
        else
        {

            this.reconnectCount++;
            this.reconnect(pEvent);
        }

    },
    reconnect:function(pEvent)
    {
        let reconnect_event = R.clone(pEvent);       //防止网络异常，程序异步，pEvent改变
        NetManager.disconnectServer();
        //先尝试重连一下，如果连接不上那么进去重连界面
        NetManager.connectToServer(this.serverAddr, this.serverPort, function (result) {
            if(result == 1)
                NetManager.sendMsg(pEvent);
            else
            {
                if(cc.sys.isNative) {
                    var event = EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'reconnect_layer'});
                    EventManager.pushEvent(event);
                }
                else if(cc.sys.isBrowser) {
                    KeyValueManager['reconnect_layer'].active = true;
                    KeyValueManager['reconnect_layer'].parent = self.node;
                    KeyValueManager['reconnect_layer'].setPosition(0, 0);
                }
                KeyValueManager['Reconnect_Event'] = reconnect_event;
            }
        });

    },
    sendHttpMsg: function (pEvent, showWait) {
        if (showWait == undefined) {
            showWait = true;
        }
        if (showWait) {
            EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'wait_layer'});
            KeyValueManager['load_wait_layer'] = false;
        }
        let url = 'http://' + pEvent["url"];
        let msgId = pEvent["msg_id"];
        let key = 'OEPuo9h5wLqJ4O6y';
        let curTime = this.getCurrentTime();
        let sign = '' + curTime + key;
        let check_sign = MD5.hex_md5(sign);
        pEvent['check_sign'] = check_sign;
        pEvent['check_time_stamp'] = curTime;
        let curTimeMT = this.getCurrentMT();
        let xhr = cc.loader.getXMLHttpRequest();
        let self = this;
        xhr.onerror = function () {
            if (!KeyValueManager['offline_mode']) {
                let pEvent = {};
                pEvent["msg_id"] = msgId;
                pEvent["result"] = false;
                pEvent["error_code"] = -1;
                EventManager.pushEvent(pEvent);
            }
            else {
                pEvent["result"] = true;
                EventManager.pushEvent(pEvent);
            }
        };
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    if (showWait) {
                        if (KeyValueManager['load_wait_layer']) {
                            EventManager.pushEvent({
                                                       'msg_id': 'CLOSE_LAYER_WITH_ID',
                                                       'layer_id': 'wait_layer',
                                                       'destroy': true
                                                   });
                            let pNetEvent = xhr.responseText;
                            pNetEvent = JSON.parse(pNetEvent);
                            pNetEvent = self.extend(pNetEvent, pEvent);
                            EventManager.pushEvent(pNetEvent);
                            KeyValueManager['load_wait_layer'] = false;
                            return;
                        }
                        else {
                            KeyValueManager['wait_to_close'] = true;

                            let pNetEvent = xhr.responseText;
                            pNetEvent = JSON.parse(pNetEvent);
                            pNetEvent = self.extend(pNetEvent, pEvent);
                            EventManager.pushEvent(pNetEvent);
                            return;
                        }

                    }
                    else {
                        let pNetEvent = xhr.responseText;
                        pNetEvent = JSON.parse(pNetEvent);
                        pNetEvent = self.extend(pNetEvent, pEvent);
                        EventManager.pushEvent(pNetEvent);
                        return;
                    }

                }
            }
        };
        xhr.open("post", url, true);
        let str = "";
        for (let i in pEvent) {
            str += "&" + i + "=" + pEvent[i];
        }

        xhr.send(str);


    }
};
module.exports = NetManager;