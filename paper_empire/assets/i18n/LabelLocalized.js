const i18n = require('i18n');
cc.Class({
    extends: cc.Label,

    properties: {
        textKey: {
            default: 'TEXT_KEY',
            multiline: true,
            tooltip: '输入 i18n 关键字，文本在assets/i18n/data里面，代码中不允许修改这个值，仅在编辑器中使用',
            notify: function (value) {
                this.string = i18n.t(this.textKey);
                if (this._sgNode) {
                    this._sgNode.setString(this.string);
                    this._updateNodeSize();
                }
            }
        },
        string: {
            override: true,
            readonly:true,
            get:function () {
                if (this._sgNode) {
                    return this._sgNode.getString();
                }
                return i18n.t(this.textKey);
            },
            set:function (value) {
                if (this._sgNode) {
                    this._sgNode.setString(value);
                    this._updateNodeSize();
                }
            }
        }

    }
});
