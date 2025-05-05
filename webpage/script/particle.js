window.addEventListener("load", () => {
    const t = document.createElement("canvas"),
        e = t.getContext("2d");
    t.style.position = "fixed", t.style.top = "0", t.style.left = "0", t.style.zIndex = "1", document.body.appendChild(t);
    const i = {
            x: null,
            y: null,
            radius: 75
        },
        n = Math.floor(window.innerWidth * window.innerHeight / 7680);
    let h = [];
    const s = window.innerWidth / 1280 / 2;

    function a() {
        t.width = window.innerWidth, t.height = window.innerHeight
    }
    window.addEventListener("mousemove", function(t) {
        i.x = t.clientX, i.y = t.clientY
    }), window.addEventListener("click", function(t) {
        const e = t.clientX,
            i = t.clientY,
            n = Math.random(),
            s = Math.random();
        h.push(new d(e + n, i + s)), h.push(new d(e + n, i - s)), h.push(new d(e - n, i + s)), h.push(new d(e - n, i - s));
        const a = Math.min(Math.floor(4 * Math.random()) + 2, h.length - 1);
        for (let t = 0; t < a; t++) {
            const t = Math.floor(Math.random() * h.length);
            h.splice(t, 1)
        }
    }), window.addEventListener("resize", a), a();
    class d {
        constructor(e, i) {
            this.x = void 0 !== e ? e : Math.random() * t.width, this.y = void 0 !== i ? i : Math.random() * t.height, this.radius = 2 * Math.random(), this.baseSpeed = Math.random() * s + .2, this.speed = this.baseSpeed, this.angle = Math.random() * Math.PI * 2
        }
        update() {
            const e = i.x - this.x,
                n = i.y - this.y;
            if (Math.sqrt(e * e + n * n) < i.radius && i.x && i.y) {
                const t = Math.atan2(n, e);
                this.speed = 3 * this.baseSpeed, this.angle = t + Math.PI
            } else this.speed = this.baseSpeed, this.angle += .1 * (Math.random() - .5);
            this.x += Math.cos(this.angle) * this.speed, this.y += Math.sin(this.angle) * this.speed, (this.x < 0 || this.x > t.width || this.y < 0 || this.y > t.height) && this.reset()
        }
        draw() {
            e.beginPath(), e.arc(this.x, this.y, this.radius, 0, 2 * Math.PI), e.fillStyle = `rgba(255,255,255,${2*(1-this.radius/2)})`, e.fill()
        }
        reset() {
            this.x = Math.random() * t.width, this.y = Math.random() * t.height, this.angle = Math.random() * Math.PI * 2
        }
    }
    h = Array.from({
            length: n
        }, () => new d),
        function i() {
            e.clearRect(0, 0, t.width, t.height), h.forEach(t => {
                t.update(), t.draw()
            }), requestAnimationFrame(i)
        }()
});