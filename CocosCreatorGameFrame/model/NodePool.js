let NodePool = function () {
    /**
     * !#en The pool handler component, it could be the class name or the constructor.
     * !#zh 缓冲池处理组件，用于节点的回收和复用逻辑，这个属性可以是组件类名或组件的构造函数。
     * @property poolHandlerComp
     * @type {Function|String}
     */
    this._pool = {};
};
NodePool.prototype = {
    constructor: NodePool,

    /**
     * !#en The current available size in the pool
     * !#zh 获取当前缓冲池的可用对象数量
     * @method size
     */
    size: function (key) {
        let pool = this._pool;
        if(key)
        {
            pool = this._pool[key];
        }
        else
        {
            if (!this._pool[0])
                this._pool[0] = [];
            pool = this._pool[0];
        }
        return pool.length;
    },
    clearAll: function () {
        for (let i in this._pool) {
            this.clear(i);
        }
    },
    /**
     * !#en Destroy all cached nodes in the pool
     * !#zh 销毁对象池中缓存的所有节点
     * @method clear
     */
    clear: function (key) {
        let pool = this._pool;
        if(key)
        {
            pool = this._pool[key];
        }
        else
        {
            if (!this._pool[0])
                this._pool[0] = [];
            pool = this._pool[0];
        }
        if(pool instanceof Array){
            for(let i = 0;i < pool.length;i += 1){
                pool[i].destroy();
            }
        }
        else {
            if(pool instanceof Object) {
                for (let i in pool) {
                    pool[i].destroy();
                }
            }
        }
        if(key) {
            delete this._pool[key];
        }
    },

    /**
     * !#en Put a new Node into the pool.
     * It will automatically remove the node from its parent without cleanup.
     * It will also invoke unuse method of the poolHandlerComp if exist.
     * !#zh 向缓冲池中存入一个不再需要的节点对象。
     * 这个函数会自动将目标节点从父节点上移除，但是不会进行 cleanup 操作。
     * 这个函数会调用 poolHandlerComp 的 unuse 函数，如果组件和函数都存在的话。
     * @method put
     * @example
     *   let myNode = cc.instantiate(this.template);
     *   this.myPool.put(myNode);
     */
    put: function (obj, key) {
        if (obj)
        {
            let pool = this._pool;
            if(key)
            {
                if (!this._pool[key])
                {
                    this._pool[key] = [];
                }
                pool = this._pool[key];
            }
            else
            {
                if (!this._pool[0])
                    this._pool[0] = [];
                pool = this._pool[0];
            }
            let index = pool.indexOf(obj);
            if(index != -1) {
                pool.splice(index, 1);
            }
            // Remove from parent, but don't cleanup
            obj.removeFromParent(false);
            for (let i in obj._components) {
                if (obj._components[i].unuse) {
                    obj._components[i].unuse();
                }
            }
            pool.push(obj);
        }
    },

    /**
     * !#en Get a obj from pool, if no available object in pool, null will be returned.
     * This function will invoke the reuse function of poolHandlerComp if exist.
     * !#zh 获取对象池中的对象，如果对象池没有可用对象，则返回空。
     * 这个函数会调用 poolHandlerComp 的 reuse 函数，如果组件和函数都存在的话。
     * @method get
     * @param {any} params - !#en Params to pass to 'reuse' method in poolHandlerComp !#zh 向 poolHandlerComp 中的 'reuse' 函数传递的参数
     * @return {Object|null}
     * @example
     *   let newNode = this.myPool.get();
     */
    get: function (key) {
        let pool = this._pool;
        if(key)
        {
            pool = this._pool[key];
            if (!pool)
                return null;
        }
        else
        {
            if (!this._pool[0])
                this._pool[0] = [];
            pool = this._pool[0];
        }
        // Pop the last object in pool
        let obj = pool.pop();
        if(obj) {
            // Invoke pool handler
            for (let i in obj._components) {
                if (obj._components[i].reuse) {
                    obj._components[i].reuse.apply(obj._components[i], arguments);
                }
            }
        }
        return obj;
    }
};

module.exports = NodePool;