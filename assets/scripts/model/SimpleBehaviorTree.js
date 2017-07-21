/**
 * Created by Perry.Li on 2017/2/23.
 */
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
let NodePool = require('NodePool');
// condition 是条件组，格式为{"and":[],"or":[]}，and表示里面所有都得为true，or表示里面只需要一个为True，值为[]，值里面具体条件为[类型,值], 例如{"and":[[0,a,1]], "or":[[1,a,1]]}

let Condition_Type = cc.Enum({
    E_CLICK: 0, //点击，无值
    E_DRAG: 1,  //拖拽，值为x, y, width, height! x, y 为中心点，width, height为长宽
    E_ANIMATION_END: 2, //当前播放动画结束，无值
    E_WAIT:3,       //等待时间结束,值为时间，以秒单位
    E_MOVE_END:4, //移动结束
    E_BLACK_BOARD:5, //黑板，值为key,value 例如："a",1
});
//Task 是执行的动作，格式为[类型, 参数1, 参数2]，
let Task_Type = cc.Enum({
    E_PLAY_ANIMATION: 0, //播放动画，参数为动画名
    E_DELAY:1,  //延迟，参数为时间，单位为秒
    E_DIE:2,    //死亡，无参数
    E_TIPS:3,   //提示，参数为提示时间
    E_MOVE:4,     //移动，参数为目的地与时间，x, y, 时间
    E_COMPLETE_LEVEL:5, //完成关卡
});
//事件在进入Task与结束Task时调用，目前事件只支持黑板操作，参数为0，0时所有黑板里面的数据清空，仅用于关卡结束时
let Task = cc.Class({
    properties: {
        _nextTaskList:[],
        _enterEvent:[],
        _exitEvent:[],
        _task:[],
        _startWaitTime:0,
        _moveEndFlag: false,
        _aniEndFlag: false,
        _clickFlag: false,
        _dragPosX: 0,
        _dragPosY: 0,
        _host:null,
    },
    enter: function () {
        for(let i in this._enterEvent)
        {
            if(this._enterEvent[i][0] == 0)
            {
                delete KeyValueManager['Black_Board'];
            }
            if(!KeyValueManager['Black_Board'])
                KeyValueManager['Black_Board'] = {};
            KeyValueManager['Black_Board'][this._enterEvent[i][0]] = this._enterEvent[i][1];
        }
        if(this._task)
        {
            if(this._task[0] == Task_Type.E_PLAY_ANIMATION)
            {
                //播放动画，然后结束后把_aniEndFlag设为true
                let ani = this._host.getComponent(cc.Animation);
                if(ani)
                {
                    ani.play(this._task[1]);
                    let self = this;
                    ani.on(this._task[1], 'finish', function () {
                        self._aniEndFlag = true;
                    }, this)
                }
            }
            else if (this._task[0] == Task_Type.E_DELAY)
            {
                this._startWaitTime = NetManager.getCurrentMT();
            }
            else if (this._task[0] == Task_Type.E_DIE)
            {
                this._currentTask._host.removeFromParent();
            }
            else if (this._task[0] == Task_Type.E_TIPS)
            {
                //发消息告诉Tips要显示文字

            }
            else if(this._task[0] == Task_Type.E_MOVE)
            {
                //移动事件,MoveTo，然后结束后把_moveEndFlag设立true
                let moveAction = cc.moveTo(this._task[3], this._task[1], this._task[2]);
                this._host.runAction(moveAction);

            }
            else if(this._task[0] == Task_Type.E_COMPLETE_LEVEL)
            {
                //发消息告诉完成关卡
            }
        }
        return true;
    },
    exit: function()
    {
        for(let i in this._exitEvent)
        {
            if(this._enterEvent[i][0] == 0)
            {
                delete KeyValueManager['Black_Board'];
            }
            if(!KeyValueManager['Black_Board'])
                KeyValueManager['Black_Board'] = {};
            KeyValueManager['Black_Board'][this._enterEvent[i][0]] = this._enterEvent[i][1];
        }
    },
    execute: function () {
        for (let i in this._nextTaskList)
        {
            if (this.checkConditionGroup(this._nextTaskList[i][0]))
            {
                return this._nextTaskList[i][1];
            }
        }
        return null;
    },
    checkCondition: function (condition) {
        if(condition[0] == Condition_Type.E_CLICK)
        {
            return this._clickFlag;
        }
        else if(condition[0] == Condition_Type.E_DRAG)
        {
            let rect = cc.Rect(condition[1] - condition[3] *0.5, condition[2] - condition[4] *0.5, condition[3], condition[4] );
            rect.contains(cc.Point(this._dragPosX, this._dragPosY));
        }
        else if (condition[0] == Condition_Type.E_ANIMATION_END )
        {
            return this._aniEndFlag;
        }
        else if (condition[0] == Condition_Type.E_WAIT )
        {
            if (NetManager.getCurrentMT() - this._startWaitTime > condition[1] * 1000)
            {
                return true;
            }
            else
                return false;
        }
        else if (condition[0] == Condition_Type.E_MOVE_END )
        {
            return this._moveEndFlag;
        }
        else if (condition[0] == Condition_Type.E_BLACK_BOARD )
        {
            if(KeyValueManager['Black_Board'] && KeyValueManager['Black_Board'][condition[1]] == condition[2])
                return true;
            else
                return false;
        }
    },
    checkConditionGroup: function(condition) {
        let andCondition = condition['add'];
        let andResult = true;
        for (let i in andCondition)
        {
            if(!this.checkCondition(andCondition[i]))
            {
                andResult = false;
                break;
            }
        }
        if (!andResult)
            return false;
        let orResult = false;
        let orCondition = condition['or'];
        for (let i in orCondition)
        {
            if(this.checkCondition(orCondition[i]))
            {
                orResult = true;
                break;
            }
        }
        if (!orResult)
            return false;
        return true;
    },

});
let SimpleBehaviorTree =
    cc.Class({
         extends: cc.Component,

         properties: {
             _currentTask:null,
             _taskList:null
         },
        update:function (dt) {
             if(this._currentTask)
             {
                 let result = this._currentTask.execute();
                 if (result)
                 {
                     this._currentTask.exit();
                     this._currentTask = this._taskList[result];
                     if(this._currentTask ) {
                         this._currentTask._host = this.node;
                         if (!this._currentTask.enter()) {
                             this._currentTask = null;
                         }
                     }
                 }
             }
        },
        onLoad:function () {
            
        },
        onDestroy: function () {
            
        },
        addTask:function (name, task) {
            if(!this._taskList)
            {
                this._taskList = {};
            }
            this._taskList[name] = task;
        }
        
 });