const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const Utils = require('utils');
const RankState = {
    SHOW: 1,
    HIDE: 2
};
let Color_Camp = ['#FF6C00','#FF00BE','#FEDC3B','#00BCFF','#3EFF00','#4000FF'];
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
                 rankState: null,
                 donghuaNode: cc.Node,
                 roundLabel: cc.Label,
                 rankUnit: [require('RankUnit')],
                 rankLeftSpr: cc.SpriteFrame,
                 rankRightSpr: cc.SpriteFrame,
             },
             onClick:function (event, id) {
                 switch (id) {
                     case "pause": {
                         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'pause_layer', 'hide_preLayer':false});
                     }
                     break;
                     case 'donghua': {
                         let action_in = cc.moveBy(1,cc.p(223,0));
                         let action_out = cc.moveBy(1,cc.p(-223,0));
                         if(this.rankState == RankState.SHOW){
                             this.rankState = RankState.HIDE;
                             this.donghuaNode.getChildByName('button_pic').getComponent(cc.Sprite).spriteFrame = this.rankLeftSpr;
                             this.donghuaNode.runAction(action_in);
                         }
                         else if(this.rankState == RankState.HIDE){
                             this.rankState = RankState.SHOW;
                             this.donghuaNode.getChildByName('button_pic').getComponent(cc.Sprite).spriteFrame = this.rankRightSpr;
                             this.donghuaNode.runAction(action_out);
                         }
                     }
                 }
             },
             // use this for initialization
             onLoad: function () {
                this.reuse();
             },
             reuse:function () {
                 EventManager.registerHandler(G2C_REQ_GAME_OVER, this);
                 EventManager.registerHandler('GAME_LAYER',this);
                 this.rankState = RankState.SHOW;
                 this.roundLabel.string = KeyValueManager['roundCount'];
             },
             processEvent: function (event) {
                 let msg_id = event['msg_id'];
                 switch (msg_id) {
                     case G2C_REQ_GAME_OVER: {
                         if(event['result'])
                         {
                             KeyValueManager['panel'] = event['panel'];
                             KeyValueManager['teamWin'] = event['team_win'];
                             KeyValueManager['gameId'] = event['id'];
                             KeyValueManager['GameOver'] = true;
                             if(KeyValueManager['game_mode'] == GameMode.MODE_TIANTI){
                                 if(!KeyValueManager['player_data']['player_info']['team_info'])
                                     KeyValueManager['player_data']['player_info']['team_info'] = {};
                                 if(KeyValueManager['player_data']['player_info']['team_info']['game_count']){
                                     KeyValueManager['player_data']['player_info']['team_info']['game_count'] += 1;
                                 }
                                 else {
                                     KeyValueManager['player_data']['player_info']['team_info']['game_count'] = 1;
                                 }
                                 if(KeyValueManager['player_data']['player_info']['team_info']['wins']) {
                                     if (event['wins']) {
                                         KeyValueManager['player_data']['player_info']['team_info']['wins'] += 1;
                                         let wins = KeyValueManager['player_data']['player_info']['team_info']['wins'];
                                         let game_count = KeyValueManager['player_data']['player_info']['team_info']['game_count'];
                                         KeyValueManager['player_data']['player_info']['team_info']['rate'] = parseInt(wins / game_count * 100);
                                     }
                                 }
                                 else {
                                     if (event['wins']) {
                                         KeyValueManager['player_data']['player_info']['team_info']['wins'] = 1;
                                         KeyValueManager['player_data']['player_info']['team_info']['rate'] = 100;
                                     }
                                 }
                             }
                             if(KeyValueManager['player_data']['player_info']['record']){
                                 if(KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]){
                                     KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['game_count'] += 1;
                                     if(event['win'])
                                         KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['win'] += 1;
                                     let win = KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['win'];
                                     let game_count = KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['game_count'];
                                     KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['rate'] = parseInt(win / game_count * 100);
                                 }
                                 else {
                                     KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']] = {};
                                     KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['game_count'] = 1;
                                     let game_count = KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['game_count'];
                                     if(event['win']) {
                                         KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['win'] = 1;
                                         let win = KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['win'];
                                         KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['rate'] = parseInt(win / game_count * 100);
                                     }
                                     else {
                                         KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['win'] = 0;
                                         KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['rate'] = 0;
                                     }
                                 }
                             }
                             else {
                                 KeyValueManager['player_data']['player_info']['record'] = {};
                                 KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']] = {};
                                 KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['game_count'] = 1;
                                 let game_count = KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['game_count'];
                                 if(event['win']) {
                                     KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['win'] = 1;
                                     let win = KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['win'];
                                     KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['rate'] = parseInt(win / game_count * 100);
                                 }
                                 else {
                                     KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['win'] = 0;
                                     KeyValueManager['player_data']['player_info']['record'][KeyValueManager['game_mode']]['rate'] = 0;
                                 }
                             }
                             if(event['win'])
                             {

                                 EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'win_layer', 'hide_preLayer':false});
                             }
                             else
                             {
                                 EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'lose_layer', 'hide_preLayer':false});
                             }
                         }

                     }
                         break;
                     case 'GAME_LAYER' :{
                         for(let i = 0; i < this.rankUnit.length; i += 1){
                             this.rankUnit[i].node.setSiblingIndex(0);
                             this.rankUnit[i].node.active = false;
                         }
                         KeyValueManager['rankCopy'] = Utils.deepCopy(KeyValueManager['rank']);
                         this.roundLabel.string = KeyValueManager['roundCount'];
                         let teamCount = {};
                         let powerSort = [];
                         for(let i = 0;i < KeyValueManager['camps'].length;i += 1){
                             teamCount[i] = 0;
                             for(let j = 0;j < KeyValueManager['camps'][i].length;j += 1){
                                 let power = KeyValueManager['camps'][i][j];
                                 teamCount[i] += KeyValueManager['rankCopy'][power][0];
                             }
                         }
                         //队伍兵力排序
                         let count = [];
                         for(let i in teamCount){
                             count.push(teamCount[i]);
                         }
                         count = Utils.sortDiff(count);
                         for(let i = count.length - 1;i >= 0;i -= 1){
                             for(let j in teamCount){
                                 if(count[i] == teamCount[j]){
                                     teamCount[j] = -1      //相等时设置为-1防止一样队伍势力
                                     j = parseInt(j);
                                     let powerCount = [];
                                     for(let k = 0;k < KeyValueManager['camps'][j].length;k += 1){
                                         let power = KeyValueManager['camps'][j][k];
                                         powerCount.push(KeyValueManager['rankCopy'][power][0]);
                                     }
                                     powerCount = Utils.sortDiff(powerCount);
                                     for(let k = powerCount.length - 1;k >= 0;k -= 1){
                                         for(let g = 0;g < KeyValueManager['camps'][j].length;g += 1){
                                             let power = KeyValueManager['camps'][j][g];
                                             if(powerCount[k] == KeyValueManager['rankCopy'][power][0]) {
                                                 powerSort.push(power);
                                                 KeyValueManager['rankCopy'][power][0] = -1;        //相等时设置为-1防止一样势力
                                             }
                                         }
                                     }
                                 }
                             }
                         }
                         for(let i = 0;i < powerSort.length;i += 1){
                             let power = powerSort[i];
                             this.rankUnit[power].node.active = true;
                             this.rankUnit[power].node.setSiblingIndex(parseInt(i));
                             this.rankUnit[power].nameLabel.string = KeyValueManager['name'][power];
                             this.rankUnit[power].armyLabel.string = KeyValueManager['rank'][power][0];
                             this.rankUnit[power].landLabel.string = KeyValueManager['rank'][power][1];
                             this.rankUnit[power].node.getChildByName('New Sprite').color = new cc.Color(cc.hexToColor(Color_Camp[power]));
                         }
                         switch (KeyValueManager['game_mode']){
                             case GameMode.MODE_1V1:{

                             }
                             break;
                             case GameMode.MODE_2V2: {

                             }
                             break;
                             case GameMode.MODE_2V2V2: {

                             }
                             break;
                             case GameMode.MODE_3V3: {

                             }
                             break;
                             case GameMode.MODE_IDENTITY:{

                             }
                             break;
                             case GameMode.MODE_CUSTOM: {

                             }
                             break;
                             case GameMode.MODE_TEAM: {

                             }
                             break;
                         }
                     }
                 }
             },
    onDisable: function () {

                 EventManager.removeHandler(G2C_REQ_GAME_OVER, this);
                 EventManager.removeHandler('GAME_LAYER',this);
             },
             // called every frame, uncomment this function to activate update callback
             // update: function (dt) {

             // },
         });
