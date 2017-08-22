'use strict';

window.GameMode = cc.Enum({
    MODE_1V1: 0,
    MODE_2V2: 1,
    MODE_3V3: 2,
    MODE_2V2V2: 3,
    MODE_TEAM: 4, //团队模式
    MODE_CUSTOM: 5, //自定义
    MODE_IDENTITY: 6, //三国身份模式
    MODE_TIANTI: 7 //天梯模式
});
window.RecordMode = cc.Enum({
    MODE_1V1: 0,
    MODE_2V2: 1,
    MODE_3V3: 2,
    MODE_2V2V2: 3,
    MODE_SELF_TEAM: 4, //个人团队模式记录
    MODE_CUSTOM: 5, //自定义
    MODE_IDENTITY: 6, //三国身份模式
    MODE_TIANTI: 7 //天梯模式
});
//当前场景
window.CurrentScene = cc.Enum({
    SCENE_OPENGING: 0,
    SCENE_LOIN: 1,
    SCENE_MAIN: 2,
    SCENE_GAME: 3
});
//记录数据类型
window.RecordData = cc.Enum({
    RECODE_MAP_DATA: 1,
    RECODE_RANK: 2,
    RECODE_DEATH: 3
});
//主题名字
window.ThemeName = cc.Enum({
    TM007: '火山',
    TM008: '海洋',
    TM009: '森林',
    TM0010: '雪人',
    TM0011: '基本主题'
});
//屏幕方向
window.ScreenDirect = cc.Enum({
    LandSpace: 1,
    Portrait: 2
});
/*
支付类型：
0： 金币购买皮肤
1： 砖石购买皮肤
2： RMB买砖石
3： 砖石换金币
 */
window.PayType = cc.Enum({
    Coin: 0,
    Diamond: 1,
    RMB: 2,
    DiamondToCoin: 3
});
//新手指引单元小组编号
var Guide_Unit = {
    Login_Start: 1101,
    Game_level: 1102
};
//单元小组操作编号
var Unit_Step = {
    Login_Start: {
        Game_1v1: 1101001 //当成消息id，进行单元监听，前缀加110来区分与服务器的消息id
    },
    Game_level: {
        Choose_MainCity: 1102001,
        Move_MainCity: 1102002,
        Search_Move: 1102003,
        Occupy_ViceCity: 1102004,
        Occupy_MainCity: 1102005
    }
};
var EVENT_FLAG = 21586;
var NET_HTTP = false;
//android端版署标识
var ANDROID_CHECK = false;
window.GAME_PLATFORM = {
    ANDROID: 1,
    IOS: 2,
    WEB: 3,
    ANDROID_CHECK: 4
};
//地块边缘条名字
var LAND_AROUND = ['cheng', 'hong', 'huang', 'lan', 'lv', 'zi'];
var SLOT_MAP = {
    'level': {
        'star': 0,
        'count': 0,
        'score': 1,
        "card": 2
    },
    'chapter': {
        'star': 0,
        'count': 0
    },
    'currency': {
        'count': 0
    },
    'item': {
        'count': 0
    },
    'player_cd_pool': {
        'count': 0,
        'start_time': 1,
        'in_cd_count': 2
    },
    'achieve': {
        'count': 0,
        'star': 1
    },
    'tmp_achieve': {
        'count': 0,
        'star': 1
    },
    'avatar': {
        'level': 0
    }
};
//回合时间
var ROUND_TIME = 0.5;
//普通方块添加兵的回合数
var LAND_ROUND_COUNT = 50;
//城池添加兵的回合数
var CITY_ROUND_COUNT = 2;
//初始地块上兵的数量
var INIT_COUNT = 0;
//初始地块数量
var INIT_LAND = 1;
//初始城池数量
var INIT_CITY = 1;
//游戏设计场景分辨率
var SCENE_WIGHT = 960;
var SCENE_HIGHT = 1280;
//电魂接入app_id,游戏名字，渠道id
var APPID = '1571601337';
var GAMENAME = '纸上帝国H5';
var CHANNEL = '10000';
//查询订单间隔时间，订单查询持续时间，订单查询过期
var ORDER_REQUIRE_SPACE_TIME = 3;
var ORDER_REQUIRE_LAST_TIME = 1 * 60;
var ORDER_REQUIRE_OVER_TIMESTAMP = 0;
//向服务器一次拿回放数
var HISTORY_TURN_COUNT = 100;
//提前向服务器拿回合的数
var HISTORY_LAST_COUNT = 50;
var HEARTBEAT_LAST_TIME = 60;
//游戏中脚本挂起时间拿最新数据
var SUSPEND_TIME = 2;
var SUSPEND_LOGIN_TIME = 5 * 60;
//loading等待时间
var WAIT_GAME_START = 10;

