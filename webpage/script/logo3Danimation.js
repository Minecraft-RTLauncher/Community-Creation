document.addEventListener('DOMContentLoaded', function() {
    const logo = document.querySelector('.logo');
    const logoInner = document.querySelector('.logo-inner');
    let isHovering = false;
    let isMouseDown = false;
    logo.addEventListener('mouseenter', () => {
        isHovering = true;
        logoInner.style.transition = 'transform 0.3s ease-out';
        logoInner.style.transform = 'translateZ(20px)'
    });
    logo.addEventListener('mousemove', (e) => {
        if (!isHovering) return;
        const rect = logo.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = (e.clientX - centerX) / (rect.width / 2);
        const mouseY = (centerY - e.clientY) / (rect.height / 2);
        if (isMouseDown) {
            const pressDepth = 10;
            const tiltAmount = 15;
            logoInner.style.transform = `rotateY(${mouseX*tiltAmount}deg)rotateX(${mouseY*tiltAmount}deg)translateZ(${20-pressDepth}px)`
        } else {
            logoInner.style.transform = `rotateY(${mouseX*10}deg)rotateX(${mouseY*10}deg)translateZ(20px)`
        }
    });
    logo.addEventListener('mouseleave', () => {
        isHovering = false;
        isMouseDown = false;
        logoInner.style.transition = 'transform 0.3s ease-out';
        logoInner.style.transform = 'translateZ(0)'
    })
});