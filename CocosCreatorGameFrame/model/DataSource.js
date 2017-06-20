var DataSourceUnit = require('DataSourceUnit');
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
        _dataSourceList:[],
        size:  1,
    },
    setSize: function (size) {
        for(var i = 0;i < this._dataSourceList.length;i += 1)
        {
            delete this._dataSourceList[i];
            this._dataSourceList[i] = null;
        }
        this._dataSourceList = [];
        for(var i = 0 ; i < size; ++i)
        {
            var unit = new DataSourceUnit();
            this._dataSourceList.push(unit);
        }
    },
    getUnit: function(index)
    {
        if(this._dataSourceList.length == 0)
        {
            this.setSize(this.size);
        }
        if(index && index < this._dataSourceList.length)
        {
            return this._dataSourceList[index];
        }
        else
        {
            return this._dataSourceList[0];
        }
    },
    // use this for initialization
    onLoad: function () {
        if(this._dataSourceList.length == 0)
        {
            this.setSize(this.size);
        }
    },
    onDestroy:function () {
        for(var i  = 0; i < this._dataSourceList.length;i += 1)
        {
            delete this._dataSourceList[i];
            this._dataSourceList[i] = null;
        }
        this._dataSourceList = [];
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
