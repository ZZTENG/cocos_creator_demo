cc.Class({
     extends: cc.ScrollView,
     properties: {

     },
         _startInertiaScroll: function(touchMoveVelocity) {
             var inertiaTotalMovement = cc.pMult(touchMoveVelocity, 1.5);
             this._startAttenuatingAutoScroll(inertiaTotalMovement, touchMoveVelocity);
         },
     });
