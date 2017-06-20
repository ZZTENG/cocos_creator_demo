cc.Class({
             extends: cc.Widget,
             editor: CC_EDITOR && {
                 menu: 'i18n:MAIN_MENU.component.ui/Widget',
                 help: 'i18n:COMPONENT.help_url.widget',
                 inspector: 'packages://inspector/inspectors/comps/ccwidget.js',
                 executeInEditMode: true,
                 disallowMultiple: true,
             },
             properties: {
                alignCanvasNode: true
             },
             onLoad: function() {
                 if(!CC_EDITOR && !this._target && this.alignCanvasNode)
                 {
                     this._target = cc.director.getScene().getChildByName('Canvas');
                     let size = this._target.getComponent(cc.Canvas).designResolution ;
                     if(this.isAlignLeft)
                        this.left = size.width * 0.5+ this._left;
                     if(this.isAlignRight)
                        this.right = size.width * 0.5 + this._right;
                     if(this.isAlignTop)
                        this.top = size.height * 0.5 + this._top;
                     if(this.isAlignBottom)
                        this.bottom = size.height * 0.5 + this._bottom;

                 }
             },
         });
