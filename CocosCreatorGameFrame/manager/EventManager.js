let EventManager = {
    processCPF: 10000,
    eventHandler: {},
    eventQueue: [],
    addEventList: [],
    registerHandler: function (nEventID, pHandler) {
        let eventList = this.eventHandler[nEventID];
        if (eventList) {
            if (eventList.indexOf(pHandler) != -1) {
                return;
            }
            eventList.push(pHandler);
        }
        else {
            eventList = [];
            eventList.push(pHandler);
            this.eventHandler[nEventID] = eventList;
        }
    },
    removeHandler: function (nEventID, pHandler) {
        let eventList = this.eventHandler[nEventID];
        if (eventList != null) {
            let index = eventList.indexOf(pHandler);
            if(index == -1)
                return;
            eventList.splice(index, 1);
            if (eventList.length == 0) {
                delete this.eventHandler[nEventID];
            }
        }
    },
    removeAllHandler: function () {
        this.eventHandler = {};
    },
    setProcessCPF: function (nCPF) {
        this.processCPF = nCPF;
    },
    pushEvent: function (pEvent) {
        this.addEventList.push(pEvent);
    },

        processEvent: function () {
        this.AddEventToQueue();
        let nIndex = 0;
        while (this.eventQueue.length != 0) {
            let pEvent = this.eventQueue.shift();
            if (pEvent) {
                let eventID = pEvent['msg_id'];
                let eventList = this.eventHandler[eventID];
                if (eventList) {
                    for (let i = 0;i < eventList.length; i += 1) {
                        eventList[i].processEvent(pEvent);
                    }
                }
                pEvent = null;
                ++nIndex;
                if (nIndex == this.processCPF) {
                    break;
                }
            }
        }
    },
    AddEventToQueue: function () {
        if (this.addEventList.length <= 0) {
            return;
        }
        for (let i in this.addEventList) {
            this.eventQueue.push(this.addEventList[i]);
        }
        this.addEventList = [];
    }

};
module.exports = EventManager;