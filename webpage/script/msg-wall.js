document.addEventListener("alpine:init", () => {
    Alpine.data("messageBoard", () => ({
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
            captcha: ""
        },
        init() {
            this.generateCaptcha()
        },
        async fetchMessages(t = !1) {
            if (!this.isLoading) {
                this.isLoading = !0;
                try {
                    const e = t ? 1 : this.currentPage,
                        a = await fetch(`https://api.hellofurry.cn/rtl/get-msg-wall.php?page=${e}`),
                        s = await a.json();
                    Array.isArray(s) && (t ? (this.messages = s, this.currentPage = 1) : this.messages = [...this.messages, ...s], s.length > 0 ? this.currentPage++ : t && this.showToast("没有留言了", "info"))
                } catch (t) {
                    console.error("获取留言失败:", t), (t instanceof TypeError || t instanceof SyntaxError) && this.showToast("获取留言失败，请刷新重试", "error")
                } finally {
                    this.isLoading = !1
                }
            }
        },
        generateCaptcha() {
            const t = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
            let e = "";
            for (let a = 0; a < 6; a++) e += t.charAt(Math.floor(Math.random() * t.length));
            this.captchaText = e;
            const a = this.$refs.captchaCanvas,
                s = a.getContext("2d");
            s.clearRect(0, 0, a.width, a.height), s.fillStyle = "#1a1a1a", s.fillRect(0, 0, a.width, a.height);
            for (let t = 0; t < 3 + Math.floor(3 * Math.random()); t++) s.strokeStyle = `rgba(255, 255, 255, ${.3*Math.random()+.2})`, s.lineWidth = .5 * Math.random() + .5, s.beginPath(), s.moveTo(Math.random() * a.width, Math.random() * a.height), s.lineTo(Math.random() * a.width, Math.random() * a.height), s.stroke();
            for (let t = 0; t < 30 + Math.floor(20 * Math.random()); t++) s.fillStyle = `rgba(255, 255, 255, ${.2*Math.random()+.1})`, s.beginPath(), s.arc(Math.random() * a.width, Math.random() * a.height, 1.5 * Math.random(), 0, 2 * Math.PI), s.fill();
            for (let t = 0; t < e.length; t++) {
                const a = e.charAt(t);
                s.font = `${Math.floor(6*Math.random()+18)}px Arial`, s.fillStyle = `hsl(${60*Math.random()+100}, 80%, ${20*Math.random()+60}%)`;
                const o = 15 + 15 * t + (4 * Math.random() - 2),
                    i = 8 * Math.random() - 4 + 25;
                s.save(), s.translate(o, i), s.rotate((30 * Math.random() - 15) * Math.PI / 180), s.fillText(a, 0, 0), s.restore()
            }
            s.strokeStyle = "rgba(255, 255, 255, 0.05)", s.lineWidth = 2;
            for (let t = 0; t < 3; t++) s.beginPath(), s.arc(a.width / 2, a.height / 2, 10 * t + 5, 0, 2 * Math.PI), s.stroke()
        },
        likeMessage(t) {
            t.likes || (t.likes = 0), t.likes++, this.sendLikeToBackend(t.id, t.likes), this.showToast("点赞成功", "success"), this.showHeartAnimation()
        },
        async submitMessage() {
            if (this.form.captcha.toLowerCase() !== this.captchaText.toLowerCase()) return this.showToast("验证码错误", "error"), void this.generateCaptcha();
            this.isSubmitting = !0;
            try {
                const t = await fetch("https://api.hellofurry.cn/rtl/send-msg-wall.php", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            username: this.form.username,
                            qq: this.form.qq,
                            content: this.form.content
                        })
                    }),
                    e = await t.json();
                e.success ? (this.showToast("留言提交成功", "success"), this.confetti(), this.form = {
                    username: "",
                    qq: "",
                    content: "",
                    captcha: ""
                }, this.generateCaptcha(), this.fetchMessages(!0)) : this.showToast(e.message || "提交失败", "error")
            } catch (t) {
                console.error("提交留言失败:", t), this.showToast("网络错误，请重试", "error")
            } finally {
                this.isSubmitting = !1
            }
        },
        async sendLikeToBackend(t, e) {
            try {
                const a = await fetch("https://api.hellofurry.cn/rtl/like-msg-wall.php", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id: t,
                            likes: e
                        })
                    }),
                    s = await a.json();
                s.success || console.error("点赞保存失败:", s.message)
            } catch (t) {
                console.error("点赞请求失败:", t)
            }
        },
        showHeartAnimation() {
            const t = document.createElement("div");
            t.innerHTML = "❤️", t.className = "absolute text-red-500 text-2xl animate-heart", t.style.left = `${100*Math.random()}%`, t.style.top = "0";
            const e = document.querySelector(`[x-data] [x-text="${message.username}"]`).closest("div.bg-gray-800");
            e.style.position = "relative", e.appendChild(t), setTimeout(() => {
                t.remove()
            }, 1e3)
        },
        formatDate: t => new Date(t).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }),
        showToast(t, e = "info") {
            const a = document.createElement("div");
            a.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${"success"===e?"bg-green-600":"error"===e?"bg-red-600":"bg-blue-600"} animate-slide-up`, a.textContent = t, document.body.appendChild(a), setTimeout(() => {
                a.classList.add("opacity-0", "transition-opacity", "duration-300"), setTimeout(() => a.remove(), 300)
            }, 3e3)
        },
        confetti() {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: {
                    y: .6
                },
                colors: ["#4d7c0f", "#84cc16", "#ecfccb"]
            })
        }
    }))
});
const style = document.createElement("style");
style.textContent = "\n    @keyframes heart {\n        0% { transform: translateY(0) scale(1); opacity: 1; }\n        100% { transform: translateY(-100px) scale(1.5); opacity: 0; }\n    }\n    .animate-heart {\n        animation: heart 1s ease-out forwards;\n    }\n", document.head.appendChild(style);