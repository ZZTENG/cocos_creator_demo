'use strict';

var KeyValueManager = require('KeyValueManager');
var NetManager = require('NetManager');
var CD_POOL = {
    get_cd_base_by_id: function get_cd_base_by_id(cd_id) {
        return KeyValueManager['csv_cd_pool'][cd_id];
    },
    get_cd_last_time: function get_cd_last_time(cd_pool, cd_id) {
        if (!cd_pool) {
            return { 'result': false };
        }
        var cd_base = KeyValueManager['csv_cd_pool'][cd_id];
        var cd = cd_pool[cd_id];
        if (!cd_base || !cd) {
            return { 'result': false };
        }
        var current_time = NetManager.getCurrentTime();
        return cd['start_time'] + cd_base.CDTime - current_time;
    },
    get_cd_by_id: function get_cd_by_id(cd_pool, cd_id) {
        if (!cd_pool) {
            return { 'result': false };
        }
        var cd_base = KeyValueManager['csv_cd_pool'][cd_id];
        var cd = cd_pool[cd_id];
        if (!cd_base || !cd) {
            return { 'result': false };
        }

        if (cd_base.Type == 0) {
            if (cd['current_count'] >= cd_base.MaxCount) {
                return {
                    'result': true, 'count': cd['current_count'], 'in_cd_count': cd['in_cd_count'],
                    'startTime': cd['start_time']
                };
            }
        } else if (cd_base.Type == 2) {
            if (cd['current_count'] == 0) {
                if (cd['in_cd_count'] >= cd['current_count']) {
                    cd['in_cd_count'] = cd['current_count'];
                    return {
                        'result': false, 'count': cd['current_count'], 'in_cd_count': cd['in_cd_count'],
                        'startTime': cd['start_time']
                    };
                }
            }
            if (cd['current_count'] <= cd_base.MinCount) {
                return {
                    'result': true, 'count': cd['current_count'], 'in_cd_count': cd['in_cd_count'],
                    'startTime': cd['start_time']
                };
            }
        }
        // 经过多少时间
        var current_time = NetManager.getCurrentTime();
        var through_time = current_time - cd['start_time'];
        var cd_time = cd_base.CDTime;
        // 可回复量
        var divisor = parseInt(through_time / cd_time);
        // 剩余时间秒数
        var remainder = through_time % cd_time;
        if (divisor == 0) {
            if (cd_base.Type == 2) {
                if (cd['in_cd_count'] > 0) {
                    return {
                        'result': true, 'count': cd['current_count'], 'in_cd_count': cd['in_cd_count'],
                        'startTime': cd['start_time']
                    };
                } else {
                    return {
                        'result': false, 'count': cd['current_count'], 'in_cd_count': cd['in_cd_count'],
                        'startTime': cd['start_time']
                    };
                }
            }
            return {
                'result': true, 'count': cd['current_count'], 'in_cd_count': cd['in_cd_count'],
                'startTime': cd['start_time']
            };
        }
        var result_count = 0;
        if (cd_base.Type == 0) {
            result_count = cd['current_count'] + divisor;
            if (result_count >= cd_base.MaxCount) {
                result_count = cd_base.MaxCount;
            }
        } else if (cd_base.Type == 1) {
            result_count = cd['current_count'] - divisor;
            if (result_count >= cd_base.MinCount) {
                result_count = cd_base.MinCount;
            }
        } else {
            if (divisor > 0) {
                result_count = cd['current_count'];
                cd['in_cd_count'] = cd_base.InCDCount;

                if (result_count < cd['in_cd_count']) {
                    cd['in_cd_count'] = result_count;
                }
                remainder = 0;
            }
        }

        cd['current_count'] = result_count;
        cd['start_time'] = current_time - remainder;

        return {
            'result': true, 'count': cd['current_count'], 'in_cd_count': cd['in_cd_count'],
            'startTime': cd['start_time']
        };
    },
    add_count_by_id: function add_count_by_id(cd_pool, cd_id, count) {
        if (!cd_pool) {
            return { 'result': false };
        }
        var cd_base = KeyValueManager['csv_cd_pool'][cd_id];
        var cd = cd_pool[cd_id];
        if (!cd_base || !cd) {
            return { 'result': false };
        }

        var current_time = NetManager.getCurrentTime();
        // 如果当前是增而且次数是满的，CD重置

        if (cd_base.Type == 0) {
            if (cd['current_count'] == cd_base.MaxCount) {
                cd['start_time'] = current_time;
            }
        }
        // 如果当前是减而且次数没有了，CD重置
        else {
                if (cd['current_count'] == cd_base.MinCount) {
                    cd['start_time'] = current_time;
                }
            }
        var cur_count = cd['current_count'] + count;
        var cur_in_cd_count = cd['in_cd_count'] + count;

        // 上限判断
        if (cur_count >= cd_base.MaxCount) {
            if (cd_base.IsCanOutMax == 0) {
                cur_count = cd_base.MaxCount;
            }
            cd['start_time'] = current_time;
        } else if (cur_count <= cd_base.MinCount) {
            cur_count = cd_base.MinCount;
            cd['start_time'] = current_time;
        }

        cd['current_count'] = cur_count;
        if (cd_base.Type == 2) {
            cd['in_cd_count'] = cur_in_cd_count;
            if (cd['in_cd_count'] == 0) {
                cd['start_time'] = current_time;
            }
        }

        return {
            'result': true, 'count': cd['current_count'], 'in_cd_count': cd['in_cd_count'],
            'startTime': cd['start_time']
        };
    },
    daily_refresh_cd_pool: function daily_refresh_cd_pool(cd_pool) {
        var current_time = NetManager.getCurrentTime();
        var CD_POOL = KeyValueManager['csv_cd_pool'];
        for (var _key in CD_POOL) {
            var _info = CD_POOL[_key];
            if (!cd_pool[_key]) {
                cd_pool[_key] = { 'current_count': _info.InitCount, 'in_cd_count': _info.InCDCount };
            }
        }
        if (info.DailyRefresh == 1) {
            cd_pool[key]['current_count'] += info.Refresh;
            if (info.Type == 2) {
                cd_pool[key]['in_cd_count'] = info.InCDCount;
            } else {
                cd_pool[key]['in_cd_count'] = 0;
            }
            if (cd_pool[key]['current_count'] >= info.MaxCount) {
                if (info.IsCanOutMax == 0) {
                    cd_pool[key]['current_count'] = info.MaxCount;
                }
                cd_pool[key]['start_time'] = current_time;
            }
        }
    }

};
module.exports = CD_POOL;