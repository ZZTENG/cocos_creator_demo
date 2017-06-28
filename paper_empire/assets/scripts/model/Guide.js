/**
 * Created by ZZTENG on 2017/06/22.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
let Guide = {

    _unitList: [],

    // use this for initialization
    initGuide: function () {
        if (KeyValueManager['is_guide']) {        //这个引导是一次性的，以后有游戏过程中的引导，服务器指定引导模块
            if (!this._unitList)
                this._unitList = [];
            if (KeyValueManager['currentScene'] == CurrentScene.SCENE_MAIN) {
                this.addUnitListenList(Guide_Unit.Login_Start);
                this.startListen(Guide_Unit.Login_Start);
            }
            else if (KeyValueManager['currentScene'] == CurrentScene.SCENE_GAME) {
                this.addUnitListenList(Guide_Unit.Game_level);
                this.startListen(Guide_Unit.Game_level);
            }
        }
    },
    addUnitListenList: function (unit) {
        this._unitList.push(unit);
    },
    removeUnitListenList: function (unit) {
        for (let i = 0; i < this._unitList.length; i += 1) {
            if (this._unitList[i] == unit)
                this._unitList.splice(i, 1);
        }
    },
    startListen: function (unit) {
        if (this.checkCondition(unit))
            EventManager.pushEvent({'msg_id': unit});
    },
    checkCondition: function (unit) {           //是否是unitList第一个
        let check_result = false;
        if (this._unitList[0] == unit) {
            check_result = true;
        }
        return check_result;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
}
module.exports = Guide;