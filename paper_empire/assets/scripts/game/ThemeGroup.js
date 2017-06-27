const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const NetManager = require('NetManager');
const DataSend = require('dataSend');
const Utils = require('utils')
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
                 roadSprite: [cc.SpriteFrame],
                 mainCity: cc.SpriteFrame,
                 viceCity: cc.SpriteFrame,
                 blockFrame: cc.SpriteFrame,
                 flagFrame: cc.SpriteFrame,
                 directFrame: [cc.SpriteFrame],
                 destFrame: cc.SpriteFrame

             },

             // use this for initialization
             onLoad: function () {

             },

             // called every frame, uncomment this function to activate update callback
             // update: function (dt) {

             // },
         });
