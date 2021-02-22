(function(root){
    function Index(len){
        // 当前的索引值
        this.index = 0;
        // 数据的长度，用于做判断
        this.len = len;
    }
    Index.prototype = {
        // 获取上一个索引（上一首）
        prev: function(){
            // 切到上一首
            return this.get(-1); 
        },
        // 获取下一个索引（下一首）
        next: function(){
            // 切到下一首
            return this.get(1);
        },
        // 获取索引，参数为+1或-1 
        get: function(val){
            this.index = (this.index + val + this.len) % this.len;
            return this.index;
        }
    }

    // 把构造函数暴露出去，因为实例对象需要传参，所以实例对象不能暴露出去
    root.controlIndex = Index;
})(window.player || (window.player = {}));