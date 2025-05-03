const danmakuTexts = [];

// 从JSON中读取弹幕
fetch("./script/danmakuList.json")
	.then(res => {
		if (!res.ok) {
			throw new Error("Can't find danmakuList.json !");
		}
		return res.json();
	})
	.then(data => {
		for (const text of data.danmaku) {
			danmakuTexts.push(text);
		}
	});

window.addEventListener("load", () => {
	const danmakuContainer = document.querySelector('.danmaku-container');

	function createDanmaku () {
		const danmaku = document.createElement("div");
		danmaku.className = "danmaku";
		danmaku.textContent = danmakuTexts[Math.floor(Math.random() * danmakuTexts.length)];

		// 随机设置弹幕的垂直位置
		const top = Math.random() * (window.innerHeight - 30);
		danmaku.style.top = `${top}px`;

		// 随机设置弹幕的速度（10-15秒）
		const duration = 10 + Math.random() * 5;
		danmaku.style.animationDuration = `${duration}s`;

		// 随机设置弹幕颜色
		const hue = Math.random() * 360;
		danmaku.style.color = `hsl(${hue}, 80%, 80%)`;

		danmakuContainer.appendChild(danmaku);

		// 动画结束后移除弹幕
		danmaku.addEventListener("animationend", () => {
			danmaku.remove();
		});
	}

	// 每隔1-3秒随机发送一条弹幕
	setInterval(() => {
		createDanmaku();
	}, 1000 + Math.random() * 2000);

	// 初始发送几条弹幕
	for (let i = 0; i < 5; i++) {
		setTimeout(createDanmaku, i * 500);
	}
});