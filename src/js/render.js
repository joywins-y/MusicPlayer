// 渲染功能：渲染图片、音乐信息、是否喜欢
;(function(root){
    // 渲染图片
    function renderImg(src){
        // 给body添加背景图片
        root.blurImg(src);
        var img = document.querySelector('.songImg img');
        img.src = src;
    }

    // 渲染音乐信息
    function renderInfo (data){
        var songInfoChilren = document.querySelector('.songInfo').children;
        // 歌名
        songInfoChilren[0].innerHTML = data.name;
        // 歌手
        songInfoChilren[1].innerHTML = data.singer;
    }

    // 渲染是否喜欢
    function renderIsLike(isLike){
        var lis = document.querySelectorAll('.control.c-1 li');
        lis[0].className = isLike ? 'liking' : '';
    }

    // data是请求过来的数据，必须给
    root.render = function(data){
        renderImg(data.image);
        renderInfo(data);
        renderIsLike(data.isLike);
    }
})(window.player || (window.player = {}));