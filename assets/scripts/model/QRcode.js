const QRCode = require('qrcode');
cc.Class({
    extends: cc.Component,

    properties: {
        headimg:cc.Sprite,
        p1:{
            default:"",
            visible:function(){return this.headimg}
        },
    },

    // use this for initialization
    onLoad: function() {
        var qrcode = new QRCode(-1, 1);
        qrcode.addData('http://www.lihang.info');
        qrcode.make();

        let ctx = this.node.getComponent(cc.Graphics);

        // compute tileW/tileH based on node width and height
        let tileW = parseInt(this.node.width / qrcode.getModuleCount());
        let tileH = parseInt(this.node.height / qrcode.getModuleCount());


        ctx.fillColor = cc.Color.BLACK;
        // draw in the Graphics
        for (let row = 0; row < qrcode.getModuleCount(); row++) {
            for (let col = 0; col < qrcode.getModuleCount(); col++) {
                if (qrcode.isDark(row, col)) {
                    ctx.rect(Math.round(col * tileW), Math.round(row * tileW), tileW, tileH);
                    ctx.fill();
                }
            }
        }

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});