var CURRENCY_PACKAGE = 'currency';
var CD_PACKAGE = 'player_cd_pool';

var ENERGY_ID = 'IT0001';
var COIN_ID = 'IT0002';
var GOLD_ID = 'IT0003';
var ENERGY_CD = 'CD101';
var PAY_REVIVE_CD = 'CD105';
var WISH_CD = 'CD107';

//商店道具
//////////////////////////////////////////////
var ITEM_PACKAGE = 'item';
var TOOL_MAGNIFIER = 'IT0201';
var TOOL_HOURGLASS = 'IT0209';
var TOLL_BAG = 'IT0202';
var TOOL_CRYSTALBALL = 'IT0208';

var ITEM_ENERGY_1 = 'IT0009';
var ITEM_ENERGY_2 = 'IT0010';
var ITEM_ENERGY_3 = 'IT0011';

var GIVE_WINS_ITEM_COUNT = 1;

//CSV道具类型
var CSV_ROAD = cc.Enum({
    TYPE: 0,
    ITEMID: 1,
    COUNT: 2,
    VALUE: 3
});
var LAND_RULE = [[0, 1, 0, 1], [0, 1, 1, 1], [0, 1, 1, 0], [1, 1, 1, 0], [1, 0, 1, 0], [1, 0, 1, 1], [1, 0, 0, 1], [1, 1, 0, 1], [1, 1, 1, 1], [0, 0, 1, 1], [1, 1, 0, 0], [0, 0, 0, 1], [0, 1, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]];
var FOG_RULE = [[0, 1, 0, 1], [0, 1, 1, 1], [0, 1, 1, 0], [1, 1, 1, 0], [1, 0, 1, 0], [1, 0, 1, 1], [1, 0, 0, 1], [1, 1, 0, 1], [1, 1, 1, 1], [0, 0, 1, 1], [1, 1, 0, 0], [0, 0, 0, 1], [0, 1, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]];
//好友列表一次性显示数量
var ADD_FRIEND_COUNT = 30;

//提示弹幕类型
var HINT_BOX = cc.Enum({
    TEXT: 0,
    ICO: 1,
    TEXT_ICO: 2
});

//好友赠送体力标志
var FRIEND_ENERGY = cc.Enum({
    PRESENT: 0,
    PRESENT_ALREADY: 1,
    BLAG_ALREADY: 2,
    RECEIVE_ALREADY_ONE: 3,
    RECEIVE_ALREADY_TWO: 4,
    REBATE_ALREADY: 5,
    BY_BLAG: 6
});

//领取好友赠送体力人数上限
var ENERGY_FRIEND_LIMIT = 10;
//
var STOR_DISCOUNT_ITEM = 1;
var STOR_LIMIT_DISCOUNT_ITEM = 2;

var STORE_DISCOUNT_ITEM = 1;
var STORE_LIMIT_DISCOUNT_ITEM = 2;
var STORE_DISCOUNT_GIFT = 3;

//版本测试
var C2G_REQ_ADD_COIN = 4000;
//心跳检测
var C2G_REQ_HEARTBEAT = 5000;
var C2A_HTTP_AUTH = 6001;

var C2G_REQ_LOGIN = 10001;
var C2G_REQ_PLAYER_LOGIN = 10003;
var C2G_REQ_TEST_LOGIN = 10004;
//强制下线
var C2G_REQ_PLAYER_LOGOUT = 10005;

// 玩家登录

