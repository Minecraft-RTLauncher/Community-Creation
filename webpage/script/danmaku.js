const danmakuTexts = [];
let danmakuInterval;

// 从JSON中读取弹幕
fetch("./script/danmakuList.json")
    .then(res => {
        if (!res.ok) throw new Error("Can't find danmakuList.json !");
        return res.json();
    })
    .then(data => danmakuTexts.push(...data.danmaku));

window.addEventListener("load", () => {
    const danmakuContainer = document.querySelector('.danmaku-container');
    let isPageVisible = true;

    // 页面可见性变化处理
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (isPageVisible) {
            startDanmaku();
            createInitialDanmaku();
        } else {
            clearInterval(danmakuInterval);
        }
    });

    function createDanmaku() {
        const danmaku = document.createElement("div");
        danmaku.className = "danmaku";
        danmaku.textContent = danmakuTexts[Math.floor(Math.random() * danmakuTexts.length)];

        // 轨道系统（每个轨道40px高度）
        const trackHeight = 40;
        const maxTracks = Math.floor((window.innerHeight - 50) / trackHeight); // 保留底部空间
        const track = Math.floor(Math.random() * maxTracks);
        danmaku.style.top = `${track * trackHeight}px`;

        // 更大速度差异（5-15秒）
       const duration = 10 + Math.random() * 15; // 改为更慢的速度
        danmaku.style.animationDuration = `${duration}s`;

        // 随机颜色
        const hue = Math.random() * 360;
        danmaku.style.color = `hsl(${hue}, 80%, 80%)`;

        danmakuContainer.appendChild(danmaku);

        // 动画结束后移除
        danmaku.addEventListener("animationend", () => {
            danmaku.remove();
        });
    }

    function startDanmaku() {
        clearInterval(danmakuInterval);
        // 调整生成间隔（2-4秒）
        danmakuInterval = setInterval(() => {
            if (isPageVisible && danmakuTexts.length > 0) createDanmaku();
        }, 2000 + Math.random() * 2000);
    }

    function createInitialDanmaku() {
        // 初始弹幕分散生成
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                if (danmakuTexts.length > 0) createDanmaku();
            }, i * 800); // 拉长初始间隔
        }
    }

    // 初始化启动
    startDanmaku();
    createInitialDanmaku();
});