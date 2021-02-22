(function (root){
    function AudioManage(){
        // 创建一个audio实例
        this.audio = new Audio();
        // 歌曲的状态，默认为暂停
        this.status = 'pause';
    }

    AudioManage.prototype = {
        // 加载音乐
        load(src){
            // 设置音乐的路径
            this.audio.src = src;
            // 加载音乐
            this.audio.load();
        },
        // 播放音乐
        play(){
            this.audio.play();
            this.status = 'play';
        },
        // 暂停音乐
        pause(){
            this.audio.pause();
            this.status = 'pause';
        },
        // 音乐播放完成事件
        end(fn){
            this.audio.onended = fn;
        },
        // 跳到音乐的某个时间点
        playTo(time){
            // 单位为秒
            this.audio.currentTime = time;
        }
    }

    // 把实例对象暴露出去
    root.music = new AudioManage();
})(window.player || (window.player = {}));