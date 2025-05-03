document.addEventListener('alpine:init', () => {
    Alpine.data('messageBoard', () => ({
        messages: [],
        isLoading: false,
        currentPage: 1,
        isSubmitting: false,
        captchaText: '',
        captchaSvg: '',  // 新增
        form: {
            username: '',
            qq: '',
            content: '',
            captcha: ''
        },

        init() {
            this.generateCaptcha();
        },

        async fetchMessages(initialLoad = false) {
            if (this.isLoading) return;

            this.isLoading = true;
            try {
                const page = initialLoad ? 1 : this.currentPage;
                const response = await fetch(`https://api.hellofurry.cn/rtl/get-msg-wall.php?page=${page}`);
                const data = await response.json();

                if (Array.isArray(data)) {
                    if (initialLoad) {
                        this.messages = data;
                        this.currentPage = 1;
                    } else {
                        this.messages = [...this.messages, ...data];
                    }

                    if (data.length > 0) {
                        this.currentPage++;
                    } else if (initialLoad) {
                        // 只有在初始加载且返回空数组时才显示"没有留言了"
                        this.showToast('没有留言了', 'info');
                    }
                }
            } catch (error) {
                console.error('获取留言失败:', error);
                // 只有在发生错误时才显示错误提示
                if (error instanceof TypeError || error instanceof SyntaxError) {
                    this.showToast('获取留言失败，请刷新重试', 'error');
                }
            } finally {
                this.isLoading = false;
            }
        },

        //验证码功能
        generateCaptcha() {
            // 生成6位随机字符，可自定义:)
            const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
            let captcha = '';
            for (let i = 0; i < 6; i++) {
                captcha += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            this.captchaText = captcha;

            const canvas = this.$refs.captchaCanvas;
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 绘制干扰线（3-5条）
            for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})`;
                ctx.lineWidth = Math.random() * 0.5 + 0.5;
                ctx.beginPath();
                ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.stroke();
            }

            // 绘制干扰点（30-50个）
            for (let i = 0; i < 30 + Math.floor(Math.random() * 20); i++) {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`;
                ctx.beginPath();
                ctx.arc(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 1.5,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            }

            // 绘制验证码文本
            for (let i = 0; i < captcha.length; i++) {
                const char = captcha.charAt(i);
                ctx.font = `${Math.floor(Math.random() * 6 + 18)}px Arial`;
                ctx.fillStyle = `hsl(${Math.random() * 60 + 100}, 80%, ${Math.random() * 20 + 60}%)`;

                const x = 15 + i * 15 + (Math.random() * 4 - 2);
                const y = 25 + (Math.random() * 8 - 4);

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((Math.random() * 30 - 15) * Math.PI / 180);

                ctx.fillText(char, 0, 0);
                ctx.restore();
            }

            // 添加波纹效果
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(
                    canvas.width / 2,
                    canvas.height / 2,
                    i * 10 + 5,
                    0,
                    2 * Math.PI
                );
                ctx.stroke();
            }
        },

        // 在 messageBoard() 数据对象中添加点赞方法
        likeMessage(message) {
            // 先更新本地UI
            if (!message.likes) message.likes = 0;
            message.likes++;

            // 发送点赞请求到后端
            this.sendLikeToBackend(message.id, message.likes);

            // 显示点赞动画和提示
            this.showToast('点赞成功', 'success');
            this.showHeartAnimation();
        },

        async submitMessage() {
            // 验证验证码 - 不区分大小写
            if (this.form.captcha.toLowerCase() !== this.captchaText.toLowerCase()) {
                this.showToast('验证码错误', 'error');
                this.generateCaptcha();
                return;
            }

            this.isSubmitting = true;
            try {
                const response = await fetch('https://api.hellofurry.cn/rtl/send-msg-wall.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.form.username,
                        qq: this.form.qq,
                        content: this.form.content
                    })
                });

                const result = await response.json();
                if (result.success) {
                    this.showToast('留言提交成功', 'success');
                    this.confetti();
                    this.form = { username: '', qq: '', content: '', captcha: '' };
                    this.generateCaptcha();
                    this.fetchMessages(true); // 刷新留言列表
                } else {
                    this.showToast(result.message || '提交失败', 'error');
                }
            } catch (error) {
                console.error('提交留言失败:', error);
                this.showToast('网络错误，请重试', 'error');
            } finally {
                this.isSubmitting = false;
            }
        },

        async sendLikeToBackend(messageId, likeCount) {
            try {
                //const response = await fetch('http://localhost:3000/public_html/rtl/json%E6%96%B9%E6%B3%95/like-msg-wall.php', {
                const response = await fetch('https://api.hellofurry.cn/rtl/like-msg-wall.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: messageId,
                        likes: likeCount
                    })
                });

                const result = await response.json();
                if (!result.success) {
                    console.error('点赞保存失败:', result.message);
                }
            } catch (error) {
                console.error('点赞请求失败:', error);
            }
        },

        showHeartAnimation() {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.className = 'absolute text-red-500 text-2xl animate-heart';
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.top = '0';

            const messageEl = document.querySelector(`[x-data] [x-text="${message.username}"]`).closest('div.bg-gray-800');
            messageEl.style.position = 'relative';
            messageEl.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 1000);
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        //setDefaultAvatar(event) {
        //    event.target.src = 'https://cdn.jsdelivr.net/gh/HelloFurry/CDN@latest/images/default_avatar.jpg';
        //},

        showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${type === 'success' ? 'bg-green-600' :
                type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                } animate-slide-up`;
            toast.textContent = message;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        confetti() {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4d7c0f', '#84cc16', '#ecfccb']
            });
        }
    }));
});

// 添加点赞动画
const style = document.createElement('style');
style.textContent = `
    @keyframes heart {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
    }
    .animate-heart {
        animation: heart 1s ease-out forwards;
    }
`;
document.head.appendChild(style);