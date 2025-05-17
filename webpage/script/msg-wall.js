//2025年5月10日 程序格式化代码

//版权显示
/* 样式代码 */
var styleTitle1 = `
font-size: 20px;
font-weight: 600;
color: rgb(244,167,89);
`
var styleTitle2 = `
font-style: oblique;
font-size:14px;
color: rgb(244,167,89);
font-weight: 400;
`
var styleContent = `
color: rgb(30,152,255);
`

/* 内容代码 */
var title1 = 'RTL'
var title2 = '留言板'
var content = `
版 本 号：20250510070340
版本日期：2025年5月10日07:03:40
样式表版本：20250510073126

RTL保留对此板块信息的最终解释权.
 
官网:  https://www.rsdaily.com/
`
console.log(`%c${title1} %c${title2}
%c${content}`, styleTitle1, styleTitle2, styleContent)

//版权信息结束

document.addEventListener("alpine:init", () => {
    Alpine.data("messageBoard", () => ({
        // API 配置变量
        apiConfig: {
            //baseUrl: "http://localhost:3000/",
            baseUrl: "https://api.hellofurry.cn/rtl/",
            endpoints: {
                getMessages: "get-msg-wall.php",
                sendMessage: "send-msg-wall.php",
                likeMessage: "like-msg-wall.php",
            },
        },
        messages: [],
        isLoading: !1,
        currentPage: 1,
        isSubmitting: !1,
        captchaText: "",
        captchaSvg: "",
        form: {
            username: "",
            qq: "",
            content: "",
            captcha: "",
        },
        init() {
            this.generateCaptcha();
        },
        async fetchMessages(t = !1) {
            if (!this.isLoading) {
                this.isLoading = !0;
                try {
                    const e = t ? 1 : this.currentPage,
                        // 使用组合后的API地址
                        a = await fetch(
                            `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.getMessages}?page=${e}`,
                        ),
                        s = await a.json();
                    if (Array.isArray(s)) {
                        // 新增：随机排序函数
                        const shuffleArray = (array) => {
                            for (let i = array.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [array[i], array[j]] = [array[j], array[i]];
                            }
                            return array;
                        };

                        const shuffledMessages = shuffleArray(s);

                        t
                            ? ((this.messages = shuffledMessages), (this.currentPage = 1))
                            : (this.messages = [...this.messages, ...shuffledMessages]);
                        shuffledMessages.length > 0
                            ? this.currentPage++
                            : t && this.showToast("没有留言了", "info");
                    }
                } catch (t) {
                    console.error("获取留言失败:", t),
                        (t instanceof TypeError || t instanceof SyntaxError) &&
                        this.showToast("获取留言失败，请刷新重试", "error");
                } finally {
                    this.isLoading = !1;
                }
            }
        },
        generateCaptcha() {
            const t = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
            let e = "";
            for (let a = 0; a < 6; a++)
                e += t.charAt(Math.floor(Math.random() * t.length));
            this.captchaText = e;
            const a = this.$refs.captchaCanvas,
                s = a.getContext("2d");
            s.clearRect(0, 0, a.width, a.height),
                (s.fillStyle = "#1a1a1a"),
                s.fillRect(0, 0, a.width, a.height);
            for (let t = 0; t < 3 + Math.floor(3 * Math.random()); t++)
                (s.strokeStyle = `rgba(255, 255, 255, ${0.3 * Math.random() + 0.2})`),
                    (s.lineWidth = 0.5 * Math.random() + 0.5),
                    s.beginPath(),
                    s.moveTo(Math.random() * a.width, Math.random() * a.height),
                    s.lineTo(Math.random() * a.width, Math.random() * a.height),
                    s.stroke();
            for (let t = 0; t < 30 + Math.floor(20 * Math.random()); t++)
                (s.fillStyle = `rgba(255, 255, 255, ${0.2 * Math.random() + 0.1})`),
                    s.beginPath(),
                    s.arc(
                        Math.random() * a.width,
                        Math.random() * a.height,
                        1.5 * Math.random(),
                        0,
                        2 * Math.PI,
                    ),
                    s.fill();
            for (let t = 0; t < e.length; t++) {
                const a = e.charAt(t);
                (s.font = `${Math.floor(6 * Math.random() + 18)}px Arial`),
                    (s.fillStyle = `hsl(${60 * Math.random() + 100}, 80%, ${20 * Math.random() + 60}%)`);
                const o = 15 + 15 * t + (4 * Math.random() - 2),
                    i = 8 * Math.random() - 4 + 25;
                s.save(),
                    s.translate(o, i),
                    s.rotate(((30 * Math.random() - 15) * Math.PI) / 180),
                    s.fillText(a, 0, 0),
                    s.restore();
            }
            (s.strokeStyle = "rgba(255, 255, 255, 0.05)"), (s.lineWidth = 2);
            for (let t = 0; t < 3; t++)
                s.beginPath(),
                    s.arc(a.width / 2, a.height / 2, 10 * t + 5, 0, 2 * Math.PI),
                    s.stroke();
        },
        likeMessage(t) {
            t.likes || (t.likes = 0),
                t.likes++,
                this.sendLikeToBackend(t.id, t.likes),
                this.showToast("点赞成功", "success"),
                this.showHeartAnimation();
            this.$refs.likeBtn.animate(
                [
                    {
                        transform: "rotate(0deg) scale(1)",
                    },
                    {
                        transform: "rotate(-15deg) scale(1.2)",
                    },
                    {
                        transform: "rotate(15deg) scale(1.4)",
                    },
                    {
                        transform: "rotate(0deg) scale(1)",
                    },
                ],
                {
                    duration: 600,
                },
            );

            confetti({
                particleCount: 8,
                spread: 30,
                origin: {
                    x: event.clientX / window.innerWidth,
                    y: event.clientY / window.innerHeight,
                },
            });
        },
        async submitMessage() {
            // 验证码检查
            if (this.form.captcha.toLowerCase() !== this.captchaText.toLowerCase()) {
                this.showToast("验证码错误", "error");
                this.generateCaptcha();
                return;
            }

            this.isSubmitting = true;
            try {
                // 显示请求日志
                console.log("Submitting message:", {
                    username: this.form.username,
                    qq: this.form.qq,
                    content: this.form.content
                });

                const response = await fetch(
                    `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.sendMessage}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            username: this.form.username,
                            qq: this.form.qq,
                            content: this.form.content,
                        }),
                    }
                );

                // 记录原始响应
                console.log("Raw response:", response);

                // 检查HTTP状态码
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                }

                const data = await response.json();
                console.log("Parsed data:", data);

                // 检查响应数据结构
                if (!data) {
                    throw new Error("服务器返回了空响应");
                }

                if (data.success) {
                    this.showToast("留言提交成功", "success");
                    this.confetti();
                    // 重置表单
                    this.form = {
                        username: "",
                        qq: "",
                        content: "",
                        captcha: "",
                    };
                    this.generateCaptcha();
                    // 刷新留言列表
                    this.fetchMessages(true);
                } else {
                    // 处理业务逻辑错误
                    const errorMsg = data.error || data.message || "提交失败，未知错误";
                    throw new Error(errorMsg);
                }
            } catch (error) {
                console.error("提交留言失败:", error);
                let errorMsg = "网络错误，请重试";

                // 更详细的错误信息
                if (error instanceof TypeError) {
                    errorMsg = "网络请求失败，请检查连接";
                } else if (error instanceof SyntaxError) {
                    errorMsg = "服务器返回了无效数据";
                } else if (error.message.includes("HTTP error")) {
                    errorMsg = `服务器错误: ${error.message}`;
                } else if (error.message) {
                    errorMsg = error.message;
                }

                this.showToast(errorMsg, "error");
                this.generateCaptcha();
            } finally {
                this.isSubmitting = false;
            }
        },

        async sendLikeToBackend(t, e) {
            try {
                const a = await fetch(
                    `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.likeMessage}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id: t,
                            likes: e,
                        }),
                    },
                ),
                    s = await a.json();
                s.success || console.error("点赞保存失败:", s.message);
            } catch (t) {
                console.error("点赞请求失败:", t);
            }
        },
        showHeartAnimation() {
            const t = document.createElement("div");
            (t.innerHTML = "❤️"),
                (t.className = "absolute text-red-500 text-2xl animate-heart"),
                (t.style.left = `${100 * Math.random()}%`),
                (t.style.top = "0");
            const e = document
                .querySelector(`[x-data] [x-text="${message.username}"]`)
                .closest("div.bg-gray-800");
            (e.style.position = "relative"),
                e.appendChild(t),
                setTimeout(() => {
                    t.remove();
                }, 1e3);
        },
        formatDate: (t) =>
            new Date(t).toLocaleString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }),
        showToast(t, e = "info") {
            const colors = {
                success: "linear-gradient(145deg, rgba(165, 165, 165, 0.9), rgba(165, 165, 165, 0.9))", 
                error: "linear-gradient(145deg, rgba(239, 68, 68, 0.9), rgba(239, 68, 68, 0.9))", 
                info: "rgba(255, 255, 255, 0.15)"
            };

            const textColors = {
                success: "#f0fdf4",
                error: "#fef2f2",
                info: "rgba(255, 255, 255, 0.9)"
            };

            const a = document.createElement("div");
            a.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg backdrop-blur-sm`;
            a.style.background = colors[e];
            a.style.color = textColors[e];
            a.style.border = "1px solid rgba(255, 255, 255, 0.1)";
            a.textContent = t;
            document.body.appendChild(a);
            setTimeout(() => {
                a.classList.add("opacity-0", "transition-opacity", "duration-300");
                setTimeout(() => a.remove(), 300);
            }, 3000);
        },
        confetti() {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: {
                    y: 0.6,
                },
                colors: ["#4d7c0f", "#84cc16", "#ecfccb"],
            });
        },
        // 新增：显示举报对话框
        showReportDialog(messageId) {
            Swal.fire({
                title: '举报留言',
                html: `
                    <input id="swal-input1" class="swal2-input" placeholder="请输入举报原因">
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const reason = document.getElementById('swal-input1').value;
                    if (!reason) {
                        Swal.showValidationMessage('请输入举报原因');
                    }
                    return { reason };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const data = {
                        message_id: messageId,
                        reason: result.value.reason
                    };

                    fetch('https://api.hellofurry.cn/rtl/report-msg-wall.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                Swal.fire('成功', '举报已记录', 'success');
                            } else {
                                Swal.fire('失败', data.error, 'error');
                            }
                        })
                        .catch(_error => {
                            Swal.fire('错误', '举报请求失败', 'error');
                        });
                }
            });
        },
        // 新增：提交举报请求
        async submitReport(messageId, reason) {
            try {
                const response = await fetch(`${this.apiConfig.baseUrl}report-msg-wall.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message_id: messageId,
                        reason: reason || ''
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '举报失败');
                }

                this.showToast("举报已提交，感谢您的反馈！", "success");
                // 更新本地数据
                this.messages = this.messages.map(msg => {
                    if (msg.id === messageId) {
                        return { ...msg, report_count: (msg.report_count || 0) + 1 };
                    }
                    return msg;
                });
            } catch (error) {
                this.showToast(`举报失败: ${error.message}`, "error");
            }
        },
    }));
});
const style = document.createElement("style");
(style.textContent =
    "\n    @keyframes heart {\n        0% { transform: translateY(0) scale(1); opacity: 1; }\n        100% { transform: translateY(-100px) scale(1.5); opacity: 0; }\n    }\n    .animate-heart {\n        animation: heart 1s ease-out forwards;\n    }\n"),
    document.head.appendChild(style);
// 在留言卡片创建时添加以下代码
const items = document.querySelectorAll('.masonryItem');
items.forEach(item => {
    item.style.setProperty('--x', Math.random() > 0.5 ? 1 : -1);
    item.style.setProperty('--y', Math.random() > 0.5 ? 1 : -1);
    item.style.setProperty('--r', (Math.random() * 15 + 15) * (Math.random() > 0.5 ? 1 : -1));
});