var C2G_REQ_GET_PLAYER = 20001;
var C2G_REQ_GET_PLAYER_INFO = 20002;
var C2G_REQ_UPDATE_PLAYER = 20003;
var C2G_REQ_GET_ENERGY = 20004;
var C2G_REQ_LOGOUT_PLAYER = 20005;
//战斗记录
var C2G_REQ_GET_BATTLE_HISTORY = 20007;
//完成新手引导
var C2G_REQ_FINISH_GUIDE = 20012;
var C2G_REQ_CHOOSE_LOGO = 21010;
var C2G_REQ_CHOOSE_THEME = 21011;
var C2G_REQ_GET_FREE_THEME = 21012;
//获得分享奖励
var C2G_REQ_GET_SHARE_REWARD = 21014;
//获得添加微端奖励
var C2G_REQ_GET_WD_REWARD = 21015;
var C2G_REQ_GUIDE_SAVE = 20013;
var C2G_REQ_GUIDE_GET = 20014;

var C2G_REQ_UPLOAD_HEAD_TOKEN = 20015;
var C2G_REQ_UPLOAD_IMAGE_TOKEN = 20016;

var C2G_REQ_BUY_STORE_ITEM = 21002;
var C2G_REQ_OPEN_TREASURE_BOX = 21003;
var C2G_REQ_GET_DIARY_REWARD = 21004;
var C2G_REQ_GET_COLLECTION_REWARD = 21005;
var C2F_REQ_GET_LOTTERY_REWARD = 21006;
var C2G_REQ_BUY_THEME = 21013;

//下订单
var C2G_REQ_CHARGE = 22001;
//查询订单状态
var C2G_REQ_GET_CHARGE_STATUS = 22002;

var C2G_REQ_ENTER_LEVEL = 30001;
var C2G_REQ_COMPLETE_LEVEL = 30002;
var C2G_REQ_LEVEL_USE_ITEM = 30003;
var C2G_REQ_REVIVE_MAP = 30004;
var C2G_REQ_SEND_MAP_HELP = 30005;
var C2G_REQ_DEL_MAP_HELP = 30006;
var C2G_REQ_CHECK_MAP_HELP = 30007;
var C2G_REQ_RECEIVE_MAP_HELP = 30008;
var C2G_REQ_UNLOCK_CHAPTER = 30009;

//Avatar
var C2G_REQ_BUY_AVATAR = 40001;
var C2G_REQ_USE_AVATAR = 40002;
var C2G_REQ_LEVEL_UP_AVATAR = 40003;
var C2G_REQ_NOTICE_AVATAR = 40004;
//Avatar 技能标志
var AVATAR_SKILL_NULL = -1;
var AVATAR_SKILL_NUM = 0;
var AVATAR_SKILL_PERCENT = 1;

var C2G_REQ_GET_DAILY_TASK = 60001;
var C2G_REQ_GET_DAILY_TASK_REWARD = 60002;
var C2G_REQ_GET_DAILY_TASK_ACTIVITY_REWARD = 60003;

//好友
var C2G_REQ_GET_FRIEND_LIST = 70001;
var C2G_REQ_GET_FRIEND_DATA = 70002;
var C2G_REQ_ADD_FRIEND = 70003;
var C2G_REQ_RECOMMEND_FRIEND = 70004;
var C2G_REQ_PLAYER_GAVE = 70005;
var C2G_REQ_GET_FRIEND = 70006;
var C2G_REQ_GET_FRIEND_HIGHEST_LEVEL = 70007;

var C2G_REQ_FRIEND_SEARCH_NEAR = 70009;
//搜索好友
var C2G_REQ_FRIEND_SEARCH = 70010;
var C2G_REQ_FEEDBACK_ENERGY = 70014;

var C2G_REQ_DEL_FRIEND_REQUEST = 70016;
var C2G_REQ_GET_FRIEND_MAP_RANK = 71001;
var C2G_REQ_ASK_COLLECTION = 72001;
var C2G_REQ_GET_COLLECTION = 72002;
//赠送好友道具
var C2G_REQ_GIVE_COLLECTION = 72003;
//好友愿望
var C2G_REQ_GET_FRIEND_WISH_LIST = 72004;
//好友求助
var C2G_REQ_GET_FRIEND_HELP_LIST = 72005;
//赞
var C2G_REQ_SET_LIKE = 73001;
//赠送能量
var C2G_REQ_GIVE_ENERGY = 75001;
var C2G_REQ_ASK_ENERGY = 75002;

