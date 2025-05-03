window.addEventListener("load", () => {
	// 设置画布
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	canvas.style.position = "fixed";
	canvas.style.top = "0";
	canvas.style.left = "0";
	canvas.style.zIndex = "1";
	document.body.appendChild(canvas);

	const mouse = {
		x: null,
		y: null,
		radius: 75
	};

	const PARTICLE_COUNT = Math.floor(window.innerWidth * window.innerHeight / 7680);
	let particles = [];

	const baseSpeedRate = window.innerWidth / 1280 / 2;

	window.addEventListener("mousemove", function (event) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	});

	// 设置发射效果
	window.addEventListener("click", function (event) {
		const clickX = event.clientX;
		const clickY = event.clientY;

		// 四向发射粒子
		const dx = Math.random();
		const dy = Math.random();
		particles.push(new Particle(clickX + dx, clickY + dy));
		particles.push(new Particle(clickX + dx, clickY - dy));
		particles.push(new Particle(clickX - dx, clickY + dy));
		particles.push(new Particle(clickX - dx, clickY - dy));

		// 随机移除粒子
		const removeCount = Math.min(
			Math.floor(Math.random() * 4) + 2,
			particles.length - 1
		);

		for (let i = 0; i < removeCount; i++) {
			const randomIndex = Math.floor(Math.random() * particles.length);
			particles.splice(randomIndex, 1);
		}
	});

	function resizeCanvas () {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	// 实时同步大小
	window.addEventListener("resize", resizeCanvas);
	resizeCanvas();

	class Particle {
		// 构建粒子
		constructor (x, y) {
			this.x = x !== undefined ? x : Math.random() * canvas.width;
			this.y = y !== undefined ? y : Math.random() * canvas.height;
			this.radius = Math.random() * 2;
			this.baseSpeed = Math.random() * baseSpeedRate + 0.2;
			this.speed = this.baseSpeed;
			this.angle = Math.random() * Math.PI * 2;
		}

		update () {
			const dx = mouse.x - this.x;
			const dy = mouse.y - this.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < mouse.radius && mouse.x && mouse.y) {
				// 鼠标避让
				const avoidAngle = Math.atan2(dy, dx);
				this.speed = this.baseSpeed * 3;
				this.angle = avoidAngle + Math.PI; // 加π表示相反方向
			} else {
				// 恢复正常运动
				this.speed = this.baseSpeed;
				this.angle += (Math.random() - 0.5) * 0.1;
			}

			this.x += Math.cos(this.angle) * this.speed;
			this.y += Math.sin(this.angle) * this.speed;

			if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
				this.reset();
			}
		}

		draw () {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(255,255,255,${2 * (1 - this.radius / 2)})`;
			ctx.fill();
		}

		reset () {
			this.x = Math.random() * canvas.width;
			this.y = Math.random() * canvas.height;
			this.angle = Math.random() * Math.PI * 2;
		}
	}

	function initParticles () {
		particles = Array.from({length: PARTICLE_COUNT}, () => new Particle());
	}

	function animate () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		particles.forEach(p => {
			p.update();
			p.draw();
		});
		requestAnimationFrame(animate);
	}

	initParticles();
	animate();
});