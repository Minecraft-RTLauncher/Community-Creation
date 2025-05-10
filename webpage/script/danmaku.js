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
	const danmakuForm = document.getElementById('danmaku-form');
	const danmakuInput = document.getElementById('danmaku-input');

	function createDanmaku(text) {
		const danmaku = document.createElement("div");
		danmaku.className = "danmaku";
		danmaku.textContent = text || danmakuTexts[Math.floor(Math.random() * danmakuTexts.length)];

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

	// 处理弹幕表单提交
	if (danmakuForm) {
		danmakuForm.addEventListener('submit', function(e) {
			e.preventDefault();
			
			const danmakuText = danmakuInput.value.trim();
			if (danmakuText) {
				// 创建并显示新弹幕
				createDanmaku(danmakuText);
				
				// 存储新弹幕
				storeDanmaku(danmakuText);
				
				// 清空输入框
				danmakuInput.value = '';
			}
		});
	}

	// 存储弹幕到服务器/本地
	function storeDanmaku(text) {
		// 将新弹幕添加到本地数组
		danmakuTexts.push(text);
		
		// 创建要发送的数据
		const data = {
			danmaku: text
		};
		
		// 使用 localStorage 临时存储发送过的弹幕
		const storedDanmaku = JSON.parse(localStorage.getItem('userDanmaku') || '[]');
		storedDanmaku.push(text);
		localStorage.setItem('userDanmaku', JSON.stringify(storedDanmaku));
		
		// 尝试发送到服务器存储
		// 注意：这里使用 fetch API 发送数据到服务器
		// 如果没有后端服务，这个请求会失败，但不会影响用户体验
		fetch('./script/saveDanmaku.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data)
		}).catch(error => {
			console.log('保存弹幕到服务器失败，已存储在本地:', error);
		});
	}

	// 加载本地存储的弹幕
	function loadLocalDanmaku() {
		const storedDanmaku = JSON.parse(localStorage.getItem('userDanmaku') || '[]');
		storedDanmaku.forEach(text => {
			if (!danmakuTexts.includes(text)) {
				danmakuTexts.push(text);
			}
		});
	}
	
	// 加载本地存储的弹幕
	loadLocalDanmaku();

	// 每隔1-3秒随机发送一条弹幕
	setInterval(() => {
		createDanmaku();
	}, 1000 + Math.random() * 2000);

	// 初始发送几条弹幕
	for (let i = 0; i < 5; i++) {
		setTimeout(createDanmaku, i * 500);
	}
});
