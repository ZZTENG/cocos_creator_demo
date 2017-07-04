/**
 * Created by ZZTENG on 2017/1/22.
 */
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils');
const AStart = require('aStart');
const NodePool = require('NodePool');
const Guide = require('Guide');
const FightState= cc.Enum({
    E_STATE_START : 0,
    E_STATE_ING : 1,
    E_STATE_END : 2
});
const Identity = cc.Enum({
    Master_Identity : 0,
    Honest_Identity: 1,
    Spy_Identity: 2,
    Rebel_Identity: 3
});
const tag_level = 'level';
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
                 mapWidth: 24,
                 mapHeight: 24,
                 gridWidth: 90,
                 gridHeight: 90,
                 fogWidth: 45,
                 fogHeight: 45,
                 mapNode: cc.Node,
                 groundSprite:cc.Node,
                 flag: cc.Node,
                 destNode: cc.Node,
                 cursor: cc.Node,
                 roadNode: cc.Node,
                 fogNode: cc.Node,
                 fogSprite: [cc.SpriteFrame],
                 blockSprite:cc.Node,
                 buildingSprite:[cc.Node],
                 initBlockFrame: cc.SpriteFrame,
                 initBuildingFrame: [cc.SpriteFrame],
                 armyLabel: cc.Node,
                 idLabel: [cc.Node],
                 directNode: cc.Node,
                 teamRoadList:[cc.Node],
                 chatMsg: cc.Label,
                 danmu: cc.Toggle,
                 editMsg: cc.EditBox,
                 _groundList: [],
                 _landList:null,
                 _blockList:null,
                 _buildingList:null,
                 _armyList:null,
                 _fogList:null,
                 _msgList: null,
                 _roundCount: null,
                 _lastData: null,
                 _behaviorData: null,
                 _watchData: null,
                 _delWatchData:null,
                 _fogData: null,
                 moveStart: null,
                 moveEnd: null,
                 _oldMapData: null,
                 _mapData: null,
                 _partnerData: null,
                 _team: null,
                 _power: null,
                 _changeData: null,
                 _emptyCityData: null,
                 _msgData: null,
                 _state:0,
                 _currentSelect: -1,
                 _directPool: null,
                 _destNodePool: null,
                 _danmuNodePool: null,
                 _newScale: null,
             },
             getLandByIndex:function(index)
             {
                  return this._landList[index];
             },
             setLandByIndex:function(index,roadNode)
             {
                 this._landList[index] = roadNode;
             },
             getBlockByIndex:function(index)
             {
                 return this._blockList[index];
             },
             setBlockByIndex:function(index, obj)
             {
                 this._blockList[index] = obj;
             },
             getBuildingByIndex:function(index)
             {
                 return this._buildingList[index];
             },
             setBuildingByIndex:function(index, building)
             {
                 this._buildingList[index] = building;
             },
             getArmyByIndex:function(index)
             {
                 return this._armyList[index];
             },
             setArmyByIndex:function(index, armyNode)
             {
                 this._armyList[index] = armyNode;
             },
             setFogByIndex:function(index, fogNode)
             {
                 this._fogList[index] = fogNode;
             },
             getFogByIndex:function(index)
             {
                 return this._fogList[index];
             },
    move: function (event) {
        if(KeyValueManager['GameOver'] && !KeyValueManager['isReplay'])
            return;
        let touchDelta = event.touch.getDelta();
        let map = this.node.getChildByName('map');
        let currentPos = map.getPosition();
        let size = cc.director.getWinSize();
        let halfLen = this.mapWidth * this.gridWidth * 0.5 * this._newScale;
        let rectX = halfLen - size.width / 2 ;
        let rectY = halfLen - size.height / 2;
        let posX = currentPos.x + touchDelta.x;
        let posY = currentPos.y + touchDelta.y;
        if(posX < -rectX)
            posX = -rectX;
        if(posX > rectX)
            posX = rectX;
        if(posY < -rectY)
            posY = -rectY;
        if(posY > rectY)
            posY = rectY;
        map.setPosition(cc.v2(posX,posY));
    },
    search: function (start,end) {
    let startX = start % this.mapWidth;
    let startY = parseInt(start / this.mapWidth);
    let endX = end % this.mapWidth;
    let endY = parseInt(end / this.mapWidth);
    let arr = {};
    let roadLine = [];
    for (let i in this._mapData){
        let x = i % this.mapWidth;
        let y = parseInt(i / this.mapWidth);
        let team = this.whichTeam(this._mapData[i][1])
        KeyValueManager['arr'][x][y] = team;
    }
    let resultStart = [{'x': startX, 'y': startY}]; //将起点的坐标添加进去
    let result = AStart.searchRoad(startX,startY,endX,endY,this.mapWidth,this.mapHeight,KeyValueManager['arr']);
    result = resultStart.concat(result);
    for(let i = 0;i < result.length; i += 1){
        let road = result[i]['x'] + result[i]['y'] * this.mapWidth;
        roadLine.push(road);
    }
    return roadLine;
},
    getClickBlockIndex:function (event) {
     let touchPosition = event.touch.getLocation();
     let worldPos = this.node.parent.convertToWorldSpaceAR(touchPosition);
     let nodePos = this.groundSprite.parent.convertToNodeSpaceAR(worldPos);
     let halfLen = this.mapWidth * this.gridWidth * 0.5 ;
     nodePos.x += halfLen;
     nodePos.y = -nodePos.y + halfLen;
     let subPos = Math.floor(nodePos.x / this.gridWidth) +  Math.floor(nodePos.y / this.gridHeight) * this.mapHeight;
     if (subPos > this.mapHeight * this.mapWidth || subPos < 0)
         subPos = -1;
     return subPos;
 },

        setCursor: function (event) {
         if(KeyValueManager['GameOver'] ||KeyValueManager['isReplay'] || KeyValueManager['danmu'])
             return;
        KeyValueManager['endPos'] = event.touch.getLocation();
        let moveX = Math.abs(KeyValueManager['endPos'].x - KeyValueManager['startPos'].x);
        let moveY = Math.abs(KeyValueManager['endPos'].y - KeyValueManager['startPos'].y);
      if(moveX < this.gridWidth / 2 && moveY < this.gridHeight / 2) {
          let search_not_power = false;             //不是你自己势力内的自动寻路标识
          let current = this.getClickBlockIndex(event);
          //指引
          if(KeyValueManager['is_guide']) {
              let index = null;
              if (KeyValueManager['guide_msg'] == Unit_Step.Game_level.Move_MainCity) {
                  index = current + 1;
              }
              else if (KeyValueManager['guide_msg'] == Unit_Step.Game_level.Choose_MainCity) {
                  index = KeyValueManager['main_city_index'];
              }
              else if (KeyValueManager['guide_msg'] == Unit_Step.Game_level.Search_Move) {
                  index = KeyValueManager['main_city_index'] + 3;
                  KeyValueManager['search_move_over'] = true;
              }
              else if(KeyValueManager['guide_msg'] == Unit_Step.Game_level.Occupy_ViceCity){
                  index = KeyValueManager['empty_city_index']
              }
              else if(KeyValueManager['guide_msg'] == Unit_Step.Game_level.Occupy_MainCity){
                  index = 1;
              }
              else {
                  if(KeyValueManager['zhiYinLayer'].active)
                      KeyValueManager['zhiYinLayer'].active = false;
              }
              if (index) {
                  let pos = this._groundList[index].getPosition();
                  let world_pos = this._groundList[index].parent.convertToWorldSpaceAR(pos);
                  KeyValueManager['mask_node_world_pos'] = world_pos;
                  EventManager.pushEvent({'msg_id': KeyValueManager['guide_msg']});
              }
          }
          //是否点击destNode来取消操作
          if(KeyValueManager['destNode'][current] && this._currentSelect == -1)
          {
              this.cancelMove(current);
              return;
          }
          if (current == -1)
              return;
          //如果之前没有选中
          if (this._currentSelect == -1) {
              let block = this._blockList[current];
              if (block) {
                  return;
              }
              if (this._mapData[current] && this._mapData[current][1] == this._power) {
                  this._currentSelect = current;
                  let pos = this._groundList[current].getPosition();

                  this.cursor.active = true;
                  this.cursor.setPosition(pos.x, pos.y);
                  KeyValueManager['search'] = true;
              }

          }
          else {
              //如果可以移动
              if (this.canMove(this._currentSelect, current)) {
                  search_not_power = true;
                  if (this._mapData[this._currentSelect] && this._mapData[this._currentSelect][2] <= 0) {
                      //判断是否可以与行为里面的数据接起来, 判断条件是行为列表第二个参数是当前选中的
                      let hasInBehavior = false;
                      for (let i in this._behaviorData) {
                          for (let j in this._behaviorData[i]) {
                              if (this._behaviorData[i][j][1] == this._currentSelect) {
                                  this.moveStart = this._currentSelect;
                                  this.moveEnd = current;
                                  this._currentSelect = current;
                                  this.moveStart = parseInt(this.moveStart);
                                  this.moveEnd = parseInt(this.moveEnd);
                                  if (KeyValueManager['moveRound'] < this._roundCount + 1)
                                      KeyValueManager['moveRound'] = this._roundCount + 1;
                                  this.moveArmy(this.moveStart, this.moveEnd);
                                  let pos = this._groundList[current].getPosition();
                                  this.cursor.active = true;
                                  let self = this;
                                  if(!this._mapData[current] || (this._mapData[current]
                                      && !this.belongTeam(this._mapData[current][1]))) { // 空地或者其他队伍势力  光标false不能寻路
                                      KeyValueManager['search'] = false;
                                      this.scheduleOnce(function () {
                                          self.cursor.active = false;
                                      }, 0.2);
                                  }
                                  this.cursor.setPosition(pos.x, pos.y);
                                  hasInBehavior = true;
                                  break;
                              }
                          }

                      }
                      //数量为零有空地和势力为零，是自己势力的话让其选中的状态
                      if (this._mapData[current] && this._mapData[current][1] == this._power) {
                          let pos = this._groundList[current].getPosition();
                          this.cursor.active = true;
                          this._currentSelect = current;
                          this.cursor.setPosition(pos.x, pos.y);
                      }
                  }
                  else {
                      this.moveStart = this._currentSelect;
                      this.moveEnd = current;
                      this._currentSelect = current;
                      this.moveStart = parseInt(this.moveStart);
                      this.moveEnd = parseInt(this.moveEnd);
                      if (KeyValueManager['moveRound'] < this._roundCount + 1)
                          KeyValueManager['moveRound'] = this._roundCount + 1;
                      this.moveArmy(this.moveStart, this.moveEnd);
                      let pos = this._groundList[current].getPosition();
                      this.cursor.active = true;
                      let self = this;
                      if(!this._mapData[current] || (this._mapData[current]
                          && !this.belongTeam(this._mapData[current][1]))) {
                          KeyValueManager['search'] = false;
                          this.scheduleOnce(function () {
                              self.cursor.active = false;
                          }, 0.2);
                      }
                      this.cursor.setPosition(pos.x, pos.y);
                  }

              }
              else {
                  //不是自己队伍势力而且不是block
                  if((!this._mapData[current] || (this._mapData[current] && !this.belongTeam(this._mapData[current][1])))
                       && !this._blockList[current] && KeyValueManager['search']){
                      let searchPoint = [];
                      let direct = this.direction(current);
                      for(let i = 0;i < direct.length;i += 1){
                          if(direct[i] == null)
                              continue ;
                          let result = false;
                          if(this._mapData[direct[i]])
                            result = this.belongTeam(this._mapData[direct[i]][1]);
                          if(result) {
                              let roadLine = this.search(this._currentSelect, direct[i]);
                              if(roadLine.length > 1)
                                  searchPoint.push(direct[i]);
                          }
                      }
                      // searchPoint = Utils.randArray(searchPoint);
                      if(searchPoint.length != 0 && this._mapData[this._currentSelect][2] > 0){
                          let point = null;
                          if(searchPoint.length == 1)
                              point = searchPoint[0];
                          for(let i = 0;i < searchPoint.length - 1;i += 1){
                              let roadLine0 = this.search(this._currentSelect,searchPoint[i]);
                              let roadLine1 = this.search(this._currentSelect,searchPoint[i + 1]);
                              if(roadLine0.length < roadLine1.length) //去最近路线
                              {
                                  searchPoint[i + 1] = searchPoint[i];
                              }
                              point = searchPoint[i + 1];
                          }
                          let roadLine = this.search(this._currentSelect,point);
                          if (KeyValueManager['moveRound'] < this._roundCount + 1)
                              KeyValueManager['moveRound'] = this._roundCount + 1;

                          if(roadLine.length > 1) {
                              search_not_power = true
                              if (!KeyValueManager['destRound'][current])
                                  KeyValueManager['destRound'][current] = [];
                              let moveRound = KeyValueManager['moveRound'];
                              KeyValueManager['destRound'][current].push([moveRound, moveRound + roadLine.length - 1]);
                              let destNode = null;
                              if (this._destNodePool.size() > 0)
                                  destNode = this._destNodePool.get();
                              else
                                  destNode = cc.instantiate(this.destNode);
                              destNode.parent = this.destNode.parent;
                              destNode.active = true;
                              let pos = this._groundList[current].getPosition();
                              destNode.setPosition(pos);
                              cc.audioEngine.play(KeyValueManager['flag_clip'],false,KeyValueManager['effect_volume']);
                              if (!KeyValueManager['destNode'][current])
                                  KeyValueManager['destNode'][current] = [];
                              KeyValueManager['destNode'][current].push(destNode);

                              for (let i = 0; i < roadLine.length - 1; i += 1) {
                                  this.moveStart = roadLine[i];
                                  this.moveEnd = roadLine[i + 1];

                                  this.moveArmy(this.moveStart, this.moveEnd);
                                  this._currentSelect = -1;
                                  this.cursor.active = false;
                              }
                              this.moveArmy(point, current);
                          }
                      }
                      else {
                          this._currentSelect = -1;
                          this.cursor.active = false;
                      }
                  }
                  if (this._mapData[current] && this.belongTeam(this._mapData[current][1]) && KeyValueManager['search']) {
                      //再次选中相同的地块，取消选中效果
                      if(current == this._currentSelect)
                      {
                          this._currentSelect = -1;
                          this.cursor.active = false;
                          return;
                      }
                      //队伍势力内自动寻路
                      if (this._mapData[this._currentSelect] && this._mapData[this._currentSelect][2] > 0) {
                          let roadLine = this.search(this._currentSelect, current);
                          if (KeyValueManager['moveRound'] < this._roundCount + 1)
                              KeyValueManager['moveRound'] = this._roundCount + 1;
                          if(roadLine.length > 1) {
                              let destNode = null;
                              if (this._destNodePool.size() > 0)
                                  destNode = this._destNodePool.get();
                              else
                                  destNode = cc.instantiate(this.destNode);
                              destNode.parent = this.destNode.parent;
                              destNode.active = true;
                              let pos = this._groundList[current].getPosition();
                              destNode.setPosition(pos);
                              cc.audioEngine.play(KeyValueManager['flag_clip'],false,KeyValueManager['effect_volume']);
                              if (!KeyValueManager['destRound'][current])
                                  KeyValueManager['destRound'][current] = [];
                              let moveRound = KeyValueManager['moveRound'];
                              KeyValueManager['destRound'][current].push([moveRound, moveRound + roadLine.length - 2]);
                              if (!KeyValueManager['destNode'][current])
                                  KeyValueManager['destNode'][current] = [];
                              KeyValueManager['destNode'][current].push(destNode);
                              for (let i = 0; i < roadLine.length - 1; i += 1) {
                                  this.moveStart = roadLine[i];
                                  this.moveEnd = roadLine[i + 1];
                                  if (KeyValueManager['moveRound'] < this._roundCount + 1)
                                      KeyValueManager['moveRound'] = this._roundCount + 1;
                                  this.moveArmy(this.moveStart, this.moveEnd);
                                  this._currentSelect = -1;
                                  this.cursor.active = false;
                              }
                          }
                      }
                      else {
                          if(this._mapData[current] == this._power) {
                              this._currentSelect = current;
                              let pos = this._groundList[current].getPosition();
                              this.cursor.active = true;
                              this.cursor.setPosition(pos.x, pos.y);
                          }
                          else {
                              this._currentSelect = -1;
                              this.cursor.active = false;
                          }
                      }
                  }
                  else {
                      if(this._mapData[current] && this._mapData[current][1] == this._power){
                          this._currentSelect = current;
                          let pos = this._groundList[current].getPosition();
                          this.cursor.active = true;
                          this.cursor.setPosition(pos.x, pos.y);
                          KeyValueManager['search'] = true;
                      }
                      else {
                          this._currentSelect = -1;
                          this.cursor.active = false;
                      }
                  }
              }
          }
          //点击地块放大效果
          if(this._mapData[current] && this._mapData[current][1] == this._power && this._landList[current]){
              cc.audioEngine.play(KeyValueManager['plane_click_clip'],false,KeyValueManager['effect_volume']);
              let action1 = cc.scaleTo(0.2,1.2,1.2);
              let action2 = cc.scaleTo(0.2,1,1);
              let sequence1 = cc.sequence(action1,action2);
              this._landList[current].runAction(sequence1);
          }
          else {
              //排除能move过去的地块，但不是自己的势力
              if(search_not_power)
                  return;
              cc.audioEngine.play(KeyValueManager['wrong_click_clip'],false,KeyValueManager['effect_volume']);
          }
      }
    },
    canMove: function (start,end) {
        let result = false;
        let block = this._blockList[end];
        if(block)
        {
            return false;
        }

        let top = start - this.mapWidth;
        let bottom = start + this.mapWidth;
        let left = start - 1;
        let right = start + 1;
        if(start % this.mapWidth == 0){
            if(end == top || end == bottom || end == right)
                result = true;
        }
        else if(end == top || end == bottom || end == right || end == left)
                result = true;

        if(start % this.mapWidth == (this.mapWidth - 1) ){
            if(end == top || end == bottom || end == left)
                result = true;
        }
        else if(end == top || end == bottom || end == right || end == left)
            result = true;
        return result;
    },
    moveArmy: function (start,end) {
        let canMove = this.canMove(start,end);
        let block = this._blockList[end];
        if(canMove && !block ){
            let reduce = [start,end];
            if(!this._behaviorData[KeyValueManager['moveRound']])
                this._behaviorData[KeyValueManager['moveRound']] = [];
            // cc.log('move',KeyValueManager['moveRound'],this._roundCount);
            this._behaviorData[KeyValueManager['moveRound']].push(reduce);
            KeyValueManager['moveRound'] += 1;

            //路线方向显示
            let guide = null;
            if (this._directPool.size() > 0) {
                guide = this._directPool.get();
            }
        else {
                guide = cc.instantiate(this.directNode);
            }
            if(guide) {
                guide.parent = this.directNode.parent;
                guide.active = true;
                if(!KeyValueManager['guideNode'][KeyValueManager['moveRound']])
                    KeyValueManager['guideNode'][KeyValueManager['moveRound']] = [];
                KeyValueManager['guideNode'][KeyValueManager['moveRound']].push(guide);
                let direction = this.direction(start);

                if (parseInt(end) == direction[0])
                    guide.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][this._power].data.getComponent('ThemeGroup').directFrame[0];
                if (parseInt(end) == direction[1])
                    guide.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][this._power].data.getComponent('ThemeGroup').directFrame[1];
                if (parseInt(end) == direction[2])
                    guide.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][this._power].data.getComponent('ThemeGroup').directFrame[2];
                if (parseInt(end) == direction[3])
                    guide.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][this._power].data.getComponent('ThemeGroup').directFrame[3];

                let pos = this._groundList[end].getPosition();
                let worldPos = this._groundList[end].parent.convertToWorldSpaceAR(pos);
                let nodePos = guide.parent.convertToNodeSpaceAR(worldPos);
                guide.setPosition(nodePos);
            }
        }

    },
    onDestroy: function () {
        EventManager.removeHandler(C2G_REQ_SYNC_CHANGE, this);
        EventManager.removeHandler(C2G_REQ_SYNC_MAP_DATA, this);
        EventManager.removeHandler(C2G_REQ_WATCH_HISTORY,this);
        EventManager.removeHandler(C2G_REQ_SEND_MESSAGE, this);
        EventManager.removeHandler(C2G_REQ_GET_MESSAGE, this);
        if(KeyValueManager['is_guide']){
            EventManager.removeHandler(Guide_Unit.Game_level,this);
            EventManager.removeHandler(Unit_Step.Game_level.Choose_MainCity,this);
            EventManager.removeHandler(Unit_Step.Game_level.Move_MainCity,this);
            EventManager.removeHandler(Unit_Step.Game_level.Search_Move,this);
            EventManager.removeHandler(Unit_Step.Game_level.Occupy_ViceCity,this);
            EventManager.removeHandler(Unit_Step.Game_level.Occupy_MainCity,this);
            EventManager.removeHandler('guide_dianji',this);
            EventManager.removeHandler(C2G_REQ_FINISH_GUIDE,this);
            Guide.removeUnitListenList(Guide_Unit.Game_level);
        }
        if(this._directPool){
            this._directPool.clear();
            delete this._directPool;
        }
        if(this._destNodePool){
            this._destNodePool.clear();
            delete this._destNodePool;
        }
        if(KeyValueManager['currentTime'])
            delete KeyValueManager['currentTime'];
        if(KeyValueManager['moveRound'])
            delete KeyValueManager['moveRound'];
        if(KeyValueManager['camp']){
            delete KeyValueManager['camp'];
        }
        if(KeyValueManager['selfTeam']){
            delete KeyValueManager['selfTeam'];
        }
        if(KeyValueManager['GameOver']){
            delete KeyValueManager['GameOver'];
        }
        if(KeyValueManager['search']){
            delete KeyValueManager['search'];
        }
        if(KeyValueManager['death']){
            delete KeyValueManager['death'];
        }
        if(KeyValueManager['in_game']){
            delete KeyValueManager['in_game'];
        }
        if(KeyValueManager['isReplay']){
            delete KeyValueManager['isReplay'];
        }
        if(KeyValueManager['danmu']){
            delete KeyValueManager['danmu'];
        }
        if(KeyValueManager['width']){
            delete KeyValueManager['width'];
        }
        if(KeyValueManager['height']){
            delete KeyValueManager['height'];
        }
        if(KeyValueManager['gameId']){
            delete KeyValueManager['gameId'];
        }
        if(KeyValueManager['roomId']){
            delete KeyValueManager['roomId'];
        }
        if(KeyValueManager['main_city_index']){
            delete KeyValueManager['main_city_index'];
        }
        if(KeyValueManager['empty_city_index']){
            delete KeyValueManager['empty_city_index'];
        }
        if(KeyValueManager['enemy_city_index']){
            delete KeyValueManager['enemy_city_index'];
        }
        if(KeyValueManager['guide_move_count']){
            delete KeyValueManager['guide_move_count'];
        }
        if(KeyValueManager['search_move_over']){
            delete KeyValueManager['search_move_over'];
        }
        if(KeyValueManager['is_guide']){
            delete KeyValueManager['is_guide'];
        }
        if(KeyValueManager['guide_msg']){
            delete KeyValueManager['guide_msg'];
        }
        if(KeyValueManager['occupy_vice_city']){
            delete KeyValueManager['occupy_vice_city'];
        }
        if(KeyValueManager['rankCopy']){
            delete KeyValueManager['rankCopy'];
        }

        if(KeyValueManager['zhiYinLayer']){
            KeyValueManager['zhiYinLayer'] = {};
            delete KeyValueManager['zhiYinLayer'];
        }
        if(KeyValueManager['maskNode']){
            KeyValueManager['maskNode'] = {};
            delete KeyValueManager['maskNode'];
        }
        if(KeyValueManager['guide_label']){
            KeyValueManager['guide_label'] = {};
            delete KeyValueManager['guide_label'];
        }

        if(KeyValueManager['startMap']) {
            KeyValueManager['startMap'] = {};
            delete KeyValueManager['startMap'];
        }
        if(KeyValueManager['history']){
            KeyValueManager['history'] = {};
            delete KeyValueManager['history'];
        }
        if(KeyValueManager['guideNode']) {
            KeyValueManager['guideNode'] = {};
            delete KeyValueManager['guideNode'];
        }
        if(KeyValueManager['arr']) {
            KeyValueManager['arr'] = {};
            delete KeyValueManager['arr'];
        }
        if(KeyValueManager['destNode']) {
            KeyValueManager['destNode'] = {};
            delete KeyValueManager['destNode'];
        }
        if(KeyValueManager['destRound']) {
            KeyValueManager['destRound'] = {};
            delete KeyValueManager['destRound'];
        }
        if(KeyValueManager['startPos']) {
            KeyValueManager['startPos'] = {};
            delete KeyValueManager['startPos'];
        }
        if(KeyValueManager['endPos']) {
            KeyValueManager['endPos'] = {};
            delete KeyValueManager['endPos'];
        }
        for(let i in KeyValueManager['themeList']) {
            cc.loader.setAutoReleaseRecursively(KeyValueManager['themeList'][i],true);
        }
        if(KeyValueManager['themeList']){
            KeyValueManager['themeList'] = {};
        }
        for(let i in KeyValueManager['land_around']){
            cc.loader.setAutoReleaseRecursively(KeyValueManager['land_around'][i],true);
        }
        if(KeyValueManager['land_around']){
            KeyValueManager['land_around'] = {};
        }
    },
    processEvent: function (event) {
        let msg_id = event['msg_id'];
        switch (msg_id) {
            case C2G_REQ_SYNC_MAP_DATA: {
                if (event['result']) {
                    let mapData = event['map_data'];
                    KeyValueManager['death'] = event['death'];      //death [[杀人者, 被杀者, 时间]]
                    let rank = event['rank'];
                    if (rank) {
                        KeyValueManager['serverRank'] = true;
                        KeyValueManager['rank'] = Utils.deepCopy(rank);
                    }
                    if (KeyValueManager['death'] && KeyValueManager['death'].length > 0) {
                        let length = KeyValueManager['death'].length;
                        this.teamMemberDeath(KeyValueManager['death'][length - 1][1]);
                    }
                    let barracks = event['barracks'];
                    for (let i in barracks)
                        this._emptyCityData[i] = barracks[i];
                    for (let i in mapData) {
                            this._changeData[i] = mapData[i];
                    }
                }
            }
                break;
            case C2G_REQ_WATCH_HISTORY: {
                if (event['result']) {
                    for(let i in event['history']){
                        KeyValueManager['history'][i] = event['history'][i];
                    }
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
                    }
                    if (KeyValueManager['initReplay']) {
                        KeyValueManager['initReplay'] = false;
                        //隐藏迷雾
                        for (let i in this._fogList) {
                            if(this._fogList.active)
                                continue;
                            this._fogList[i].active = false;
                        }
                        //隐藏地块
                        for (let i in this._landList)
                            this._landList[i].active = false;
                        for (let i in this._armyList)
                            this._armyList[i].active = false;
                        //还原障碍物
                        for (let i in this._blockList) {
                            this._blockList[i].active = true;
                            this._blockList[i].getComponent(cc.Sprite).spriteFrame = this.initBlockFrame;
                        }
                        //还原副城
                        for(let i in this._buildingList){
                            this._buildingList[i].getComponent(cc.Sprite).spriteFrame = this.initBuildingFrame[1];
                        }
                        this.flag.active = false;
                        this.destNode.active = false;
                        this.directNode.active = false;
                        this.cursor.active = false;
                        this._roundCount = 0;
                        KeyValueManager['currentRound'] = this._roundCount;
                        this._mapData = {};
                        this._oldMapData = {};
                        KeyValueManager['msgData'] = event['barrage'];
                        this._msgData = KeyValueManager['msgData'];
                        KeyValueManager['currentTime'] = event['time'] * 1000;
                        KeyValueManager['fastCurrentTime'] = 0;
                        KeyValueManager['fastCurrentRound'] = 0;
                        KeyValueManager['GameOver'] = true;
                        KeyValueManager['isReplay'] = true;
                    }
                }
            }
            break;
            case C2G_REQ_SEND_MESSAGE: {
                if(event['result']) {
                    let msg = event['data'];
                    for(let i in msg){
                        if(this._msgData[i]){
                            this._msgData[i].push(msg[i]);
                        }
                        else {
                            this._msgData[i] = [];
                            this._msgData[i].push(msg[i]);
                        }
                        let msgNode = null;
                        if (this._danmuNodePool.size() > 0) {
                            msgNode = this._danmuNodePool.get();
                        }
                        else {
                            msgNode = cc.instantiate(this.chatMsg.node);
                            this._msgList.push(msgNode);
                        }
                        msgNode.active = true;
                        msgNode.parent = this.chatMsg.node.parent;
                        msgNode.getComponent(cc.Label).string = msg[i];
                        this.danmuAnimation(msgNode);
                    }
                }
            }
            break;
            case C2G_REQ_GET_MESSAGE: {
                if(event['result']){
                    let msg = event['data'];
                    for(let i in msg){
                        if(!this._msgData[i])
                            this._msgData[i] = [];
                        for(let j in msg[i]){
                            this._msgData[i].push(msg[i][j]);
                        }
                    }
                }
            }
            break;
            case Guide_Unit.Game_level: {
                cc.log(Guide_Unit.Game_level);
                EventManager.pushEvent({'msg_id': Unit_Step.Game_level.Choose_MainCity});
            }
            break;
            case Unit_Step.Game_level.Choose_MainCity: {
                cc.log(Unit_Step.Game_level.Choose_MainCity);
                KeyValueManager['zhiYinLayer'].active = true;
                if(KeyValueManager['guide_move_count']){
                    KeyValueManager['guide_msg'] = Unit_Step.Game_level.Move_MainCity;
                }
                else {
                    KeyValueManager['guide_msg'] = Unit_Step.Game_level.Search_Move;
                }
                if(KeyValueManager['occupy_vice_city']){
                    KeyValueManager['guide_msg'] = Unit_Step.Game_level.Occupy_ViceCity;
                }
                let pos = KeyValueManager['maskNode'].parent.convertToNodeSpaceAR(KeyValueManager['mask_node_world_pos']);
                KeyValueManager['maskNode'].setPosition(pos.x,pos.y);
                KeyValueManager['guide_label'].string = '点击主城堡';
            }
            break;
            case Unit_Step.Game_level.Move_MainCity: {
                cc.log(Unit_Step.Game_level.Move_MainCity);
                KeyValueManager['guide_move_count'] -= 1;
                KeyValueManager['zhiYinLayer'].active = true;
                if(KeyValueManager['guide_move_count']){
                    KeyValueManager['guide_msg'] = Unit_Step.Game_level.Move_MainCity;
                }
                else {
                    KeyValueManager['guide_msg'] = Unit_Step.Game_level.Choose_MainCity;
                }
                let pos = KeyValueManager['maskNode'].parent.convertToNodeSpaceAR(KeyValueManager['mask_node_world_pos']);
                KeyValueManager['maskNode'].setPosition(pos.x,pos.y);
                KeyValueManager['guide_label'].string = '点击城堡周边地块，\n可以解锁新的领地';
            }
            break;
            case Unit_Step.Game_level.Search_Move: {
                cc.log(Unit_Step.Game_level.Search_Move);
                KeyValueManager['zhiYinLayer'].active = true;
                KeyValueManager['guide_msg'] = null;
                let pos = KeyValueManager['maskNode'].parent.convertToNodeSpaceAR(KeyValueManager['mask_node_world_pos']);
                KeyValueManager['maskNode'].setPosition(pos.x,pos.y);
                KeyValueManager['guide_label'].string = '点击城堡，然后点击\n这个领地周边地块，\n可以把士兵聚起来';
            }
            break;
            case Unit_Step.Game_level.Occupy_ViceCity: {
                cc.log(Unit_Step.Game_level.Occupy_ViceCity);
                KeyValueManager['guide_msg'] = Unit_Step.Game_level.Occupy_MainCity;
                KeyValueManager['zhiYinLayer'].active = true;
                let pos = KeyValueManager['maskNode'].parent.convertToNodeSpaceAR(KeyValueManager['mask_node_world_pos']);
                KeyValueManager['maskNode'].setPosition(pos.x,pos.y);
                KeyValueManager['guide_label'].string = '点击小城堡，可以解开\n小城堡产兵更快但\n需要消耗一定数量的兵';
            }
            break;
            case Unit_Step.Game_level.Occupy_MainCity: {
                cc.log(Unit_Step.Game_level.Occupy_MainCity);
                KeyValueManager['guide_msg'] = null;
                EventManager.pushEvent({'msg_id': 'CLOSE_LAYER_WITH_ID', 'layer_id': 'zhiyin_layer', 'destroy':true});
                this.scheduleOnce(function () {
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'zhiyin_over_layer', 'hide_preLayer':false});
                },2);
            }
            break;
            case 'guide_dianji': {
                cc.log(event['touch_event']);
                // KeyValueManager['startPos'] = event['touch_event'].touch.getLocation();
                // this.setCursor(event['touch_event']);
                KeyValueManager['startPos'] = KeyValueManager['touch_event'].touch.getLocation();
                this.setCursor(KeyValueManager['touch_event']);
            }
            break;
            case C2G_REQ_FINISH_GUIDE: {
                if(event['result']){
                    KeyValueManager['player_data']['player_info']['guide'] = true;
                    KeyValueManager['panel'] = {
                        '5': {
                            'count': KeyValueManager['rank'][this._power][1],
                            'kill': 1,
                            'max_count': true,
                            'max_kill': true,
                            'mvp': true
                        },
                        '1': {
                            'count': KeyValueManager['rank'][1][1],
                            'kill': 0,
                            'max_count': false,
                            'max_kill': false,
                            'mvp': false
                        },
                    };
                    KeyValueManager['team_win'] = 0;
                    EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'win_layer', 'hide_preLayer':false});
                }
            }
            break;
        }
    },
    danmuAnimation: function (msgNode) {
        let self = this;
        let posX = SCENE_WIGHT / 2 + msgNode.width / 2;
        let posY = Utils.randInt(-500,300);
        msgNode.setPosition(posX,posY);
        let action = cc.moveTo(2,cc.p(-posX,posY));
        let finished  = cc.callFunc(function (target){
            msgNode.active = false;
            self._danmuNodePool.put(msgNode);
        },this);
        let sequence = cc.sequence(action ,finished);
        msgNode.runAction(sequence);
    },
    teamMemberDeath: function (death) {
        if(this.belongTeam(death)) {
            for (let i in this._mapData) {
                if(this._mapData[i][1] == death){
                    this.updateWatchData(i,1);
                    delete this._mapData[i];
                }
            }
        }
        if(death == this._power){
            KeyValueManager['serverRank'] = true;
            EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'failture_layer', 'hide_preLayer':false});
        }
        //障碍物变化
        KeyValueManager['death'] = null;
        cc.log(death,'death');
    },
    onLoad: function () {
         EventManager.registerHandler(C2G_REQ_SYNC_CHANGE, this);
         EventManager.registerHandler(C2G_REQ_SYNC_MAP_DATA, this);
         EventManager.registerHandler(C2G_REQ_WATCH_HISTORY,this);
         EventManager.registerHandler(C2G_REQ_SEND_MESSAGE, this);
         EventManager.registerHandler(C2G_REQ_GET_MESSAGE, this);
         if(KeyValueManager['is_guide']) {
             EventManager.registerHandler(Guide_Unit.Game_level, this);
             EventManager.registerHandler(Unit_Step.Game_level.Choose_MainCity, this);
             EventManager.registerHandler(Unit_Step.Game_level.Move_MainCity, this);
             EventManager.registerHandler(Unit_Step.Game_level.Search_Move, this);
             EventManager.registerHandler(Unit_Step.Game_level.Occupy_ViceCity, this);
             EventManager.registerHandler(Unit_Step.Game_level.Occupy_MainCity, this);
             EventManager.registerHandler(C2G_REQ_FINISH_GUIDE,this);
             EventManager.registerHandler('guide_dianji',this);
         }
        // //测试游戏初始数据是否正确
        //  this.scheduleOnce(function () {
        //      if (KeyValueManager['test_sign']) {
        //          let event1 = {
        //              url: KeyValueManager['server_url'],
        //              msg_id: C2G_REQ_EXIT_GAME,
        //              user_id: KeyValueManager['player_data']['user_id'],
        //              session_key: KeyValueManager['session'],
        //          };
        //          NetManager.sendMsg(event1);
        //          KeyValueManager['test_count'] += 1;
        //          cc.log(tag_level, 'test count: ' + KeyValueManager['test_count']);
        //          Utils.enterMainScene();
        //          cc.director.loadScene('loading');
        //      }
        //  }, 3);

         this._newScale = 1;
         this.mapWidth = KeyValueManager['width'];
         this.mapHeight = KeyValueManager['height'];
         KeyValueManager['currentScene'] = CurrentScene.SCENE_GAME;
         KeyValueManager['guideNode'] = {};
         KeyValueManager['arr'] = {};
         KeyValueManager['moveRound'] = 0;
         KeyValueManager['currentRound'] = 0;
         KeyValueManager['destNode'] = {};
         KeyValueManager['destRound'] = {};
         KeyValueManager['rank'] = {};
         KeyValueManager['serverRank'] = false;
         if(!KeyValueManager['history'])
             KeyValueManager['history'] = {};
         if(KeyValueManager['msgData'])
             this._msgData = KeyValueManager['msgData'];
         KeyValueManager['mapNode'] = this.mapNode;
         KeyValueManager['round_time'] = ROUND_TIME;
         this._roundCount = 0;
         KeyValueManager['roundCount'] = this._roundCount;
         KeyValueManager['fastCurrentTime'] = 0;
         KeyValueManager['fastCurrentRound'] = 0;
         this._currentSelect = -1;
         let halfLen = this.mapWidth * this.gridWidth * 0.5;
         this._blockList = {};
         this._buildingList = {};
         this._armyList = {};
         this._landList = {};
         this._fogList = {};
         this._lastData = [];
         this._changeData = {};
         this._behaviorData = {};
         this._delWatchData = {};
         this._mapData = {};
         this._oldMapData = {};
         this._watchData = {};
         this._fogData = {};
         this._emptyCityData = {};
         this._partnerData = {};
         this._msgList = [];
         this._msgData = {};
         this._directPool = new NodePool();
         this._destNodePool = new NodePool();
         this._danmuNodePool = new NodePool();
         this._mapData = KeyValueManager['startMap'];
         //地面生成
         for(let i = 0 ; i < this.mapWidth; i++)
         {
             for(let j = 0 ; j < this.mapHeight; j++)
             {
                 let newNode = cc.instantiate(this.groundSprite);
                 newNode.active = true;
                 newNode.parent = this.groundSprite.parent;
                 newNode.setPosition(-halfLen + this.gridWidth * 0.5 + this.gridWidth * i,
                                     halfLen - this.gridHeight * 0.5 - this.gridWidth * j);
                 this._groundList[i + j * this.mapWidth ] = newNode;
                 if(!KeyValueManager['arr'][i]) {
                     KeyValueManager['arr'][i] = {};
                 }
                 KeyValueManager['arr'][i][j] = -1; //自动寻路开始障碍全部为-1
             }
         }
         //ensure team and power
         this.teamAndPower();
        //旗子和dest frame替换
        this.destNode.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][this._power].data.getComponent('ThemeGroup').destFrame;
        this.flag.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][this._power].data.getComponent('ThemeGroup').flagFrame;
         if(!KeyValueManager['isReplay'] && ! KeyValueManager['danmu']) {
             //生成迷雾
             for (let i = 0;i < this._groundList.length;i += 1) {
                 let LT = null;
                 let RT = null;
                 let LB = null;
                 let RB = null;

                 //迷雾算法的格式
                 let pos = this._groundList[i].getPosition();
                 pos = cc.v2(pos.x / this.fogWidth, pos.y / this.fogHeight);
                 pos = cc.v2(parseInt(pos.x), parseInt(pos.y));
                 let self = this;
                 let index = function (pos) {
                     pos = pos.x * self.mapHeight * 2 + pos.y;
                     return pos;
                 }

                 LT = cc.v2(pos.x, pos.y + 1);
                 RT = cc.v2(pos.x + 1, pos.y + 1);
                 LB = cc.v2(pos.x, pos.y);
                 RB = cc.v2(pos.x + 1, pos.y);
                 //一个地块四个迷雾节点的生成
                 let pos1 = this._groundList[i].getPosition();
                 let fogNode1 = cc.instantiate(this.fogNode);
                 fogNode1.active = true;
                 fogNode1.parent = this.fogNode.parent;
                 fogNode1.setPosition(pos1.x - this.fogWidth / 2, pos1.y + this.fogHeight / 2);
                 if (this._mapData[i])
                     fogNode1.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
                 else
                     fogNode1.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
                 this.setFogByIndex(index(LT), fogNode1);

                 let fogNode2 = cc.instantiate(this.fogNode);
                 fogNode2.active = true;
                 fogNode2.parent = this.fogNode.parent;
                 fogNode2.setPosition(pos1.x + this.fogWidth / 2, pos1.y + this.fogHeight / 2);
                 if (this._mapData[i])
                     fogNode2.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
                 else
                     fogNode2.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
                 this.setFogByIndex(index(RT), fogNode2);

                 let fogNode3 = cc.instantiate(this.fogNode);
                 fogNode3.active = true;
                 fogNode3.parent = this.fogNode.parent;
                 fogNode3.setPosition(pos1.x - this.fogWidth / 2, pos1.y - this.fogHeight / 2);
                 if (this._mapData[i])
                     fogNode3.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
                 else
                     fogNode3.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
                 this.setFogByIndex(index(LB), fogNode3);

                 let fogNode4 = cc.instantiate(this.fogNode);
                 fogNode4.active = true;
                 fogNode4.parent = this.fogNode.parent;
                 fogNode4.setPosition(pos1.x + this.fogWidth / 2, pos1.y - this.fogHeight / 2);
                 if (this._mapData[i])
                     fogNode4.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
                 else
                     fogNode4.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
                 this.setFogByIndex(index(RB), fogNode4);
             }
             //主城定位
             for(let i in this._mapData){
                 if(this._power == KeyValueManager['masterID'] && this._mapData[i][1] != KeyValueManager['masterID'])
                     continue;
                 if(this.belongTeam(this._mapData[i][1]) || this._mapData[i][1] == KeyValueManager['masterID']) {
                     this.initWatchData(i);      //初始化可见数据
                 }
                 if(this._mapData[i][1] == this._power && this._mapData[i][0] == 1) {
                     let map = this.node.getChildByName('map');
                     let mainPos = this._groundList[i].getPosition();
                     let mainWorld = this._groundList[i].parent.convertToWorldSpaceAR(mainPos);
                     let mainNode = map.parent.convertToNodeSpaceAR(mainWorld);
                     let halfLen = this.mapWidth * this.gridWidth * 0.5;
                     let size = cc.director.getWinSize();
                     let rectX = halfLen - size.width / 2;
                     let rectY = halfLen - size.height / 2;
                     let posX = mainNode.x;
                     let posY = mainNode.y;
                     if (posX < -rectX)
                         posX = -rectX;
                     if (posX > rectX)
                         posX = rectX;
                     if (posY < -rectY)
                         posY = -rectY;
                     if (posY > rectY)
                         posY = rectY;
                     map.setPosition(-posX, -posY);
                 }
                 else
                     this._partnerData[i] = this._mapData[i];
                 if(this._mapData[i][0] == 2)
                     this._emptyCityData[i] = this._mapData[i][2];
             }
         }
         else {
             // KeyValueManager['mapNode'].setScale(0.5,0.5);
             // KeyValueManager['mapNode'].setPosition(0,0);
             if(KeyValueManager['history'][this._roundCount]) {
                 if (KeyValueManager['history'][this._roundCount][RecordData.RECODE_MAP_DATA]) {
                     let mapData = KeyValueManager['history'][this._roundCount][RecordData.RECODE_MAP_DATA];
                     this._mapData = Utils.deepCopy(mapData);
                 }
                 if (KeyValueManager['history'][this._roundCount][RecordData.RECODE_RANK]) {
                     let rank = KeyValueManager['history'][this._roundCount][RecordData.RECODE_RANK]
                     KeyValueManager['rank'] = Utils.deepCopy(rank);
                 }
             }
             this.dataShow();       //观看记录初始化地图
             EventManager.pushEvent({'msg_id': 'GAME_LAYER'});
             if(KeyValueManager['isReplay'])
                 EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'replay_layer', 'hide_preLayer':false});
         }
         //弹幕界面
        if(KeyValueManager['danmu'])
            this.danmu.node.parent.active = true
        else
            this.danmu.node.parent.active = false;
        //游戏登录自动重连
        if(KeyValueManager['in_game']) {
            let event = {
                url:KeyValueManager['server_url'],
                msg_id: C2G_REQ_SYNC_CHANGE,
                user_id: KeyValueManager['player_data']['user_id'],
                session_key: KeyValueManager['session'],
            };
            NetManager.sendMsg(event);
        }
        this.node.on('touchstart',function (event) {
            KeyValueManager['startPos'] = event.touch.getLocation();
        },this);
        this.node.on('touchend',this.setCursor,this);
        let self = this;
        this.node.on('touchmove',function (touchs,event) {
            if (touchs._touches.length >= 2){
                let parent = self.node.parent;
                let touch1 = touchs._touches[0], touch2 = touchs._touches[1];
                let delta1 = touch1.getDelta(), delta2 = touch2.getDelta();
                let touchPoint1 = parent.convertToNodeSpaceAR( touch1.getLocation());
                let touchPoint2 = parent.convertToNodeSpaceAR( touch2.getLocation());
                let distance = cc.pSub( touchPoint1 , touchPoint2 );// touchPoint1.sub( touchPoint2 );
                let delta = cc.pSub( delta1, delta2 ); //delta1.sub( delta2 );
                let scale = 1;
                if ( Math.abs( distance.x ) > Math.abs( distance.y ) )
                {
                    scale = (distance.x + delta.x) / distance.x * self.node.scale;
                }
                else
                {
                    scale = (distance.y + delta.y) / distance.y * self.node.scale;
                }
                var newScale = KeyValueManager['mapNode'].scale * scale;
                if( newScale < 1 ) newScale = 1; //限制縮放大小
                if( newScale > 2 ) newScale = 2; //限制縮放大小
                KeyValueManager['mapNode'].scale = newScale;
                this._newScale = newScale;
            }
            else if(touchs._touches.length == 1){
                this.move(touchs);
            }
        },this);
        // cc.eventManager.addListener({
        //     event: cc.EventListener.TOUCH_ALL_AT_ONCE,
        //     onTouchesMoved: function (touches, event){
        //         if (touches.length >= 2){
        //             let touch1 = touches[0], touch2 = touches[1];
        //             let delta1 = touch1.getDelta(), delta2 = touch2.getDelta();
        //             let touchPoint1 = parent.convertToNodeSpaceAR( touch1.getLocation());
        //             let touchPoint2 = parent.convertToNodeSpaceAR( touch2.getLocation());
        //             let distance = cc.pSub( touchPoint1 , touchPoint2 );// touchPoint1.sub( touchPoint2 );
        //             let delta = cc.pSub( delta1, delta2 ); //delta1.sub( delta2 );
        //             let scale = 1;
        //             if ( Math.abs( distance.x ) > Math.abs( distance.y ) )
        //             {
        //                 scale = (distance.x + delta.x) / distance.x * self.node.scale;
        //             }
        //             else
        //             {
        //                 scale = (distance.y + delta.y) / distance.y * self.node.scale;
        //             }
        //             var newScale = KeyValueManager['mapNode'].scale * scale;
        //             if( newScale < 0.25 ) newScale = 0.25; //限制縮放大小
        //             if( newScale > 3.00 ) newScale = 3; //限制縮放大小
        //             KeyValueManager['mapNode'].scale = newScale;
        //         }
        //     }
        // },this.node);
        if(KeyValueManager['is_guide']){
            EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'zhiyin_layer', 'hide_preLayer':false});
            let pos = this._groundList[KeyValueManager['main_city_index']].getPosition();
            let world_pos = this._groundList[KeyValueManager['main_city_index']].parent.convertToWorldSpaceAR(pos);
            KeyValueManager['mask_node_world_pos'] = world_pos;
        }
    },
    onClick:function (event, id) {
        switch (id) {
            case 'sendMsg': {
                if(this.editMsg.string){
                    let msg = this.editMsg.string;
                    this.editMsg.string = '';
                    let msgNode = null;
                        if (this._danmuNodePool.size() > 0) {
                            msgNode = this._danmuNodePool.get();
                        }
                        else {
                            msgNode = cc.instantiate(this.chatMsg.node);
                            this._msgList.push(msgNode);
                        }
                        msgNode.active = true;
                        msgNode.parent = this.chatMsg.node.parent;
                        msgNode.getComponent(cc.Label).string = msg;
                        this.danmuAnimation(msgNode);
                        cc.log(event['message']);
                    let event1 = {
                        url:KeyValueManager['server_url'],
                        msg_id:C2G_REQ_SEND_MESSAGE,
                        user_id:KeyValueManager['player_data']['user_id'],
                        session_key: KeyValueManager['session'],
                        room_id: KeyValueManager['roomId'],
                        message: msg,
                        type: 2,
                        turn: this._roundCount
                    };
                    NetManager.sendMsg(event1);
                    cc.log('chatmsg');
                }
            }
            break;
            case 'danmu': {
                if(this.danmu.isChecked){
                    for(let i in this._msgList)
                        this._msgList[i].active = true;
                }
                else {
                    for(let i in this._msgList)
                        this._msgList[i].active = false;
                }

            }
            break;
        }
    },
     teamAndPower: function () {
        //确定自己的team和power
        this._power = KeyValueManager['camp'];
        for (let i = 0; i < KeyValueManager['camps'].length; i += 1) {
            for (let j = 0; j < KeyValueManager['camps'][i].length; j += 1) {
                let teamType = KeyValueManager['camps'][i][j];
                KeyValueManager['rank'][teamType] = [INIT_COUNT, INIT_LAND, INIT_CITY];
                if (teamType == this._power)
                    this._team = i;
            }
        }
        KeyValueManager['selfTeam'] = this._team;
        //三国身份模式一主一忠一内三反,身份定位显示
        if (Array.isArray(KeyValueManager['camps'])) {
            if (KeyValueManager['game_mode'] == GameMode.MODE_IDENTITY) {
                KeyValueManager['masterID'] = KeyValueManager['camps'][0][0];
                for (let i in KeyValueManager['camps']) {
                    if (KeyValueManager['camp'] == KeyValueManager['camps'][i][0]) {
                        let identity = parseInt(i);
                        switch (identity) {
                            case Identity.Master_Identity: {
                                this.idLabel[0].active = true;
                                this.idLabel[1].active = false;
                                this.idLabel[2].active = false;
                                this.idLabel[3].active = false;
                            }
                                break;
                            case Identity.Honest_Identity: {
                                this.idLabel[0].active = false;
                                this.idLabel[1].active = true;
                                this.idLabel[2].active = false;
                                this.idLabel[3].active = false;
                            }
                                break;
                            case  Identity.Spy_Identity : {
                                this.idLabel[0].active = false;
                                this.idLabel[1].active = false;
                                this.idLabel[2].active = true;
                                this.idLabel[3].active = false;
                            }
                                break;
                            default:
                                this.idLabel[0].active = false;
                                this.idLabel[1].active = false;
                                this.idLabel[2].active = false;
                                this.idLabel[3].active = true;
                        }
                    }
                }
            }
            else {
                for (let i in this.idLabel)
                    this.idLabel[i].active = false;
            }
        }
    },
    belongTeam: function (power) {
        let result = false;
        for(let i  = 0;i < KeyValueManager['camps'][this._team].length;i += 1) {
            if(power == KeyValueManager['camps'][this._team][i])
                result = true
        }
        return result;
    },
    whichTeam: function (power) {
        let result = null
        for(let i = 0;i < KeyValueManager['camps'].length;i += 1){
            for(let j = 0;j < KeyValueManager['camps'][i].length;j += 1){
                if(power == KeyValueManager['camps'][i][j])
                    result = i;
            }
        }
        return result;
    },
    direction: function (index) {
        let direction = [];
        let top = index - this.mapWidth;
        let bottom = index + this.mapWidth;
        let left = index - 1;
        let right = index + 1;
        if(top < 0)
            direction.push(null);
        else
            direction.push(top);
        if(bottom > this.mapWidth * this.mapHeight - 1)
            direction.push(null);
        else
            direction.push(bottom);
        if(index % this.mapWidth == 0 || left < 0)
            direction.push(null);
        else
            direction.push(left);
        if(index % this.mapWidth == (this.mapWidth - 1) || right % this.mapWidth > (this.mapWidth - 1))
            direction.push(null);
        else
            direction.push(right);
        return direction;
    },
    initWatchData: function (index) {
        let visibleArea = this.visibleArea(parseInt(index));
        for(let i  = 0;i< visibleArea.length;i += 1){
            this._fogData[visibleArea[i]] = 1;
        }
        let focusArea = this.focusArea(parseInt(index));
        for(let i  = 0;i < focusArea.length;i += 1){
            this._watchData[focusArea[i]] = 1;
        }
        //处理迷雾
        for (let i = 0; i < visibleArea.length; i += 1) {
            let node = this._groundList[visibleArea[i]];
            this.addConcern(node, visibleArea[i]);
        }
    },
    updateWatchData: function (index, type) {
        //5*5关注mapData的累计
        let focusArea = this.focusArea(parseInt(index));
        for(let i = 0;i <focusArea.length;i += 1)
        {
            // if(this._mapData[visibleArea[i]] && this._mapData[visibleArea[i]][1] == this._power)
            //     continue;
            if(type == 0)
            {
                if(this._watchData[focusArea[i]])
                    this._watchData[focusArea[i]]++;
                else
                    this._watchData[focusArea[i]] = 1;
               }
            else
            {
                this._watchData[focusArea[i]]--;
                if(this._watchData[focusArea[i]] == 0)
                {
                    delete this._watchData[focusArea[i]];
                    delete this._mapData[focusArea[i]];
                    delete this._changeData[focusArea[i]];
                    this._delWatchData.push(focusArea[i]);
                }
            }
        }
        //3*3迷雾数据累计
        let visibleArea = this.visibleArea(parseInt(index));
        for(let i = 0;i < visibleArea.length;i += 1)
        {
            // if(this._mapData[visibleArea[i]] && this._mapData[visibleArea[i]][1] == this._power)
            //     continue;
            if(type == 0)
            {
                if(this._fogData[visibleArea[i]])
                    this._fogData[visibleArea[i]]++;
                else
                    this._fogData[visibleArea[i]] = 1;
            }
            else
            {
                this._fogData[visibleArea[i]]--;
                if(this._fogData[visibleArea[i]] == 0)
                {
                    delete this._fogData[visibleArea[i]];
                }
            }
        }
        //处理迷雾
        for (let i = 0; i < visibleArea.length; i += 1) {
            let node = this._groundList[visibleArea[i]];
            this.addConcern(node, visibleArea[i]);
        }

    },
    visibleArea: function (index) {
        index = parseInt(index);
        let visible = [];
        let result = [];
        let direction = this.direction(index);
        let topLeft = index - this.mapWidth - 1;
        let topRight = index - this.mapWidth + 1;
        let bottomLeft = index + this.mapWidth - 1;
        let bottomRight = index + this.mapWidth + 1;
        visible.push(index);
        if(topLeft < 0 || (index % this.mapWidth == 0 || topLeft < 0))
            visible.push(null);
        else
            visible.push(topLeft);
        visible.push(direction[0]);
        if(topRight < 0 || (index % this.mapWidth == (this.mapWidth - 1) || topRight % this.mapWidth > (this.mapWidth - 1)))
            visible.push(null);
        else
            visible.push(topRight);
        visible.push(direction[1]);
        visible.push(direction[2]);
        if(bottomLeft > this.mapWidth * this.mapHeight - 1 || (index % this.mapWidth == 0 || bottomLeft < 0))
            visible.push(null);
        else
            visible.push(bottomLeft);
        visible.push((direction[3]));
        if(bottomRight > this.mapWidth * this.mapHeight - 1 || (index % this.mapWidth == (this.mapWidth - 1) || bottomRight % this.mapWidth > (this.mapWidth - 1)))
            visible.push(null);
        else
            visible.push(bottomRight);
        for(let i = 0;i < visible.length;i += 1)        //剔除null的
        {
            if(visible[i] != null){
                result.push(visible[i]);
            }
        }
        return result;
    },
    focusArea: function (index) {
        index = parseInt(index);
        let focus = [];
        let result = [];
        let x = index % this.mapWidth;
        let y = parseInt(index / this.mapWidth);
        for (let i = x - 2; i <= x + 2; i += 1) {
            for (let j = y - 2; j <= y + 2; j += 1)
                if (i >= 0 && i <= this.mapWidth - 1 && j >= 0 && j <= this.mapHeight - 1) {
                    focus.push([i,j]);
                }
        }
        for(let i = 0;i < focus.length; i += 1){
            result.push(focus[i][0] + focus[i][1] * this.mapWidth);
        }
        return result;
    },
    getMaskPos:function (node) {
        let location = {};
        let LT = null;
        let RT = null;
        let LB = null;
        let RB = null;

        let self = this;
        let pos = node.getPosition();
        pos = cc.v2(pos.x / this.fogWidth,pos.y / this.fogHeight) ;
        pos = cc.v2(parseInt(pos.x), parseInt(pos.y));
        let index = function (pos) {
            pos = pos.x * self.mapHeight * 2 + pos.y;
            return pos;
        }

        LT = cc.v2(pos.x, pos.y + 1);
        RT = cc.v2(pos.x + 1, pos.y + 1);
        LB = cc.v2(pos.x, pos.y);
        RB = cc.v2(pos.x + 1, pos.y);
        pos = pos.x * this.mapHeight * 2 + pos.y

        location.LT = this._fogList[index(LT)];
        location.RT = this._fogList[index(RT)];
        location.LB = this._fogList[index(LB)];
        location.RB = this._fogList[index(RB)];
        return location;
    },
    getNodePos:function (node) {
        let pos = node.getPosition();
        pos = cc.v2((pos.x + (this.gridWidth / 2)) / this.gridWidth,(pos.y + (this.gridHeight / 2)) / this.gridHeight);
        pos = cc.v2(parseInt(pos.x), parseInt(pos.y));
        return pos;
    },

    XYShift:function (pos) {
        let subPos = null;
        if(!isNaN(pos)){
            subPos =  {"x":Math.floor(pos / this.mapHeight), "y":pos - Math.floor(pos / this.mapHeight) * this.mapHeight};
        }else{
            subPos = pos.x * this.mapHeight + pos.y;
        }
        return subPos;
    },
    addConcern:function (node,index) {
        let self = this;
        let subPos = this.getNodePos(node);

        if(!self._fogData[index]){
            let maskPos = self.getMaskPos(node);
            maskPos.LT.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
            maskPos.RT.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
            maskPos.LB.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
            maskPos.RB.getComponent(cc.Sprite).spriteFrame = this.fogSprite[0];
            return;
        }

        this.fogALG(node, index);
        let presentPos = function (subPos, x ,y) {
            let pos = {"x":subPos.x + x, "y":subPos.y + y};
            return Utils.XYShift(pos);
        }
        let change = function (x, y,index) {
            let direct = self.direction(parseInt(index));
            let pos = {"x":subPos.x + x, "y":subPos.y + y};
            if(pos.y + 1 < self.mapHeight / 2) {
                    let subNode = self._groundList[direct[0]];
                    if (self._fogData[direct[0]]) self.fogALG(subNode,direct[0]);
            }
            if(pos.y - 1 >= (-self.mapHeight / 2)){
                let subNode = self._groundList[direct[1]];
                if(self._fogData[direct[1]]) self.fogALG(subNode,direct[1]);
           }
            if(pos.x - 1 >= (-self.mapWidth / 2)){
                let subNode = self._groundList[direct[2]];
                if(self._fogData[direct[2]]) self.fogALG(subNode,direct[2]);
           }
           if(pos.x + 1 < self.mapWidth / 2){
                let subNode = self._groundList[direct[3]];
                if(self._fogData[direct[3]]) self.fogALG(subNode,direct[3]);
           }
        }
        let direct = self.direction(parseInt(index));
        if(subPos.x + 1 < self.mapWidth / 2) change(1, 0,direct[0]);
        if(subPos.x - 1 >= (-self.mapWidth / 2)) change(-1,0,direct[1]);
        if(subPos.y + 1 < self.mapHeight / 2) change(0, 1,direct[2]);
        if(subPos.y - 1 >= (-self.mapHeight / 2))change(0,-1,direct[3]);
    },
    fogALG:function (node,index) {
        index = parseInt(index);
        let self = this;
        let nodePos = this.getNodePos(node);
        let maskPos = this.getMaskPos(node);
            maskPos.LT.index = 11;
            maskPos.RT.index = 7;
            maskPos.LB.index = 14;
            maskPos.RB.index = 13;

        let presentPos = function (subPos, x ,y) {
            let pos = {"x":subPos.x + x, "y":subPos.y + y};
            return self.XYShift(pos);
        }

        let LT = function () {
            let diagonal = 0;
            //左
            if(nodePos.x - 1 >= (-self.mapWidth / 2)) {
                if (self._fogData[index - 1]){
                    maskPos.LT.index += 7;
                    diagonal += 1;
                }
            }
            //上
            if( nodePos.y + 1 <= self.mapHeight / 2){
                if(self._fogData[index - self.mapHeight]) {
                    maskPos.LT.index += 14;
                    diagonal += 1;
                }
            }
            //左上
            if(diagonal == 2){
                if (self._fogData[index - self.mapHeight - 1]){
                    maskPos.LT.index += 13;
                }
            }
        }
        let RT = function () {
            let diagonal = 0;
            //右
            if(nodePos.x + 1 <= self.mapWidth / 2) {
                if (self._fogData[index + 1]) {
                    maskPos.RT.index += 11;
                    diagonal += 1;
                }
            }
            //上
            if( nodePos.y + 1 <= self.mapHeight / 2){
                if(self._fogData[index - self.mapHeight]) {
                    maskPos.RT.index += 13;
                    diagonal += 1;
                }
            }
            //右上
            if(diagonal == 2){
                if (self._fogData[index - self.mapHeight + 1]){
                    maskPos.RT.index += 14;
                }
            }
        }
        let LB = function () {
            let diagonal = 0;
            //左
            if(nodePos.x - 1 >= (-self.mapWidth / 2)) {
                if (self._fogData[index - 1]) {
                    maskPos.LB.index += 13;
                    diagonal += 1;
                }
            }
            //下
            if( nodePos.y - 1 >= (-self.mapHeight / 2)){
                if(self._fogData[index + self.mapHeight]){
                    maskPos.LB.index += 11;
                    diagonal += 1;
                }
            }
            //左下
            if(diagonal == 2){
                if (self._fogData[index + self.mapHeight - 1]){
                    maskPos.LB.index += 7;
                }
            }
        }
        let RB = function () {
            let diagonal = 0;
            //右
            if(nodePos.x + 1 <= self.mapWidth / 2) {
                if (self._fogData[index + 1]){
                    maskPos.RB.index += 14;
                    diagonal += 1;
                }
            }
            //下
            if( nodePos.y - 1 >= (-self.mapHeight / 2)){
                if(self._fogData[index + self.mapHeight]){
                    maskPos.RB.index += 7;
                    diagonal += 1;
                }
            }
            //右下
            if(diagonal == 2){
                if (self._fogData[index + self.mapHeight + 1]){
                    maskPos.RB.index += 11;
                }
            }
        }
        LT(); RT(); LB(); RB();

        maskPos.LT.index =  maskPos.LT.index % 15; if(!maskPos.LT.index) maskPos.LT.index = 15;
        maskPos.RT.index =  maskPos.RT.index % 15; if(!maskPos.RT.index) maskPos.RT.index = 15;
        maskPos.LB.index =  maskPos.LB.index % 15; if(!maskPos.LB.index) maskPos.LB.index = 15;
        maskPos.RB.index =  maskPos.RB.index % 15; if(!maskPos.RB.index) maskPos.RB.index = 15;

        maskPos.LT.getComponent(cc.Sprite).spriteFrame = this.fogSprite[maskPos.LT.index];
        maskPos.RT.getComponent(cc.Sprite).spriteFrame = this.fogSprite[maskPos.RT.index];
        maskPos.LB.getComponent(cc.Sprite).spriteFrame = this.fogSprite[maskPos.LB.index];
        maskPos.RB.getComponent(cc.Sprite).spriteFrame = this.fogSprite[maskPos.RB.index];
    },
     chooesPic: function (index) {
         let top = index - this.mapWidth;
         let bottom = index + this.mapWidth;
         let left = index - 1;
         let right = index + 1;

         let selfTeam = this._mapData[index][1];
         let current = [];
         if(this._mapData[top])
         {
             if(top < 0)
                 current.push(1);
             else
                 current.push(this._mapData[top][1] == selfTeam ? 1: 0);
         }
         else
             current.push(0);
         if(this._mapData[bottom]) {
         if(bottom > this.mapWidth * this.mapHeight - 1)
             current.push(1);
         else
             current.push(this._mapData[bottom][1] == selfTeam ? 1: 0);
         }
         else
             current.push(0);
         if(this._mapData[left]) {
             if (index % this.mapWidth == 0 || left < 0)
                 current.push(1);
             else
                 current.push(this._mapData[left][1] == selfTeam ? 1 : 0);
         }
         else
             current.push(0);
         if(this._mapData[right]) {
             if (index % this.mapWidth == (this.mapWidth - 1) || right % this.mapWidth > (this.mapWidth - 1))
                 current.push(1);
             else
                 current.push(this._mapData[right][1] == selfTeam ? 1 : 0);
         }
         else
             current.push(0);
         let result = 0;
         let rule = [[]];
         if(this._mapData[index][1] != 0){
             rule = LAND_RULE;
         }
         else {
             rule = FOG_RULE;
         }
         for (let i = 0; i < rule.length; ++i)
         {
             result = i;
             let allTrue = true;
             for(let j = 0; j < rule[i].length; ++j)
             {
                 if(current[j] != rule[i][j])
                 {
                     allTrue = false;
                     break;
                 }
             }
             if(allTrue)
                 break;
         }
             return result;
     },
     dataShow: function () {
         let halfLen = this.mapWidth * this.gridWidth * 0.5;

         for(let index in this._mapData) {

                 if (this._mapData[index][0] == 0 && this._mapData[index][1] == -1 && this._mapData[index][2] == 0) {
                     if (this._armyList[index] && this._armyList[index].active) {
                         this._armyList[index].active = false;
                     }
                     if (this._landList[index] && this._landList[index].active) {
                         this._landList[index].active = false;
                     }
                     if (this._buildingList[index] && this._buildingList[index].active) {
                         this._buildingList[index].active = false;

                     }
                     continue;
                 }
                 let x = parseInt(index) % this.mapWidth;
                 let y = parseInt(parseInt(index) / this.mapWidth);
                 //处理地图上面的地块
                 if (this._mapData[index][0] >= 0) {
                     if (!this._landList[index]) {
                         let teamType = this._mapData[index][1];
                         if (teamType != -1) {
                             let roadNode = cc.instantiate(this.roadNode);
                             roadNode.active = true;
                             roadNode.parent = this.teamRoadList[teamType];
                             roadNode.setPosition(-halfLen + this.gridWidth * 0.5 + this.gridWidth * x,
                                 halfLen - this.gridHeight * 0.5 - this.gridWidth * y);
                             this._landList[index] = roadNode;
                             //根据势力换图
                             let result = this.chooesPic(parseInt(index));
                             roadNode.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][teamType].data.getComponent('ThemeGroup').roadSprite[result];
                             roadNode.getChildByName('land_around').getComponent(cc.Sprite).spriteFrame = KeyValueManager['land_around'][teamType].data
                                 .getComponent('LandAround').aroundFrame[result];
                         }
                     }
                     else {
                         if (!this._landList[index].active)
                             this._landList[index].active = true;
                         let teamType = this._mapData[index][1];
                         if(teamType == -1) {
                             if(this._landList[index].active)
                                 this._landList[index].active = false;
                         }
                         else {
                             let roadNode = this._landList[index];
                             //根据势力换图
                             let result = this.chooesPic(parseInt(index));
                             roadNode.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][teamType].data.getComponent('ThemeGroup').roadSprite[result];
                             roadNode.getChildByName('land_around').getComponent(cc.Sprite).spriteFrame = KeyValueManager['land_around'][teamType].data
                                 .getComponent('LandAround').aroundFrame[result];
                             roadNode.parent = this.teamRoadList[teamType];
                         }

                     }
                 }
             //处理生成障碍
             if(this._mapData[index][0] == 3){
                 if(!this._blockList[index]) {
                     let newNode = cc.instantiate(this.blockSprite);
                     newNode.parent = this.blockSprite.parent;
                     newNode.active = true;
                     newNode.setPosition(-halfLen + this.gridWidth * 0.5 + this.gridWidth * x,
                         halfLen - this.gridHeight * 0.5 - this.gridWidth * y);
                     this.setBlockByIndex(index, newNode);
                     let direct = this.direction(parseInt(index));
                     let teamArr = [];
                     let teamType = null;
                     for(let i = 0;i < direct.length; i += 1){
                         if(direct[i] == null)
                             continue;
                         if(this._mapData[direct[i]] && this._mapData[direct[i]][1] != -1) {
                             teamArr.push(this._mapData[direct[i]][1]);
                         }
                     }
                     let maxEle = Utils.arrayMost(teamArr);
                     if(maxEle && maxEle.length == 1)
                         teamType = maxEle[0];
                     if(teamType != null) {
                         this._blockList[index].getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][teamType].data.getComponent('ThemeGroup').blockFrame;
                     }
                 }
                 else {
                     this._blockList[index].active = true;
                     let direct = this.direction(parseInt(index));
                     let teamType = null;
                     let teamArr = [];
                     for(let i = 0; i < direct.length; i += 1){
                         if(direct[i] == null)
                             continue;
                         if(this._mapData[direct[i]] && this._mapData[direct[i]][1] != -1) {
                             teamArr.push(this._mapData[direct[i]][1]);
                         }
                     }
                     let maxEle = Utils.arrayMost(teamArr);
                     if(maxEle && maxEle.length == 1)
                         teamType = maxEle[0];
                     if(teamType != null) {
                         this._blockList[index].getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][teamType].data.getComponent('ThemeGroup').blockFrame;
                     }
                     else {
                         this._blockList[index].getComponent(cc.Sprite).spriteFrame = this.initBlockFrame;
                     }
                 }
                 continue;
             }
                 if (this._oldMapData[index] && this._oldMapData[index][0] == this._mapData[index][0]
                     && this._oldMapData[index][1] == this._mapData[index][1] && this._oldMapData[index][2] == this._mapData[index][2])
                     continue;
                 //处理地表上面的文字显示
                 if (this._mapData[index][2] > 0) {
                     if (!this._armyList[index]) {
                         let newLabel = cc.instantiate(this.armyLabel);
                         newLabel.active = true;
                         newLabel.parent = this.armyLabel.parent;
                         newLabel.setPosition(-halfLen + this.gridWidth * 0.5 + this.gridWidth * x,
                             halfLen - this.gridHeight * 0.5 - this.gridWidth * y);
                         newLabel.getComponent(cc.Label).string = this._mapData[index][2];
                         this._armyList[index] = newLabel;
                     }
                     else {
                         if (!this._armyList[index].active)
                             this._armyList[index].active = true;
                         this._armyList[index].getComponent(cc.Label).string = this._mapData[index][2];
                     }
                 }
                 else {
                     if (this._armyList[index] && this._armyList[index].active) {
                         this._armyList[index].active = false;
                     }
                 }
                 //处理地块上面的建筑
                 if (this._mapData[index][0] > 0) {
                         if (!this._buildingList[index]) {
                             let teamType = this._mapData[index][1];
                             let buildType = this._mapData[index][0] - 1;
                             let newNode = cc.instantiate(this.buildingSprite[buildType]);
                             newNode.parent = this.buildingSprite[buildType].parent;
                             newNode.active = true;
                             if (teamType != -1) {
                                 if (buildType == 0)
                                     newNode.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][teamType].data.getComponent('ThemeGroup').mainCity;
                                 else
                                     newNode.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][teamType].data.getComponent('ThemeGroup').viceCity;
                             }
                             else
                                 newNode.getComponent(cc.Sprite).spriteFrame = this.initBuildingFrame[buildType];
                             newNode.setPosition(-halfLen + this.gridWidth * 0.5 + this.gridWidth * x,
                                 halfLen - this.gridHeight * 0.5 - this.gridWidth * y);
                             this._buildingList[index] = newNode;
                         }
                         else {
                             if (!this._buildingList[index].active)
                                 this._buildingList[index].active = true;
                             let newNode = this._buildingList[index];
                             let teamType = this._mapData[index][1];
                             let buildType = this._mapData[index][0] - 1;
                             if (teamType != -1) {
                                 if (buildType == 0)
                                     newNode.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][teamType].data.getComponent('ThemeGroup').mainCity;
                                 else
                                     newNode.getComponent(cc.Sprite).spriteFrame = KeyValueManager['themeList'][teamType].data.getComponent('ThemeGroup').viceCity;
                             }
                             else
                                 newNode.getComponent(cc.Sprite).spriteFrame = this.initBuildingFrame[buildType];
                         }
                 }
         }
         for (let i in this._delWatchData) {
             let index = this._delWatchData[i];
             if (this._armyList[index] && this._armyList[index].active) {
                 this._armyList[index].active = false;
             }
             if (this._landList[index] && this._landList[index].active) {
                 this._landList[index].active = false;
             }
             if (this._buildingList[index] && this._buildingList[index].active) {
                 this._buildingList[index].active = false;
             }
         }
         this._delWatchData = [];
     },

    // isTeamList: function (index) {
    //              let result = false;
    //              for (let i = 0; i < KeyValueManager['teamList'].length; i += 1) {
    //                  if (index.localeCompare(KeyValueManager['teamList'][i]) == 0) {
    //                      result = true;
    //                      break;
    //                  }
    //              }
    //              return result;
    //          },
     lastData: function () {
         this._lastData = [];
         for(let i in this._mapData) {
             if(this._mapData[i] && typeof(this._mapData[i].length) != "undefined" && this._mapData[i].length > 1 && this._mapData[i][1] != -1)
             {
                 if (this._roundCount % CITY_ROUND_COUNT == 0 && (this._mapData[i][0] == 1 || this._mapData[i][0] == 2)) {
                     this._lastData.push(i);
                 }
                 else if(this._roundCount % LAND_ROUND_COUNT == 0 && this._mapData[i][0] == 0) {
                     this._lastData.push(i);
                 }
             }
             else {
                 if(this._mapData[i][0] == 2 && this._mapData[i][2] < this._emptyCityData[i] && this._roundCount % 2 == 0){
                        //空城增兵
                     this._lastData.push(i);
                 }
             }
         }
     },
     cancelMove: function (index) {
       //将这个index为目的行为数据清空，并且建立新的行为数据
       //   for(let i in this._behaviorData){
       //       delete this._behaviorData[i];
       //   }
       //   for(let i in KeyValueManager['guideNode']){
       //       for(let j in KeyValueManager['guideNode'][i]) {
       //       KeyValueManager['guideNode'][i][j].active = false;
       //       this._directPool.put(KeyValueManager['guideNode'][i][j]);
       //       delete KeyValueManager['guideNode'][i];
       //       }
       //   }
         //干掉行为数据和路线节点
         let delDest = [];
         for(let i in KeyValueManager['destRound'][index]){
             let start = KeyValueManager['destRound'][index][i][0];
             let end = KeyValueManager['destRound'][index][i][1];
             for(let j = start;j < end + 1;j += 1) {
                 if(this._behaviorData[j])
                     delete this._behaviorData[j];
                 for(let k  = 0;KeyValueManager['guideNode'][j + 1] && k < KeyValueManager['guideNode'][j + 1].length;k += 1) { //因为路线效果消失是在下一回
                     KeyValueManager['guideNode'][j + 1][k].active = false;
                     this._directPool.put(KeyValueManager['guideNode'][j + 1][k]);
                 }
                 delete KeyValueManager['guideNode'][j +1];
             }
         }
         //回合数补正
         let addRound = 0;
         delDest = KeyValueManager['destRound'][index];
         for(let i = 0;i < KeyValueManager['destNode'][index].length;i += 1) {
             KeyValueManager['destNode'][index][i].active = false;
             this._destNodePool.put(KeyValueManager['destNode'][index][i]);
         }
         delete KeyValueManager['destNode'][index];
         delete KeyValueManager['destRound'][index];

         for(let i in KeyValueManager['destRound']){
             for(let j = 0;j < KeyValueManager['destRound'].length; j += 1) {
                 for(let k  = 0;k < delDest.length;k += 1) {
                     if(KeyValueManager['destRound'][i][j][0] > delDest[k][0]){
                         if(this._roundCount > delDest[k][0])
                             addRound += (delDest[k][1] - this._roundCount);
                         else
                             addRound += (delDest[k][1] - delDest[k][0]);
                         KeyValueManager['destRound'][i][j][0] -= addRound;
                         KeyValueManager['destRound'][i][j][1] -= addRound;
                     }

                 }
             }
         }

         let data = [];
         for(let i in this._behaviorData){
             data.push(this._behaviorData[i]);
             delete this._behaviorData[i];
         }
         KeyValueManager['moveRound'] = this._roundCount + 1;
         for(let i = 0;i < data.length; i += 1){
             this._behaviorData[KeyValueManager['moveRound']] = data[i];
             KeyValueManager['moveRound'] += 1;
         }

         let guideNode = [];
         for(let i in KeyValueManager['guideNode']){
             guideNode.push(KeyValueManager['guideNode'][i]);
             delete KeyValueManager['guideNode'][i];
         }
         KeyValueManager['moveRound'] = this._roundCount + 1;
         for(let i = 0; i < guideNode.length; i += 1){
             KeyValueManager['guideNode'][KeyValueManager['moveRound']] = guideNode[i];
             KeyValueManager['moveRound'] += 1;
         }
     },
     canceOne: function () {
         //将行为数据尾干掉一个
     },
     roundLoop:function () {
         if(this._state == FightState.E_STATE_START)
         {
             //计算每个势力的地块数和兵力数
             if(!KeyValueManager['serverRank']) {
                 this.addCount();
             }
             else
                 KeyValueManager['serverRank'] = false;
             //持续数据计算 保持与服务器同步
             this.lastData(this._roundCount);
             for(let i = 0;i < this._lastData.length;i += 1)
             {
                 this._mapData[this._lastData[i]][2] += 1;
             }
             this._lastData = [];

             //处理行为数据,行为数据为从pos1移动到pos2
             let postData = {};
             if(this._behaviorData[this._roundCount])
             {
                 postData[1] = {};
                 postData[0] = {};
                 //先处理行为数据
                 let hasBehavior = false;
                 for (let i in this._behaviorData[this._roundCount])
                 {
                     let index = this._behaviorData[this._roundCount][i][0];
                     let index1 = this._behaviorData[this._roundCount][i][1];
                     //如果无效那么继续
                     if (!this._mapData[index] || this._mapData[index][1] != this._power
                         || !this.canMove(index, index1) || this._mapData[index][2] <= 0)
                     {
                         continue;
                     }
                     hasBehavior = true;
                     let moveCount = this._mapData[index][2];
                     if( this._mapData[index][2] <= 0)
                     {
                         moveCount = 0;
                     }

                     if(moveCount != 0)
                     {
                         let ifHas = false;

                         if (postData[1][index])
                         {
                             postData[1][index] += moveCount;
                             ifHas = true;
                         }

                         if(!ifHas)
                         {
                             postData[1][index]=  moveCount;
                         }
                         ifHas = false;

                         if (postData[0][index1])
                         {
                             postData[0][index1] += moveCount;
                             ifHas = true;
                         }

                         if(!ifHas)
                         {
                             postData[0][index1]= moveCount;
                         }
                     }
                     this._mapData[index][2] = 0;
                     if(!this._mapData[index1])
                     {
                         this._mapData[index1]=[0, -1, 0];
                     }
                     //如果不是你的地盘，那么就减去
                     if(this._mapData[index1][1] == -1)
                     {
                         if(this._mapData[index1][0] > 0)
                         {
                             if(moveCount > this._mapData[index1][2])
                             {
                                 //解开小城堡
                                 cc.audioEngine.play(KeyValueManager['unlock_clip'],false,KeyValueManager['effect_volume']);
                                 //成功占地盘
                                 this.updateWatchData(index1, 0);
                                 this._mapData[index1][2] = moveCount - this._mapData[index1][2];
                                 this._mapData[index1][1] = this._power;
                             }
                             else
                             {
                                 this._mapData[index1][2] -= moveCount;
                             }
                         }
                         else
                         {
                             //成功占地盘
                             this.updateWatchData(index1, 0);
                             this._mapData[index1][2] = moveCount - 1;
                             this._mapData[index1][1] = this._power;
                         }

                     }
                     else  if(this.belongTeam(this._mapData[index1][1]))
                     {
                         // if(this._partnerData[index]){
                         //     this._mapData[index][1] = this._partnerData[index];
                         //     cc.log('is ok');
                         // }
                         //主城不变势力
                         if(this._mapData[index1][0] != 1)
                             this._mapData[index1][1] = this._power;
                         this._mapData[index1][2] += moveCount;
                     }
                     else if(!this.belongTeam(this._mapData[index1][1]))
                     {
                         if(moveCount > this._mapData[index1][2])
                         {
                             //占领敌方主城
                             if(this._mapData[index1][0] == 1){
                                 cc.audioEngine.play(KeyValueManager['city_win_clip'],false,KeyValueManager['effect_volume']);
                             }
                             //成功占地盘
                             this.updateWatchData(index1, 0);
                             this._mapData[index1][2] = moveCount - this._mapData[index1][2] - 1;
                             this._mapData[index1][1] = this._power;
                         }
                         else
                         {
                             this._mapData[index1][2] -= moveCount;
                         }
                     }
                     //旗子移动的效果
                     let startPos = this._groundList[index].getPosition();
                     let startWorld = this._groundList[index].parent.convertToWorldSpaceAR(startPos);
                     let startNode = this.flag.parent.convertToNodeSpaceAR(startWorld);
                     let endPos = this._groundList[index1].getPosition();
                     let endWorld = this._groundList[index1].parent.convertToWorldSpaceAR(endPos);
                     let endNode = this.flag.parent.convertToNodeSpaceAR(endWorld);
                     this.flag.active = true;
                     this.flag.setPosition(startNode);
                     let moveAction = cc.moveTo(0.2,cc.v2(endNode.x,endNode.y));
                     let newAction = cc.speed(moveAction,10);
                     this.flag.runAction(newAction);
                     if(this._mapData[index1][2] < 1)
                     {
                         this.scheduleOnce(function () {
                             this.flag.active = false;
                         },0.5);
                         if(KeyValueManager['guideNode'][this._roundCount]){
                             for(let i= 0;i < KeyValueManager['guideNode'][this._roundCount].length; i += 1){
                                 KeyValueManager['guideNode'][this._roundCount][i].active = false;
                                 this._directPool.put(KeyValueManager['guideNode'][this._roundCount][i]);
                             }
                             delete KeyValueManager['guideNode'][this._roundCount];
                         }
                         this._currentSelect = -1;
                     }
                 }
                 //把数据发给服务器端,指引不发
                 if(hasBehavior && !KeyValueManager['is_guide'])
                 {
                     let event = {
                         url:KeyValueManager['server_url'],
                         msg_id: C2G_REQ_SYNC_CHANGE,
                         user_id: KeyValueManager['player_data']['user_id'],
                         session_key: KeyValueManager['session'],
                         up: postData[0],
                         down: postData[1],
                         turn: this._roundCount,
                     };
                     NetManager.sendMsg(event);
                 }
                 delete this._behaviorData[this._roundCount];
             }
             else {
                 //没有行为数据f消失旗帜
                 this.flag.active = false;
                 // for(let i = 0;i < KeyValueManager['guideNode'].length;i += 1){
                 //     KeyValueManager['guideNode'][i].active = false;
                 //     this._directPool.put(KeyValueManager['guideNode'][i]);
                 // }
                 // KeyValueManager['guideNode'] = [];
             }


             //显示更新
             this.dataShow();

             for(let i in KeyValueManager['guideNode']){
                 if(this._roundCount >= parseInt(i)){
                     cc.log(i);
                     for(let j = 0;KeyValueManager['guideNode'][this._roundCount] && j < KeyValueManager['guideNode'][this._roundCount].length; j += 1){
                         cc.log(i);cc.log(KeyValueManager['guideNode']);cc.log(j);
                         KeyValueManager['guideNode'][i][j].active = false;
                         this._directPool.put(KeyValueManager['guideNode'][i][j]);
                     }
                     delete KeyValueManager['guideNode'][i];
                 }
             }
             for(let i in KeyValueManager['destRound']) {
                 for (let j  = 0;KeyValueManager['destRound'][i] && j < KeyValueManager['destRound'][i].length;j += 1) {
                     if (this._roundCount >= KeyValueManager['destRound'][i][j][1]) {
                         KeyValueManager['destRound'][i].shift();
                         cc.log('test');
                     }
                     let end = KeyValueManager['destRound'][i].length;
                     if(end == 0){
                         for(let k = 0;k < KeyValueManager['destNode'][i].length;k += 1) {
                             KeyValueManager['destNode'][i][k].active = false;
                             this._destNodePool.put(KeyValueManager['destNode'][i][k]);
                         }
                         delete KeyValueManager['destNode'][i];
                         delete KeyValueManager['destRound'][i];
                     }
                 }
             }
             if(KeyValueManager['is_guide']) {
                 KeyValueManager['rank'][this._power][0] = 0;
                 KeyValueManager['rank'][this._power][1] = 0;
                 KeyValueManager['rank'][this._power][2] = 0;
             }
             for(let i in this._mapData)
             {
                 if(!this._oldMapData[i])
                    this._oldMapData[i] = [];
                 this._oldMapData[i][0] = this._mapData[i][0];
                 this._oldMapData[i][1] = this._mapData[i][1];
                 this._oldMapData[i][2] = this._mapData[i][2];

                 //指引rank自己势力数据客户端统计
                 if(KeyValueManager['is_guide']){
                     if(this._mapData[i][1] == this._power){
                         KeyValueManager['rank'][this._power][0] += this._mapData[i][2];
                         KeyValueManager['rank'][this._power][1] += 1;
                         if(this._mapData[i][0] == 1 || this._mapData[i][0] == 2){
                             KeyValueManager['rank'][this._power][2] += 1;
                         }
                     }
                 }
             }
         }
     },
    addCount: function () {
        for(let i in KeyValueManager['rank']){
            let addCount = 0;
            if(this._roundCount % CITY_ROUND_COUNT == 0 ){
                for(let j = 0;j < KeyValueManager['rank'][i][2]; j += 1)
                    addCount += 1;
            }
            if(this._roundCount % LAND_ROUND_COUNT == 0){
                for(let k = 0;k < KeyValueManager['rank'][i][1] - KeyValueManager['rank'][i][2]; k += 1)
                    addCount += 1;
            }
                KeyValueManager['rank'][i][0] += addCount;
        }
    },
     update: function (dt) {
         //当主城兵力大于空城兵力时
         if(KeyValueManager['is_guide']) {
             if (this._mapData[KeyValueManager['main_city_index']][2] > this._mapData[KeyValueManager['empty_city_index']][2]
                 && this._mapData[KeyValueManager['empty_city_index']][1] != this._power && this._mapData[KeyValueManager['enemy_city_index']][1] != this._power
                 && KeyValueManager['search_move_over']) {
                 KeyValueManager['search_move_over'] = false;
                 let pos = this._groundList[KeyValueManager['main_city_index']].getPosition();
                 let world_pos = this._groundList[KeyValueManager['main_city_index']].parent.convertToWorldSpaceAR(pos);
                 KeyValueManager['mask_node_world_pos'] = world_pos;
                 KeyValueManager['occupy_vice_city'] = true;
                 EventManager.pushEvent({'msg_id': Unit_Step.Game_level.Choose_MainCity});
             }
             if(this._mapData[KeyValueManager['enemy_city_index']][1] == this._power && this && !KeyValueManager['GameOver']){
                 KeyValueManager['GameOver'] = true;
                 let event1 = {
                     url: KeyValueManager['server_url'],
                     msg_id: C2G_REQ_FINISH_GUIDE,
                     user_id: KeyValueManager['player_data']['user_id'],
                     session_key: KeyValueManager['session'],
                 };
                 NetManager.sendMsg(event1);
             }
         }
         //回放结束
         if(KeyValueManager['isReplay'] && KeyValueManager['turn'] <= KeyValueManager['currentRound']){
             KeyValueManager['isReplay'] = false;
             KeyValueManager['GameOver'] = true;
             this._mapData = {};
             this._roundCount = 0;
             KeyValueManager['currentRound'] = 0;
             KeyValueManager['history'] = {};
         }
         if(KeyValueManager['GameOver'] && !KeyValueManager['isReplay'])   //游戏中和回放中
             return;
         let time = NetManager.getCurrentMT() - KeyValueManager['timeDiff'];
         //完全相信服务器端数据，直接覆盖
         for(let i in this._changeData)
         {
             //如果自己队伍的地块被占

             if(this._mapData[i])
             {
                 let mapData = this._mapData[i][1];
                 let changeData = this._changeData[i][1];
                 let before = this.belongTeam(mapData);
                 let change = this.belongTeam(changeData);
                 if((before && !change) || (mapData == KeyValueManager['masterID'] && changeData != KeyValueManager['masterID'])){
                     //自己的主城堡被摧毁了
                     if(this._mapData[i][0] == 1 && this._mapData[i][1] == this._power){
                         cc.audioEngine.play(KeyValueManager['city_lose_clip'],false,KeyValueManager['effect_volume']);
                     }
                     this.updateWatchData(i, 1);
                     //地块被占，此时光标在被侵占地块上，失去焦点
                     let curPos = this.cursor.getPosition();
                     let blockPos = this._groundList[i].getPosition();
                     if (curPos.x == blockPos.x && curPos.y == blockPos.y) {
                         this.cursor.active = false;
                         this._currentSelect = -1;
                     }
                 }
                 //占地
                 else  if((!before && change) || (mapData != KeyValueManager['masterID'] && changeData == KeyValueManager['masterID'])){
                     this.updateWatchData(i,0);
                 }
             }
             //占地
             else {
                 let changeData = this._changeData[i][1];
                 let change = this.belongTeam(this._changeData[i][1]);
                 if(change || changeData == KeyValueManager['masterID']){
                     this.updateWatchData(i,0);
                 }
             }
             this._mapData[i] = this._changeData[i];
             // //队友的势力
             // if(this.belongTeam(this._changeData[i][1]) && this._changeData[i][1] != this._power){
             //     this._partnerData[i] = this._changeData[i][1];
             // }
             // else if(!this.belongTeam(this._changeData[i][1])) {
             //     if(this._partnerData[i])
             //         delete this._partnerData[i];
             // }
             // cc.log(Object.keys(this._partnerData).length);
         }
         this._changeData = {};
         //快进，分段处理时间
         let fastTime = time - KeyValueManager['currentTime'] - KeyValueManager['fastCurrentTime'];
         let fastRound = KeyValueManager['currentRound'] - KeyValueManager['fastCurrentRound'];
         if(fastTime > KeyValueManager['round_time'] * 1000 * fastRound) {
             //弹幕
             if(this._msgData[this._roundCount]){
                 for(let i in this._msgData[this._roundCount]){
                     let msg = this._msgData[this._roundCount][i];
                     let msgNode = null;
                     if (this._danmuNodePool.size() > 0) {
                         msgNode = this._danmuNodePool.get();
                     }
                     else {
                         msgNode = cc.instantiate(this.chatMsg.node);
                         this._msgList.push(msgNode);
                     }
                     msgNode.active = true;
                     msgNode.parent = this.chatMsg.node.parent;
                     msgNode.getComponent(cc.Label).string = msg;
                     this.danmuAnimation(msgNode);
                 }
             }
             //分段拿回合数据
             if(KeyValueManager['currentRound'] + HISTORY_LAST_COUNT == KeyValueManager['history_start']){
                 let start = KeyValueManager['history_start'];
                 KeyValueManager['history_start'] += HISTORY_TURN_COUNT;
                 let end = KeyValueManager['history_start'];
                 let event1 = {
                     url:KeyValueManager['server_url'],
                     msg_id:C2G_REQ_WATCH_HISTORY,
                     user_id:KeyValueManager['player_data']['user_id'],
                     session_key: KeyValueManager['session'],
                     start: start,
                     end: end,
                     id:KeyValueManager['gameId']
                 };
                 NetManager.sendMsg(event1);
             }
             //回放数据覆盖
             if(KeyValueManager['history'][KeyValueManager['currentRound']]) {
                 if (KeyValueManager['history'][KeyValueManager['currentRound']][RecordData.RECODE_MAP_DATA]) {
                     let mapData = KeyValueManager['history'][KeyValueManager['currentRound']][RecordData.RECODE_MAP_DATA];
                     for(let i in mapData){
                         this._mapData[i] = mapData[i];
                         // cc.log(KeyValueManager['currentRound'],i,this._mapData[i][0],this._mapData[i][1],this._mapData[i][2]);
                     }
                 }
                 if (KeyValueManager['history'][KeyValueManager['currentRound']][RecordData.RECODE_RANK]) {
                     let rank = KeyValueManager['history'][KeyValueManager['currentRound']][RecordData.RECODE_RANK]
                     KeyValueManager['rank'] = Utils.deepCopy(rank);
                 }
                 if(KeyValueManager['history'][KeyValueManager['currentRound']][RecordData.RECODE_DEATH]){
                     //某人被干掉了
                 }
             }
             let currentRound = KeyValueManager['currentRound'];
             this._roundCount =  KeyValueManager['fastCurrentRound'] + parseInt(fastTime / (KeyValueManager['round_time'] * 1000));
             KeyValueManager['roundCount'] = this._roundCount;
             //每回合游戏显示界面更新
             EventManager.pushEvent({'msg_id': 'GAME_LAYER'});
             this._state = FightState.E_STATE_START;
             //回合差
             let roundSum = this._roundCount - currentRound;
             if(roundSum == 0) {
                 this.roundLoop();
             }
             while (roundSum > 0){
                 this._roundCount = currentRound + 1;
                 this.roundLoop();
                 roundSum -= 1;
                 currentRound += 1;
             }
             KeyValueManager['currentRound'] = this._roundCount + 1;
         }
     }
    });