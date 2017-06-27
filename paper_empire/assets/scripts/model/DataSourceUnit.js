/**
 * Created by Perry.Li on 2017/1/22.
 */

var DataSourceUnit = cc.Class({
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

                 bindFunc: {
                     default: null,
                     visible: false
                 },
                 clearElementFunc:{
                     default: null,
                     visible: false
                 },
                 getElementFunc:{
                     default: null,
                     visible: false
                 },
                 host:{
                     default: null,
                     visible: false
                 },
                 _data: null,
                 data: {
                     get: function () {
                         return this._data;
                     },
                     set: function (value) {
                         if (!value.length || value.length == 0)
                         {
                             if(this.clearElementFunc)
                                 this.clearElementFunc.call(this.host);
                         }
                         else
                         {
                             for (let i = 0;i < value.length;i += 1)
                             {
                                 let ele = null;
                                 if(this.getElementFunc)
                                     ele = this.getElementFunc.call(this.host, i);
                                 if(this.bindFunc)
                                     this.bindFunc.call(this.host, i, ele, value[i]);
                             }
                             this._data = value;
                         }

                     },
                     visible:false
                 }

             },



             // called every frame, uncomment this function to activate update callback
             // update: function (dt) {

             // },
         });

module.exports = DataSourceUnit;