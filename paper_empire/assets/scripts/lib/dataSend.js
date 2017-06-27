const KeyValueManager = require('KeyValueManager');
const Utils = require('utils');

let dataSend = {
    dataCheck: function () {
        this.isAvatarClear();//Avatar提示解锁
    },

    isAvatarClear: function () {
        let csvAvatar = KeyValueManager["csv_avatar"];
        let clearList = {};

        Utils.copyProperties(KeyValueManager["avatar_data"]["clear_list"], clearList);
        for (let i in csvAvatar) {
            let isIn = false;
            for (let ownIndex in clearList) {
                if (i == ownIndex) {
                    delete  clearList[ownIndex];
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
    },
};
module.exports = dataSend;