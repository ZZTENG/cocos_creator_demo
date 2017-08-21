'use strict';

var KeyValueManager = require('KeyValueManager');
var Utils = require('utils');

var dataSend = {
    dataCheck: function dataCheck() {
        this.isAvatarClear(); //Avatar提示解锁
    },

    isAvatarClear: function isAvatarClear() {
        var csvAvatar = KeyValueManager["csv_avatar"];
        var clearList = {};

        Utils.copyProperties(KeyValueManager["avatar_data"]["clear_list"], clearList);
        for (var i in csvAvatar) {
            var isIn = false;
            for (var ownIndex in clearList) {
                if (i == ownIndex) {
                    delete clearList[ownIndex];
                    isIn = true;
                    break;
                }
            }
            if (!isIn) {
                if (Utils.checkCondition(JSON.parse(csvAvatar[i].Condition))) {
                    KeyValueManager["avatar_data"]["newLock"].push(i);

                    KeyValueManager["avatar_data"]["isClearHint"] = true;
                    KeyValueManager["avatar_data"]['id'] = i;
                    KeyValueManager["avatar_data"]["clear_list"][i] = null;
                    return;
                }
            }
        }
    }
};
module.exports = dataSend;