cc.Class({
             extends: cc.Button,
             properties: {
                 clip: {
                     default: null,
                     url: cc.AudioClip
                 },
             },
             _onTouchEnded: function (event) {
                 if (!this.interactable || !this.enabledInHierarchy) return;

                 if (this._pressed) {
                     cc.audioEngine.play(this.clip, false, 1);
                     cc.Component.EventHandler.emitEvents(this.clickEvents, event);
                     this.node.emit('click', this);
                 }
                 this._pressed = false;
                 this._updateState();
                 event.stopPropagation();
             },
         });
