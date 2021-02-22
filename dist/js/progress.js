(function (root) {
    // 进度条
    function Progress() {
        // 存储总时长
        this.durTime = 0;
        // 定时器
        this.frameId = null;
        // 开始播放的时间
        this.startTime = 0;
        // 暂停时已经移动的百分比
        this.lastPercent = 0;

        this.init();
    }

    Progress.prototype = {
        init: function () {
            this.getDom();
        },
        // 获取dom
        getDom: function () {
            this.curTime = document.querySelector(".curTime");
            this.totalTime = document.querySelector(".totalTime");
            this.circle = document.querySelector(".circle");
            this.frontBg = document.querySelector(".frontBg");
        },
        // 渲染总时长
        renderAllTime: function (time) {
            this.durTime = time; // 秒数

            time = this.formatTime(time);
            this.totalTime.innerHTML = time;
        },
        formatTime: function (time) {
            time = Math.round(time);
            // 分钟 向下取整
            var m = Math.floor(time / 60);
            // 秒钟
            var s = time % 60;
            m = m < 10 ? "0" + m : m;
            s = s < 10 ? "0" + s : s;
            return m + ":" + s;
        },
        // 移动进度条
        move: function (per) {
            cancelAnimationFrame(this.frameId);
            var _this = this;
            // 如果传入的per为0 就是从0开始 per决定了上一次走的百分比是否要清空，如果没有传参数表示不需要清空，如果传了参数表示要清空
            this.lastPercent = per === undefined ? this.lastPercent : per;
            // 记录按下的时间点
            this.startTime = new Date().getTime();
            function frame() {
                var curTime = new Date().getTime();
                // 移动的百分比
                var per =
                    _this.lastPercent +
                    (curTime - _this.startTime) / (_this.durTime * 1000);

                // 条件成立 说明当前歌曲还没播放完
                if (per <= 1) {
                    _this.update(per);
                } else {
                    // 播放完毕，停止播放（关闭定时器）
                    cancelAnimationFrame(_this.frameId);
                }
                _this.frameId = requestAnimationFrame(frame);
            }
            frame();
        },
        // 更新进度条(时间，移动的百分比)
        update: function (per) {
            // 更新左侧时间
            var time = this.formatTime(per * this.durTime);
            this.curTime.innerHTML = time;

            // 更新进度条的位置
            this.frontBg.style.width = per * 100 + "%";

            // 更新小圆点的位置
            var cl = per * this.circle.parentNode.offsetWidth;
            this.circle.style.transform = `translateX(${cl}px)`;
        },
        // 停止进度条
        stop: function () {
            cancelAnimationFrame(this.frameId);
            var stopTime = new Date().getTime();
            // 加上之前暂停播放的时长
            this.lastPercent +=
                (stopTime - this.startTime) / (this.durTime * 1000);
        },
    };

    // 实例化
    function instanceProgress() {
        return new Progress();
    }

    // 拖拽
    function Drag(obj) {
        // 要拖拽的DOM元素
        this.obj = obj;
        // 拖拽时按下的坐标位置
        this.startPointX = 0;
        // 按下时已经走的距离
        this.startLeft = 0;
        // 拖拽的百分比
        this.percent = 0;
    }

    Drag.prototype = {
        init: function () {
            var _this = this;
            this.frontBg = document.querySelector(".frontBg");

            this.obj.style.transform = "translateX(0)";
            // 拖拽开始
            this.obj.addEventListener("touchstart", function (e) {
                // changedTouches 触发当前事件的手指列表
                _this.startPointX = e.changedTouches[0].pageX;
                _this.startLeft = parseFloat(
                    this.style.transform.split("(")[1]
                );

                // 对外暴露拖拽开始的方法，按下后要做的事情就交给用户，它直接调用这个方法就好了
                _this.start && _this.start();
            });

            // 拖拽
            this.obj.addEventListener("touchmove", function (e) {
                // 拖拽的距离
                _this.disPointX = e.changedTouches[0].pageX - _this.startPointX;
                // 小圆点要走的距离
                var cl = _this.startLeft + _this.disPointX;
                if (cl < 0) {
                    cl = 0;
                } else if (cl > this.offsetParent.offsetWidth) {
                    cl = this.offsetParent.offsetWidth;
                }

                this.style.transform = `translateX(${cl}px)`;

                // 计算拖拽的百分比
                _this.percent = cl / this.offsetParent.offsetWidth;
                // 拖拽时进度条也跟着变化
                _this.frontBg.style.width = _this.percent * 100 + "%";
                //给用户留的一个方法，如果用户定义了，这个方法在这里会被调用
                _this.move && _this.move(_this.percent);

                e.preventDefault();
            });

            // 拖拽结束
            this.obj.addEventListener("touchend", function () {
                _this.end && _this.end(_this.percent);
            });
        },
    };

    // 实例化
    function instanceDrag(obj) {
        return new Drag(obj);
    }

    root.progress = {
        prog: instanceProgress,
        drag: instanceDrag,
    };
})(window.player || (window.player = {}));
