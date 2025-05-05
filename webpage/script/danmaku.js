// 弹幕文本数组
const danmakuTexts = [
  "RTLauncher启动器欢迎您!",
  "暑期即将发布!",
  "敬请期待~",
  "加入我们的社区!",
  "RTLauncher启动器",
  "Hello World!",
  "你好，世界！",
  "期待与你相遇!",
  "欢迎加入QQ群!",
  "qiang_di向您致意",
  "加入Discord社区!",
  "Twisuki喵~♡",
  "Aria~"
];

// 页面加载完成后初始化弹幕系统
window.addEventListener("load", () => {
  const danmakuContainer = document.querySelector('.danmaku-container');
  
  // 检查弹幕容器是否存在
  if (!danmakuContainer) {
    console.error("找不到弹幕容器元素，请检查HTML中是否有class为'danmaku-container'的div");
    return;
  }
  
  // 检查弹幕文本是否加载
  if (danmakuTexts.length === 0) {
    console.warn("弹幕文本为空，请检查JSON文件");
    // 添加一些默认弹幕，以防JSON加载失败
    danmakuTexts.push("RTLauncher启动器", "欢迎使用", "Hello World!");
  }

  // 创建弹幕函数
  function createDanmaku() {
    // 如果没有弹幕文本，则不创建
    if (danmakuTexts.length === 0) return;
    
    // 创建弹幕元素
    const danmaku = document.createElement("div");
    danmaku.className = "danmaku";
    
    // 随机选择弹幕文本
    danmaku.textContent = danmakuTexts[Math.floor(Math.random() * danmakuTexts.length)];
    
    // 随机设置弹幕位置（垂直方向）
    const top = Math.random() * (window.innerHeight - 30);
    danmaku.style.top = `${top}px`;
    
    // 随机设置弹幕动画持续时间
    const duration = 10 + Math.random() * 5;
    danmaku.style.animationDuration = `${duration}s`;
    
    // 随机设置弹幕颜色
    const hue = Math.random() * 360;
    danmaku.style.color = `hsl(${hue}, 80%, 80%)`;
    
    // 将弹幕添加到容器中
    danmakuContainer.appendChild(danmaku);
    
    // 动画结束后移除弹幕元素
    danmaku.addEventListener("animationend", () => {
      danmaku.remove();
    });
    
    // 调试信息
    console.log("创建弹幕:", danmaku.textContent);
  }

  // 定时创建弹幕
  setInterval(() => {
    createDanmaku();
  }, 1000 + Math.random() * 2000);

  // 初始创建几个弹幕
  console.log("初始化弹幕系统...");
  for (let i = 0; i < 5; i++) {
    setTimeout(createDanmaku, i * 500);
  }
});