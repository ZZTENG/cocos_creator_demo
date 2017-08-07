const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const CSVModel = require('CSVModel');
const CD_POOL = require('cd_pool');
const R = require('ramda');
let utils =
{
    randInt: function (start, end) {
        return start + Math.floor(Math.random() * (end - start));
    },
    randArray: function (arr) {
        for (let i = 0; i < arr.length; ++i) {
            let target = this.randInt(0, arr.length);
            let temp = arr[target];
            arr[target] = arr[i];
            arr[i] = temp;
        }
        return arr;
    },
    URLEncode: function (clearString) {
        var output = '';
        var x = 0;
        clearString = clearString.toString();
        var regex = /(^[a-zA-Z0-9-_.]*)/;
        while (x < clearString.length) {
            var match = regex.exec(clearString.substr(x));
            if (match != null && match.length > 1 && match[1] != '') {
                output += match[1];
                x += match[1].length;
            } else {
                if (clearString.substr(x, 1) == ' ') {
                    //鍘熸枃鍦ㄦ鐢?clearString[x] == ' ' 鍋氬垽鏂? 浣唅e涓嶆敮鎸佹妸瀛楃涓插綋浣滄暟缁勬潵璁块棶,
                    //淇敼鍚庝袱绉嶆祻瑙堝櫒閮藉彲鍏煎
                    output += '+';
                }
                else {
                    var charCode = clearString.charCodeAt(x);
                    var hexVal = charCode.toString(16);
                    output += '%' + ( hexVal.length < 2 ? '0' : '' ) + hexVal.toUpperCase();
                }
                x++;
            }
        }
        return output;
    },
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    randObject: function (object) {
        let newObj = {};
        let key = Object.keys(object);
        this.randArray(key);
        for(let i = 0;i < key.length; i += 1){
            newObj[key[i]] = object[key[i]];
        }
        return newObj;
    },
    arrayMost: function (arr) {     //数组元素出现的最大次数
        if (!arr.length)
            return;
        if (arr.length === 1)
            return arr;
        let res = {};
        // 遍历数组
        for (var i=0,l=arr.length;i<l;i++) {
            if (!res[arr[i]]) {
                res[arr[i]] = 1;
            } else {
                res[arr[i]]++;
            }
        }
        // 遍历 res 得到most
        let maxNum = 0,
            maxEle = [];
        for(let i in res){
            if(res[i] > maxNum){
                maxNum = res[i]
            }
        }
        //找出一样多的most
        for(let i in res){
            if(res[i] == maxNum)
                maxEle.push(parseInt(i));
        }
        return maxEle;
    },
    nodeMove: function (event,node) {
        let touchDelta = event.touch.getDelta();
        let currentPos = node.getPosition();
        let posX = currentPos.x + touchDelta.x;
        let posY = currentPos.y + touchDelta.y;
        node.setPosition(cc.v2(posX,posY));
    },
    nameToObject: function (name, type) {
        if (name == undefined || name == "") {
            return null;
        }
        type = type || "function";
        let arr = name.split(".");

        let fn = window || this;
        for (let i = 0, len = arr.length; i < len; i++) {
            try {
                fn = fn[arr[i]];
            }
            catch (err) {
                break;
            }
        }
        if (typeof fn != type) {

            return null;
        }
        return fn;
    },
    copyProperties: function (params, target) {
        if (!params || !target) return;
        for (let k in params) {
            target[k] = params[k];
        }
    },

    loadCSV: function (name, path, key, callback) {
        let storagePath = path;
        // if(CC_JSB && cc.sys.isMobile && cc.sys.isNative)
        // {
        //     storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + path);
        //     cc.log(storagePath);
        // }

        cc.loader.load(cc.url.raw(storagePath), function (err, txt) {

            // 读取成功，err为null，读取失败才会有错误信息：err:{‘status':0,’errorMessage’:’….'}

            // txt为文本内容
            if (txt) {
                KeyValueManager[name] = CSVModel.parse(key, txt);
                if (callback) {
                    callback.call();
                }
            }
            cc.loader.release(cc.url.raw(storagePath));

        });
    },
    guestLogin: function (user_id, token, refresh_token) {

        KeyValueManager['server_url'] = KeyValueManager['channel_info']['ThirdURL'] + ':' + KeyValueManager['channel_info']['ThirdPort'] + '/gate_login';
        let platform = 'windows';
        if (cc.sys.isMobile && cc.sys.isNative) {
            if (cc.sys.platform == cc.sys.ANDROID) {
                platform = 'Android';
            }
            else {
                platform = 'IOS';
            }
        }
        let event = {
            url: KeyValueManager['server_url'],
            msg_id: C2G_REQ_LOGIN,
            user_id: user_id,
            channel: 'lanyu',
            platform: platform,
            token: token,
            refresh_token: refresh_token,
        };
        if(!NET_HTTP)
        {
            NetManager.disconnectServer();
            NetManager.connectToServer(KeyValueManager['channel_info']['ThirdURL'], KeyValueManager['channel_info']['ThirdPort'],function (err) {
                if(err == 1)
                    NetManager.sendMsg(event);
            });
        }
        else
        {
            NetManager.sendMsg(event);
        }
    },
    platformLogin: function () {
        KeyValueManager['server_url'] = KeyValueManager['channel_info']['ThirdURL'] + ':' + KeyValueManager['channel_info']['ThirdPort'] + '/gate_login';
        let platform = 'windows';
        if (cc.sys.isMobile && cc.sys.isNative) {
            if (cc.sys.platform == cc.sys.ANDROID) {
                platform = 'Android';
            }
            else {
                platform = 'IOS';
            }
        }
        let event = {
            url: KeyValueManager['server_url'],
            msg_id: C2G_REQ_LOGIN,
            channel: CHANNEL,
            platform: platform,
        };
        let url = window.location['href'];
        let urlArr = url.split('?');
        let objArr = urlArr[1].split('&');
        for(let i = 0;i < objArr.length;i += 1){
            let arr = objArr[i].split('=');
            if(arr[0] == 'uid') {
                KeyValueManager['uid'] = arr[1];
                event['user_id'] = KeyValueManager['uid'];
            }
            else if(arr[0] == 'nick'){
                let nick = decodeURIComponent(arr[1]);
                event[arr[0]] = nick.substr(0,7);
                continue;
            }
            else if(arr[0] == 'paper_empire_gameId'){
                KeyValueManager['gameId'] = event['paper_empire_gameId'];
            }
            else if(arr[0] == 'paper_empire_roomId'){
                KeyValueManager['roomId'] = event['paper_empire_roomId'];
            }
           event[arr[0]]= decodeURIComponent(arr[1]);
        }
        if(!NET_HTTP)
        {
            NetManager.disconnectServer();
            NetManager.connectToServer(KeyValueManager['channel_info']['ThirdURL'], KeyValueManager['channel_info']['ThirdPort'],function (err) {
                if(err == 1)
                    NetManager.sendMsg(event);
            });
        }
        else
        {
            NetManager.sendMsg(event);
        }
    },
    enterMainScene: function () {
        KeyValueManager['onLoadingEnd'] = function () {
            cc.director.loadScene(KeyValueManager['preloadScene']);
        };
        KeyValueManager['onLoadingFinished']= function () {

        };
        KeyValueManager['loadingFunc'] = function (onProgress) {
            KeyValueManager['loadProcess'] = 0;
            KeyValueManager['loadTotalCount'] = 0;
            KeyValueManager['preloadScene'] = 'main';
            cc.director.preloadScene('main', function (error, asset) {
                if (onProgress) {
                    onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                }
            });
            KeyValueManager['loadTotalCount']++;
        };
    },
    enterLoginScene: function () {
        KeyValueManager['onLoadingEnd'] = function () {
            cc.director.loadScene(KeyValueManager['preloadScene']);
        };
        KeyValueManager['onLoadingFinished']= function () {

        };
        KeyValueManager['loadingFunc'] = function (onProgress) {
            KeyValueManager['loadProcess'] = 0;
            KeyValueManager['loadTotalCount'] = 0;
            KeyValueManager['preloadScene'] = 'title';
            cc.director.preloadScene('title', function (error, asset) {
                if (onProgress) {
                    onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                }
            });
            KeyValueManager['loadTotalCount']++;
        };
    },
    enterGameScene: function () {
        KeyValueManager['onLoadingEnd'] = function () {
            cc.director.loadScene(KeyValueManager['preloadScene']);
        };
        KeyValueManager['onLoadingFinished']= function () {

        };
        KeyValueManager['loadingFunc'] = function (onProgress) {
            KeyValueManager['loadProcess'] = 0;
            KeyValueManager['loadTotalCount'] = 0;
            let theme_id = KeyValueManager['reTheme'];
            for (let i in theme_id) {
                let id = theme_id[i];
                let teamType = i;
                cc.loader.loadRes(KeyValueManager['csv_kv']['theme_path']['value'] + KeyValueManager['csv_theme'][id]['Theme'], cc.Prefab,
                    function (err, prefab) {
                        if (onProgress) {
                            KeyValueManager['themeList'][teamType] = prefab;
                            onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                        }
                    });
                KeyValueManager['loadTotalCount']++;
            }
            for(let i = 0;i < KeyValueManager['camps'].length;i += 1){
                for(let j = 0;j < KeyValueManager['camps'][i].length;j += 1){
                    let camp = KeyValueManager['camps'][i][j];
                    cc.loader.loadRes(KeyValueManager['csv_kv']['land_around_path']['value'] + LAND_AROUND[camp], cc.Prefab,
                        function (err, prefab) {
                            if(err){
                                cc.log(err);
                            }
                            else{
                                if (onProgress) {
                                    KeyValueManager['land_around'][camp] = prefab;
                                    onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                                }
                            }
                        });
                    KeyValueManager['loadTotalCount']++;
                }
            }
            KeyValueManager['preloadScene'] = 'game';
            cc.director.preloadScene('game', function (error, asset) {
                if (onProgress) {
                    onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                }
            });
            KeyValueManager['loadTotalCount']++;
        };
    },
    enterGame: function () {
        //自动进入游戏
        let self = this;
        KeyValueManager['onLoadingEnd'] = function () {
            cc.director.loadScene(KeyValueManager['preloadScene']);
        };
        KeyValueManager['onLoadingFinished']= function () {

        };
        KeyValueManager['loadingFunc'] = function (onProgress) {
            KeyValueManager['loadProcess'] = 0;
            KeyValueManager['loadTotalCount'] = 0;

            self.loadCSV('csv_theme', 'resources/csv/theme.csv', 'ID', function () {
                if (onProgress) {
                    onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                   //游戏重连加载资源
                    if(KeyValueManager['in_game'] && KeyValueManager['reTheme']) {
                        let theme_id = KeyValueManager['reTheme'];
                        for (let i in theme_id) {
                            let id = theme_id[i];
                            let teamType = i;
                            cc.loader.loadRes(KeyValueManager['csv_kv']['theme_path']['value'] + KeyValueManager['csv_theme'][id]['Theme'], cc.Prefab,
                                function (err, prefab) {
                                    if (onProgress) {
                                        KeyValueManager['themeList'][teamType] = prefab;
                                        onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                                    }
                                });
                            KeyValueManager['loadTotalCount']++;
                        }
                        for(let i = 0;i < KeyValueManager['camps'].length;i += 1){
                            for(let j = 0;j < KeyValueManager['camps'][i].length;j += 1){
                                let camp = KeyValueManager['camps'][i][j];
                                cc.loader.loadRes(KeyValueManager['csv_kv']['land_around_path']['value'] + LAND_AROUND[camp], cc.Prefab,
                                    function (err, prefab) {
                                        if(err){
                                            cc.log(err);
                                        }
                                        else{
                                            if (onProgress) {
                                                KeyValueManager['land_around'][camp] = prefab;
                                                onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                                            }
                                        }
                                    });
                                KeyValueManager['loadTotalCount']++;
                            }
                        }
                    }
                }
            });
            KeyValueManager['loadTotalCount']++;
            self.loadCSV('csv_recommend', 'resources/csv/recommend.csv', 'ID', function () {
                if (onProgress) {
                    onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                }
            });
            KeyValueManager['loadTotalCount']++;
            self.loadCSV('csv_store', 'resources/csv/store.csv', 'ID', function () {
                if (onProgress) {
                    onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                }
            });
            KeyValueManager['loadTotalCount']++;
            self.loadCSV('csv_teamlogo', 'resources/csv/teamlogo.csv', 'ID', function () {
                if (onProgress) {
                    onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                }
            });
            KeyValueManager['loadTotalCount']++;
            //根据当前的关卡去生成关卡节点
            //是否已经在游戏里面
            if(KeyValueManager['in_game'])
                KeyValueManager['preloadScene'] = 'game';
            else
                KeyValueManager['preloadScene'] = 'main';
            if(KeyValueManager['gameId']){      //通过分享连接观看游戏，覆盖是否自己账号在游戏里面
                KeyValueManager['preloadScene'] = 'game';
            }
            cc.director.preloadScene('main', function (error, asset) {
                if (onProgress) {
                    onProgress.call(this, ++KeyValueManager['loadProcess'], KeyValueManager['loadTotalCount']);
                }
            });
            KeyValueManager['loadTotalCount']++;
        };
    },
    savePlayerData: function () {
        cc.sys.localStorage.setItem('player_data', JSON.stringify(KeyValueManager['player_data']));

    },
    pad: function (num, n) {
        let y = '00000000000000000000000000000' + num; //爱几个0就几个，自己够用就行
        return y.substr(y.length - n);
    },
    time2MS: function (value) {
        let oMinutes = this.pad(parseInt(value / 60 % 60), 2);
        let oSeconds = this.pad(parseInt(value % 60), 2);
        return '' + oMinutes + ':' + oSeconds;

    },
    time3MS: function (value) {
        let oHour = this.pad(parseInt(value / 60 / 60 % 60), 2);
        let oMinutes = this.pad(parseInt(value / 60 % 60), 2);
        let oSeconds = this.pad(parseInt(value % 60), 2);
        return oHour + ':' + oMinutes + ':' + oSeconds;
    },

    checkCondition: function (conditionList) {
        for (let i = 0; i < conditionList.length; ++i) {
            if (!this.checkItem(conditionList[i][0], conditionList[i][1], conditionList[i][2], conditionList[i][3])) {
                return false;
            }
        }
        return true;
    },
    getItemCsv: function (itemName) {
        return KeyValueManager['csv_items'][itemName];
    },
    checkItem: function (slotName, itemName, type, value) {
        if (slotName == CURRENCY_PACKAGE && itemName == ENERGY_ID && type == 'count') {
            let result = CD_POOL.get_cd_by_id(KeyValueManager['player_data']['player_cd_pool'], ENERGY_CD);
            if (result['result']) {
                if (value <= result['count']) {
                    return true;
                }
            }
            return false;
        }
        let playerData = KeyValueManager['player_data']['player_package'];
        let slot = playerData[slotName];
        if (!slot) {
            return false;
        }
        let item = slot[itemName];
        if (!item) {
            return false;
        }
        let index = SLOT_MAP[slotName][type];
        if (item[index] < value) {
            return false;
        }
        return true;
    },
    getItem: function (slotName, itemName, type) {
        if (slotName == CURRENCY_PACKAGE && itemName == ENERGY_ID && type == 'count') {
            let result = CD_POOL.get_cd_by_id(KeyValueManager['player_data']['player_cd_pool'], ENERGY_CD);
            if (result['result']) {
                return result['count'];
            }
            return 0;
        }
        let playerData = KeyValueManager['player_data']['player_package'];
        let slot = playerData[slotName];
        if (!slot) {
            return 0;
        }
        let item = slot[itemName];
        if (!item) {
            return 0;
        }
        let index = SLOT_MAP[slotName][type];
        return slot[itemName][index];
    },
    useItem: function (slotName, itemName, type, value) {
        if (slotName == CURRENCY_PACKAGE && itemName == ENERGY_ID && type == 'count') {
            let result = CD_POOL.add_count_by_id(KeyValueManager['player_data']['player_cd_pool'], ENERGY_CD, -value);
            if (result['result']) {
                return true;
            }
            return false;
        }
        let playerData = KeyValueManager['player_data']['player_package'];
        let slot = playerData[slotName];
        if (!slot) {
            return false;
        }
        let item = slot[itemName];
        if (!item) {
            return false;
        }
        let index = SLOT_MAP[slotName][type];
        if (item[index] < value) {
            return false;
        }
        else {
            item[index] -= value;
            let canDel = true;
            for (let i = 0; i < item.length; ++i) {
                if (item[i] > 0) {
                    canDel = false;
                    break;
                }
            }
            if (canDel) {
                item = [];
                delete slot[itemName];
            }
        }
        return true;
    },
    setItem: function (slotName, itemName, type, value) {
        if (slotName == CURRENCY_PACKAGE && itemName == ENERGY_ID && type == 'count') {
            let result = CD_POOL.add_count_by_id(KeyValueManager['player_data']['player_cd_pool'], ENERGY_CD, value);
            if (result['result']) {
                return result['count'];
            }
            return false;
        }
        let playerData = KeyValueManager['player_data']['player_package'];
        let slot = playerData[slotName];
        if (!slot) {
            playerData[slotName] = {};
            slot = playerData[slotName];
        }
        let item = slot[itemName];
        if (!item) {
            slot[itemName] = [];
            item = slot[itemName];
        }
        let index = SLOT_MAP[slotName][type];
        for (let i = 0; i < index + 1; ++i) {
            if (item.length <= i) {
                item.push(0);
            }
        }
        item[index] = value;
        return item[index];
    },
    addItem: function (slotName, itemName, type, value) {
        if (slotName == CURRENCY_PACKAGE && itemName == ENERGY_ID && type == 'count') {
            let result = CD_POOL.add_count_by_id(KeyValueManager['player_data']['player_cd_pool'], ENERGY_CD, value);
            if (result['result']) {
                return result['count'];
            }
            return false;
        }
        let playerData = KeyValueManager['player_data']['player_package'];
        let slot = playerData[slotName];
        if (!slot) {
            playerData[slotName] = {};
            slot = playerData[slotName];
        }
        let item = slot[itemName];
        if (!item) {
            slot[itemName] = [];
            item = slot[itemName];
        }
        let index = SLOT_MAP[slotName][type];
        for (let i = 0; i < index + 1; ++i) {
            if (item.length <= i) {
                item.push(0);
            }
        }
        item[index] += value;
        return item[index];
    },
    filter: function (arr, func) {
        return R.filter(func, arr);
    },
    drop_count: function (dropId) {
        let dropInfo = KeyValueManager['csv_drop'][dropId];
        let dropCount = JSON.parse(dropInfo.Count);
        let rateTotal = 0;
        for(let i = 0;i < dropCount.length;i += 1)
            rateTotal += dropCount[i]['rate'];
        let randomResult = this.randInt(0,rateTotal);
        let rateBase = 0;
        for(let j = 0;j < dropCount.length;j += 1){
            rateBase += dropCount[j]['rate'];
            if(randomResult < rateBase)
            {
                return dropCount[j]['count'];
                break;
            }
        }
    },
    gen_drop: function (dropId, count, canRepeat, excludeList) {
        let dropInfo = KeyValueManager['csv_drop'][dropId];
        let dropItems = JSON.parse(dropInfo.Items);
        if (excludeList) {
            for (let i = 0; i < excludeList.length; ++i) {
                dropItems = this.filter(dropItems, function (item) {
                    if (item['id'] != excludeList[i]['id'] || item['count'] != excludeList[i]['count']) {
                        return true;
                    }
                    return false;
                });
            }
        }
        let rateTotal = R.sum(R.pluck('rate', dropItems));
        let dropOutItem= [];
        let randomResult = 0;
        for (let i = 0; i < count; ++i) {
            if (rateTotal > 0) {
                randomResult = this.randInt(0, rateTotal);
            }
            let rateBase = 0;
            for (let j = dropItems.length - 1; j >= 0; --j) {
                if (randomResult < rateBase + dropItems[j]['rate']) {
                    let newDropInfo = KeyValueManager['csv_drop'][dropItems[j]['id']];
                    if (newDropInfo) {
                        let newDropItem = this.gen_drop(newDropInfo.Id, 1, canRepeat, excludeList);
                        if (newDropItem.length > 0) {
                            dropOutItem.push(newDropItem[0])
                        }
                    }
                    else {
                        dropOutItem.push(
                            {
                                'id': dropItems[j]['id'], 'count': dropItems[j]['count'],
                                'package': dropItems[j]['package'],
                                'rate': randomResult
                            });
                    }

                    if (!canRepeat) {
                        // 从当前列表里面移除掉这个物品 并把总的机率减低
                        rateTotal -= dropItems[j]["rate"];
                        dropItems.splice(j, 1);
                    }
                    break;
                }
                else {
                    rateBase += dropItems[j]["rate"];
                }
            }
        }
        return dropOutItem;
    },
    isEmptyObject:function(obj) {
       return R.isEmpty(obj);
    },
    isHelpUnlock:function () {
        let lockList = KeyValueManager["player_data"]["player_info"]["unlocked"];
        if(KeyValueManager['currentLevel']){
            var condition = JSON.parse(KeyValueManager["csv_level"][KeyValueManager['currentLevel']]["FrontMapId"]);
            let frontID = null;
            if(condition.length){
                frontID = condition[0][1];
            }
            if(lockList){
                if(frontID in lockList){
                    return true;
                }
            }
        }
        return false;
    },
    openLayerAnimation:function (self) {
        let clip = self.getComponent(cc.Animation);
        let openBlack = function () {
            if(cc.find("ForbidTouch")){
                if(!cc.find("ForbidTouch").active) cc.find("ForbidTouch").active = true;
            }
        }
        let closeBlack = function () {
            if(cc.find("ForbidTouch")) {
                if (cc.find("ForbidTouch").active) cc.find("ForbidTouch").active = false;
            }
            clip.off("play", openBlack, self);
            clip.off("finished", closeBlack, self);
        }
        if (clip) {
            clip.play();
            clip.on("play", openBlack, self);
            clip.on("finished", closeBlack, self);
        }
    },
    hintItemRaise:function (self, itemId, isAdd, count) {
        if(!KeyValueManager["hintItemRaise"]){
            KeyValueManager["hintItemRaise"] = [];
        }
        let data = {};
        data["type"] = HINT_BOX.TEXT_ICO;
        data["node"] = self;
        data["itemId"] = itemId;
        data["isAdd"] = isAdd;
        data["count"] = count;
        KeyValueManager["hintItemRaise"].push(data);
        EventManager.pushEvent({'msg_id': 'OPEN_HING_RAISE_LAYER'});
   },
    deepCopy : function(obj) {
        return R.clone(obj);
    },
    //数组数值大小排序（从小到大）
    sortDiff: function (arr) {
        let newArr = [];
        if(arr instanceof Array){
            let diff = function (a,b) {
                return a - b;
            };
            newArr =R.sort(diff,arr);
        }
        return newArr;
    },
};
module.exports = utils;