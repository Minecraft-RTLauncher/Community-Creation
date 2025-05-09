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
var title2 = 'FAQ常见问题页面'
var content = `
版 本 号：20250510070906
版本日期：2025年5月10日07:09:06

RTL保留对此板块信息的最终解释权.
 
官网:  https://www.rsdaily.com/
`
console.log(`%c${title1} %c${title2}
%c${content}`, styleTitle1, styleTitle2, styleContent)

//版权信息结束

document.addEventListener('DOMContentLoaded', function () {
    // 加载FAQ数据
    fetch('./script/faq-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            renderFAQ(data);
            setupSearch(data);
            setupToggle();
            setupSearchAnimation();
            setupCollapse();
            setupRating();
        })
        .catch(error => {
            console.error('加载FAQ时出错:', error);
            document.getElementById('faq-container').innerHTML = `
                <div class="error-message">
                    <p>无法加载常见问题。请稍后再试。</p>
                    <button onclick="location.reload()">重试</button>
                </div>
            `;
        });

    // 渲染FAQ内容
    function renderFAQ(faqData) {
        const faqContainer = document.getElementById('faq-container');

        if (!faqData || !faqData.categories || faqData.categories.length === 0) {
            faqContainer.innerHTML = '<p>暂无常见问题。</p>';
            return;
        }

        let html = '';

        faqData.categories.forEach(category => {
            html += `
            <section class="faq-section">
                <h2 class="faq-category">${category.name}</h2>
            `;

            category.questions.forEach(question => {
                html += `
                <div class="faq-item">
                    <div class="faq-question">
                        <span>${question.question}</span>
                        <svg class="faq-toggle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div class="faq-answer">
                        ${formatAnswer(question.answer)}
                        <!-- 在每个答案底部添加评分系统 -->
                        <div class="rating-container" 
                             data-question-id="${encodeURIComponent(question.question)}"
                             data-version="${question.version || '1.0.0'}">
                            <p>这个回答对您有帮助吗?</p>
                            <div class="stars">
                                ${[1, 2, 3, 4, 5].map(star => `
                                    <span class="star" data-value="${star}">★</span>
                                `).join('')}
                            </div>
                            <p class="rating-feedback" style="display:none;">感谢您的反馈!</p>
                        </div>
                    </div>
                </div>
                `;
            });

            html += `</section>`;
        });

        faqContainer.innerHTML = html;
    }

    // 格式化答案内容
    function formatAnswer(answer) {
        if (Array.isArray(answer)) {
            return `<ul>${answer.map(item => `<li>${item}</li>`).join('')}</ul>`;
        } else if (typeof answer === 'object') {
            // 处理复杂答案结构
            if (answer.type === 'grid') {
                return `
                    <div style="margin-top: 15px; display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                        ${answer.items.map(item => `
                            <div style="background:rgba(139, 139, 139, 0.62) 15px; border-radius: 6px;padding: 20px;"">
                                <h3 style="color:rgb(255, 255, 255); margin-bottom: 8px;">${item.title}</h3>
                                <p style="font-size: 0.9rem;">${item.content}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (answer.type === 'links') {
                return `
                    <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px;">
                        ${answer.items.map(link => `
                            <a href="${link.url}" target="_blank"
                                style="display: flex; align-items: center; background:rgb(255, 255, 255); padding: 10px 15px; border-radius: 6px; text-decoration: none; color: inherit; transition: background 0.3s;">
                                <img src="${link.icon}" alt="${link.name}" style="width: 20px; height: 20px; margin-right: 8px;">
                                <span>${link.name}</span>
                            </a>
                        `).join('')}
                    </div>
                `;
            } else if (answer.type === 'code') {
                return `
                    <div class="code-block">
                        <div class="code-header">
                            <span>${answer.language || '代码'}</span>
                            <button class="copy-btn" onclick="copyToClipboard(this)">复制</button>
                        </div>
                        <pre><code>${answer.content}</code></pre>
                    </div>
                `;
            } else if (answer.type === 'alert') {
                return `
                    <div class="alert alert-${answer.level || 'info'}">
                        <strong>${answer.title || (answer.level === 'danger' ? '警告' : '提示')}</strong>
                        ${answer.content}
                    </div>
                `;
            } else if (answer.type === 'steps') {
                return `
                    <div class="steps-container">
                        ${answer.items.map((step, index) => `
                            <div class="step">
                                <div class="step-number">${index + 1}</div>
                                <div class="step-content">
                                    <h4>${step.title}</h4>
                                    ${step.content}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (answer.type === 'table') {
                return `
                    <div class="responsive-table">
                        <table>
                            ${answer.headers ? `
                                <thead>
                                    <tr>
                                        ${answer.headers.map(header => `<th>${header}</th>`).join('')}
                                    </tr>
                                </thead>
                            ` : ''}
                            <tbody>
                                ${answer.rows.map(row => `
                                    <tr>
                                        ${row.map(cell => `<td>${cell}</td>`).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else if (answer.type === 'video') {
                return `
                    <div class="video-wrapper">
                        <div class="video-container">
                            <iframe 
                                src="${answer.url}?autoplay=0&controls=1" 
                                frameborder="0" 
                                allowfullscreen
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                loading="lazy">
                            </iframe>
                        </div>
                        ${answer.caption ? `<p class="video-caption">${answer.caption}</p>` : ''}
                    </div>
                `;
            } else if (answer.type === 'collapse') {
                return `
                    <div class="collapse-group">
                        ${answer.items.map(item => `
                            <div class="collapse-item">
                                <button class="collapse-header">
                                    ${item.title}
                                    <svg class="collapse-icon" viewBox="0 0 24 24">
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div class="collapse-content">${item.content}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (answer.type === 'rating') {
                return `
                    <div class="rating-container">
                        <p>${answer.question || '这篇文章对您有帮助吗?'}</p>
                        <div class="stars">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <span class="star" data-value="${star}">★</span>
                            `).join('')}
                        </div>
                        <p class="rating-feedback" style="display:none;">感谢您的反馈!</p>
                    </div>
                `;
            }
        }

        return `<p>${answer}</p>`;
    }

    // 设置问题切换功能
    function setupToggle() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                item.classList.toggle('active');

                // 平滑滚动到问题位置
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        });
    }

    // 设置搜索功能
    function setupSearch(faqData) {
        const searchInput = document.getElementById('faq-search');
        const searchBtn = document.getElementById('search-btn');
        const faqContainer = document.getElementById('faq-container');

        function performSearch() {
            const query = searchInput.value.toLowerCase().trim();

            if (!query) {
                renderFAQ(faqData);
                setupToggle();
                return;
            }

            const filteredData = {
                categories: faqData.categories.map(category => ({
                    name: category.name,
                    questions: category.questions.filter(question => {
                        // 检查问题标题
                        const questionMatch = question.question.toLowerCase().includes(query);

                        // 检查答案内容
                        let answerMatch = false;

                        if (typeof question.answer === 'string') {
                            answerMatch = question.answer.toLowerCase().includes(query);
                        } else if (Array.isArray(question.answer)) {
                            answerMatch = question.answer.some(item =>
                                item.toLowerCase().includes(query)
                            );
                        } else if (typeof question.answer === 'object') {
                            if (question.answer.type === 'grid') {
                                answerMatch = question.answer.items.some(item =>
                                    item.title.toLowerCase().includes(query) ||
                                    item.content.toLowerCase().includes(query)
                                );
                            } else if (question.answer.type === 'links') {
                                answerMatch = question.answer.items.some(link =>
                                    link.name.toLowerCase().includes(query) ||
                                    (link.url && link.url.toLowerCase().includes(query))
                                );
                            }
                        }

                        return questionMatch || answerMatch;
                    })
                })).filter(category => category.questions.length > 0)
            };

            renderFAQ(filteredData);
            setupToggle();

            // 高亮匹配的文本
            document.querySelectorAll('.faq-question span, .faq-answer p, .faq-answer li, .faq-answer h3, .faq-answer a span').forEach(element => {
                const text = element.textContent;
                const html = text.replace(new RegExp(query, 'gi'), match =>
                    `<span class="highlight">${match}</span>`
                );
                element.innerHTML = html;
            });
        }

        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        searchBtn.addEventListener('click', performSearch);
    }

    // 设置搜索框动画
    function setupSearchAnimation() {
        const searchInput = document.getElementById('faq-search');
        const searchBtn = document.getElementById('search-btn');

        // 聚焦时动画
        searchInput.addEventListener('focus', () => {
            searchInput.style.borderColor = '#4a90e2';
            searchInput.style.boxShadow = '0 0 0 2px rgba(74, 144, 226, 0.2)';
            searchBtn.style.transform = 'scale(1.05)';
        });

        // 失去焦点时动画
        searchInput.addEventListener('blur', () => {
            searchInput.style.borderColor = '#ddd';
            searchInput.style.boxShadow = 'none';
            searchBtn.style.transform = 'scale(1)';
        });

        // 输入时动画
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() !== '') {
                searchBtn.style.backgroundColor = '#4a90e2';
                searchBtn.style.color = 'white';
            } else {
                searchBtn.style.backgroundColor = '';
                searchBtn.style.color = '';
            }
        });
    }

    // 设置折叠功能
    function setupCollapse() {
        document.querySelectorAll('.collapse-header').forEach(header => {
            header.addEventListener('click', function () {
                const item = this.closest('.collapse-item');
                const content = item.querySelector('.collapse-content');
                const icon = this.querySelector('.collapse-icon');

                item.classList.toggle('active');

                if (item.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    content.style.maxHeight = '0';
                    icon.style.transform = 'rotate(0)';
                }
            });
        });
    }

    // 设置评分功能
    function setupRating() {
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', function () {
                const value = parseInt(this.getAttribute('data-value'));
                const container = this.closest('.rating-container');
                const stars = container.querySelectorAll('.star');
                const feedback = container.querySelector('.rating-feedback');
                const questionId = container.getAttribute('data-question-id');

                // 设置选中状态
                stars.forEach((s, index) => {
                    if (index < value) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });

                // 显示反馈
                feedback.style.display = 'block';

                // 如果评分低于3分，显示反馈输入框
                if (value < 3) {
                    const existingFeedbackInput = container.querySelector('.low-rating-feedback');
                    if (!existingFeedbackInput) {
                        const feedbackForm = document.createElement('div');
                        feedbackForm.className = 'low-rating-feedback';
                        feedbackForm.innerHTML = `
                        <p>感谢您的反馈！请告诉我们哪里可以改进：</p>
                        <textarea class="feedback-textarea" placeholder="请详细说明您的问题..."></textarea>
                        <button class="submit-feedback-btn">提交反馈</button>
                    `;
                        container.appendChild(feedbackForm);

                        // 提交反馈
                        const submitBtn = feedbackForm.querySelector('.submit-feedback-btn');
                        submitBtn.addEventListener('click', () => {
                            const feedbackText = feedbackForm.querySelector('.feedback-textarea').value;
                            sendRatingToServer(questionId, value, feedbackText);
                            feedbackForm.style.display = 'none';
                        });
                    }
                } else {
                    // 高分直接提交
                    sendRatingToServer(questionId, value);
                }
            });
        });
    }

    // 修改sendRatingToServer函数
    function sendRatingToServer(question, rating, feedback = null) {
        const container = document.querySelector(`.rating-container[data-question-id="${question}"]`);
        const version = container.getAttribute('data-version');

        const data = {
            question: decodeURIComponent(question),
            version: version,
            rating: rating
        };

        if (feedback) {
            data.feedback = feedback;
        }

        // 显示加载状态
        const feedbackElement = container.querySelector('.rating-feedback');
        feedbackElement.textContent = '提交中...';
        feedbackElement.style.display = 'block';
        feedbackElement.style.color = '#666';

        fetch('https://api.hellofurry.cn/rtl/rating.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    feedbackElement.textContent = '感谢您的反馈！';
                    feedbackElement.style.color = '#4CAF50';
                } else {
                    feedbackElement.textContent = data.message || '提交失败，请重试';
                    feedbackElement.style.color = '#F44336';

                    if (data.message && data.message.includes('已经对当前版本的问题评过分了')) {
                        const stars = container.querySelectorAll('.star');
                        stars.forEach(star => star.classList.remove('active'));
                    }
                }
            })
            .catch(error => {
                console.error('评分提交错误:', error);
                feedbackElement.textContent = '网络错误，请稍后再试';
                feedbackElement.style.color = '#F44336';
            });
    }

    // 添加复制功能
    function copyToClipboard(button) {
        const codeBlock = button.closest('.code-block');
        const codeContent = codeBlock.querySelector('code').textContent;

        navigator.clipboard.writeText(codeContent).then(() => {
            const originalText = button.textContent;
            button.textContent = '已复制!';
            button.style.background = '#10b981';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '#38bdf8';
            }, 2000);
        }).catch(err => {
            console.error('复制失败:', err);
            button.textContent = '复制失败';
            button.style.background = '#ef4444';
        });
    }
})