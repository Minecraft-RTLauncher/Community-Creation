let menuActive = false;

document.addEventListener('click', (e) => {
    const isMenuClick = e.target.closest('.menu-btn, .menu-panel');
    
    if (menuActive && !isMenuClick) {
        closeMenu();
    } else if (e.target.closest('.menu-btn')) {
        toggleMenu();
    }
});

function toggleMenu() {
    menuActive = !menuActive;
    document.querySelector('.menu-btn').classList.toggle('active', menuActive);
    document.querySelector('.menu-panel').classList.toggle('active', menuActive);
}

function closeMenu() {
    menuActive = false;
    document.querySelector('.menu-btn').classList.remove('active');
    document.querySelector('.menu-panel').classList.remove('active');
}