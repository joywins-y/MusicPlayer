(function ($, player) {
    function MusicPlayer(dom) {
        // 音乐播放器的容器（用于加载ListControl模块）
        this.wrap = dom;
        // 存储请求到的数据
        this.dataList = [];
        // 歌曲的索引
        // this.now = 0;
        // 旋转唱片的定时器
        this.rotateTimer = null;
        // 索引值对象（用于切歌）
        this.indexObj = null;
        // 当前播放歌曲的索引值
        this.curIndex = 0;
        // 列表切歌对象（在listPlay中已赋值）
        this.list = null;
        // 实例化进度条的组件
        this.progress = player.progress.prog();
    }
    MusicPlayer.prototype = {
        // 初始化
        init() {
            this.getDom();
            this.getData("../mock/data.json");
            this.others();
        },
        // 获取页面里的元素
        getDom() {
            // 旋转图片
            this.record = document.querySelector(".songImg img");
            // 底部导航栏里的按钮
            this.controlBtns1 = document.querySelectorAll(".control.c-1 li");
            this.controlBtns2 = document.querySelectorAll(".control.c-2 li");
        },
        // 获取请求数据
        getData(url) {
            var _this = this;
            $.ajax({
                url: url,
                method: "get",
                success: function (data) {
                    // 存储请求过来的数据
                    _this.dataList = data;
                    // 列表切歌，放在loadMusic的前面，因为this.list对象是在这个方法里声明的，要在loadMusic里使用
                    _this.listPlay();
                    // 给索引值对象赋值
                    _this.indexObj = new player.controlIndex(data.length);
                    // 加载音乐
                    // _this.loadMusic(_this.now);
                    _this.loadMusic(_this.indexObj.index);
                    // 添加音乐操作功能
                    _this.musicControl();
                    // 添加拖拽进度条的功能
                    _this.dragProgress();
                },
                error: function () {
                    console.log("数据请求失败");
                },
            });
        },
        // 加载音乐
        loadMusic(index) {
            var _this = this;
            // 渲染图片 歌曲信息
            player.render(this.dataList[index]);
            player.music.load(this.dataList[index].audioSrc);
            
            // 加载时长
            this.progress.renderAllTime(this.dataList[index].duration);
            
            // 播放音乐（只有音乐的状态为play的时候才能播放）
            if (player.music.status === "play") {
                player.music.play();
                // 按钮状态变成播放状态
                this.controlBtns2[2].className = "playing";
                // 旋转图片
                this.imgRotate(0);
                // 切歌时直接让进度条加载
                this.progress.move(0);
            }
            // 改变列表里歌曲的选择状态
            this.list.changeSelect(index);
            // 存储当前歌曲对应的索引值
            this.curIndex = index;
            // 歌曲播放完毕切歌
            player.music.end(function(){
                _this.loadMusic(_this.indexObj.next());
            })
        },
        // 控制音乐 上一首、下一首...
        musicControl() {
            var _this = this;
            // 上一首
            this.controlBtns2[1].addEventListener("touchend", function () {
                player.music.status = "play";
                // _this.now --;
                // _this.loadMusic(--_this.now);
                _this.loadMusic(_this.indexObj.prev());
            });

            // 播放、暂停
            this.controlBtns2[2].addEventListener("touchend", function () {
                // 歌曲的状态为播放，点击后要暂停
                if (player.music.status === "play") {
                    // 歌曲暂停
                    player.music.pause();
                    // 按钮变成暂停状态
                    this.className = "";
                    // 停止旋转图片
                    _this.imgStop();
                    // 停止进度条移动
                    _this.progress.stop();
                } else {
                    // 歌曲的状态为暂停，点击后要播放
                    // 播放歌曲
                    player.music.play();
                    // 按钮变成播放状态
                    this.className = "playing";
                    // 第二次播放的时候需要加上上一次旋转的角度。但是第一次的时候这个角度是没有的，取不到。所以做了一个容错处理
                    var deg = _this.record.dataset.rotate || 0;
                    // 旋转图片
                    _this.imgRotate(deg);
                    // 加载进度条 移动
                    _this.progress.move();
                }
            });

            // 下一首
            this.controlBtns2[3].addEventListener("touchend", function () {
                player.music.status = "play";
                // _this.loadMusic(++_this.now);
                _this.loadMusic(_this.indexObj.next());
            });
        },
        // 旋转唱片
        imgRotate(deg) {
            var _this = this;
            clearInterval(this.rotateTimer);
            this.rotateTimer = setInterval(function () {
                // 前面的加号是把字符串转为数字
                deg = +deg + 0.2;
                _this.record.style.transform = `rotate(${deg}deg)`;
                // 把旋转的角度存到标签身上，为了暂停后继续播放能取到
                _this.record.dataset.rotate = deg;
            }, 1000 / 60);
        },
        // 停止旋转
        imgStop() {
            clearInterval(this.rotateTimer);
        },
        // 列表切歌
        listPlay: function () {
            var _this = this;
            var flag = false;
            // this.list = player.listControl(this.dataList, this.wrap);
            this.list = player.listControl(this.dataList, this.wrap);
            // 列表按钮添加点击事件
            this.controlBtns2[4].addEventListener("touchend", function (e) {
                // 让列表显示出来
                if(!flag){
                    _this.list.slideUp();
                    flag = true;
                }else{
                    _this.list.slideDown();
                    flag = false;
                }
                
                e.cancelBubble || e.stopPropagation();

                _this.wrap.addEventListener("touchend", function (e) {
                    if(e.target === this){
                        _this.list.slideDown();
                        flag = false;
                    }
                })
            });
            console.log(this);
            // 歌曲列表添加事件
            this.list.musicList.forEach(function (item, index) {
                item.addEventListener("touchend", function () {
                    // 如果点击的是当前的那首歌，不管它是播放还是暂停都无效
                    if (_this.curIndex === index) {
                        return;
                    }
                    // 歌曲要变成播放状态
                    player.music.status = "play";
                    // 索引值对象身上的当前索引值要更新
                    _this.indexObj.index = index;
                    // 加载点击对应的索引值的那首歌曲
                    _this.loadMusic(index);
                    // 列表消失
                    _this.list.slideDown();
                });
            });
        },
        // 进度条拖拽
        dragProgress: function(){
            var _this = this;
            var circle = player.progress.drag(document.querySelector('.circle'));
            circle.init();
            // 按下圆点
            circle.start = function(){
                _this.progress.stop();
            }
            // 拖拽圆点
            circle.move = function(per){
                _this.progress.update(per);
            }
            // 结束拖拽
            circle.end = function(per){
                var cutTime = per * _this.dataList[_this.indexObj.index].duration;
               // 把歌曲的时间定位到对应的时间
                player.music.playTo(cutTime);
                // 播放歌曲
                player.music.play();
                // 进度条走到对应的位置
                _this.progress.move(per);
                // 旋转图片
                var deg = _this.record.dataset.rotate || 0;
                _this.imgRotate(deg);
                _this.controlBtns2[2].className = 'playing';
                
                // 拖拽到最后一秒时进行切歌
                if(cutTime == _this.dataList[_this.indexObj.index].duration){
                    player.music.status = 'play';
                    _this.loadMusic(_this.indexObj.next());
                }
            }
        },
        others: function(){
            var _this = this;
            this.controlBtns1[0].addEventListener('touchend', function(){
                var isLike = _this.controlBtns1[0].className;
                if(isLike === ''){
                    _this.controlBtns1[0].className = 'liking';
                }else{
                    _this.controlBtns1[0].className = '';
                }
            })
        }
    };

    var musicPlayer = new MusicPlayer(document.getElementById("wrap"));
    musicPlayer.init();
})(window.Zepto, window.player || (window.player = {}));
