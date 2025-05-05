window.addEventListener("load", () => {
	document.body.classList.add("loaded");
});

// 禁止图片拖拽
document.addEventListener('DOMContentLoaded', function () {
	const images = document.querySelectorAll('img');
	images.forEach(img => {
		img.addEventListener('dragstart', function (e) {
			e.preventDefault();
		});
	});
});