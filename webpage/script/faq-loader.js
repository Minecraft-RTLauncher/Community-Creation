document.addEventListener('DOMContentLoaded', function() {
    // 加载FAQ数据
    fetch('./faq_data.json')
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
                        <div class="faq-answer">${formatAnswer(question.answer)}</div>
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
        
        searchInput.addEventListener('keyup', function(e) {
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
});