var C2G_REQ_GET_CARD = 80001;
var C2G_REQ_CHECK_CARD = 80002;
var C2G_REQ_GET_BALLON = 80003;
var C2G_REQ_CHECK_BALLON = 80004;

var C2G_REQ_GET_MAIL_LIST = 90001;
var C2G_REQ_IGNORE_MAIL = 90002;
var C2G_REQ_MAIL_HELP = 90003;
var C2G_REQ_READ_MAIL = 90004;
var C2G_REQ_GET_MAIL_REWARD = 90005;
// const C2G_REQ_GET_MAIL = 90001
// const C2G_REQ_ADD_MAIL = 90002
// const C2G_REQ_READ_MAIL = 90003
// const C2G_REQ_GET_MAIL_REWARD = 90004
// const C2G_REQ_GET_MAIL_BY_TYPE = 90005
// const C2G_REQ_DEL_MAIL = 90006
// const C2G_REQ_MODIFY_MAIL = 90007
// const C2G_REQ_SEND_CHALLENGE_INFO = 90008
// const C2G_REQ_DEL_CHALLENGE_INFO = 90009

//创建队伍
var C2G_REQ_CREATE_TEAM = 91001;

//退出队伍
var C2G_REQ_EXIT_TEAM = 91002;

//申请加入队伍
var C2G_REQ_APPLY_JOIN_TEAM = 91003;

//移除队友
var C2G_REQ_REMOVE_TEAMMATE = 91004;

//获取申请列表
var C2G_REQ_GET_APPLY_LIST = 91005;

//同意加入队伍
var C2G_REQ_AGREE_JOIN_APPLY = 91006;

//获取未满员的队伍列表
var C2G_REQ_GET_TEAM_LIST = 91007;

//获取队伍信息
var C2G_REQ_GET_TEAM_INFO = 91008;

//邀请加入队伍
var C2G_REQ_INVITE_JOIN = 91009;

//同意邀请加入队伍
var G2C_REQ_AGREE_JOIN_APPLY = 91010;

//获取邀请信息
var G2C_REQ_INVITE_JOIN = 91011;

//个人进入游戏房间
var C2G_REQ_ENTER_GAME_ROOM = 92001;
//自定义房间退出
var C2G_REQ_EXIT_GAME_ROOM = 92002;
//改变队伍
var C2G_REQ_CHANGE_TEAM = 92003;
//准备
var C2G_REQ_READY = 92004;
//取消准备
var C2G_REQ_CANCEL_READY = 92005;
//团队进入游戏房间
var C2G_REQ_TEAM_ENTER_ROOM = 92006;
//设置观战
var C2G_REQ_SET_WATCH = 92007;
//观看团队列表
var C2G_REQ_GET_WATCH_TEAM_LIST = 92008;
//观战
var C2G_REQ_WATCH_BATTLE = 92009;

//自动匹配战斗
var C2G_REQ_GAME_MATCH = 93001;
//自动匹配战斗取消
var C2G_REQ_GAME_MATCH_CANCEL = 93002;

var G2C_REQ_MATCH_COMPLETED = 93003;

var C2G_REQ_LOAD_COMPLETED = 93004;

var C2G_REQ_GAME_START = 93005;

var G2C_REQ_GET_MATCH_COUNT = 93006;

//游戏中数据交互
var C2G_REQ_SYNC_CHANGE = 93007;

var C2G_REQ_SYNC_MAP_DATA = 93008;

//游戏结束
var G2C_REQ_GAME_OVER = 93009;

//游戏回放
var C2G_REQ_WATCH_HISTORY = 93010;

//游戏中主动退出
var C2G_REQ_EXIT_GAME = 93011;

//天梯赛报名
var C2G_REQ_SIGN_UP = 93012;

//天梯赛取消报名
var C2G_REQ_CANCEL_SIGN_UP = 93014;

//获取天梯排行榜数据
var C2G_REQ_GET_RANK_TEAM_INFO = 93013;

//地图加载完成后, 通知服务端尽快开始游戏
var C2G_REQ_WAIT_GAME_START = 93015;
//获取排行榜数据
var C2G_REQ_GET_GAME_RANK = 93016;
//聊天
//发送消息
var C2G_REQ_SEND_MESSAGE = 100003;

//收到消息
var C2G_REQ_GET_MESSAGE = 100004;