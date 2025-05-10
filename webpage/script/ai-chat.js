API_URL = 'https://api2.hellofurry.cn/faq-ai.php';
//API_URL = 'http://localhost:3000/faq-ai.php';
TICKET_API_URL = 'https://api2.hellofurry.cn/';

document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.querySelector('.ai-chat-toggle');
    const chatContainer = document.querySelector('.ai-chat-container');
    const chatMessages = document.querySelector('.ai-chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const closeBtn = document.querySelector('.close-btn');

    // 添加重新开始按钮
    const restartBtn = document.createElement('button');
    restartBtn.className = 'restart-btn';
    restartBtn.innerHTML = '重新开始';
    chatContainer.querySelector('.ai-chat-header').appendChild(restartBtn);

    // 修改部分：每次页面加载都生成新的聊天ID
    sessionStorage.removeItem('chatId'); // 先移除旧的chatId
    let currentChatId = Date.now().toString(); // 总是生成新的ID
    sessionStorage.setItem('chatId', currentChatId); // 存储新的ID

    let isStreaming = false;
    let buffer = '';

    // 配置marked库选项
    marked.setOptions({
        breaks: true,
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (e) {
                    console.error(e);
                }
            }
            return hljs.highlightAuto(code).value;
        }
    });

    // 新增函数：生成新的聊天ID
    function generateNewChatId() {
        currentChatId = Date.now().toString();
        sessionStorage.setItem('chatId', currentChatId);
        chatMessages.innerHTML = ''; // 清空聊天记录
        addMessage('已开始新的对话', 'ai');
    }

    // 修改addMessage函数，增加sanitize参数
    function addMessage(content, role, sanitize = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        let parsedContent;
        if (sanitize) {
            const sanitizedContent = DOMPurify.sanitize(content);
            parsedContent = marked.parse(sanitizedContent);
        } else {
            parsedContent = marked.parse(content);
        }
        messageDiv.innerHTML = parsedContent;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function updateLastMessage(content) {
        const lastMessage = [...chatMessages.querySelectorAll('.ai-message')].pop();
        if (lastMessage) {
            lastMessage.innerHTML = '';
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = DOMPurify.sanitize(marked.parse(content));
            while (tempDiv.firstChild) {
                lastMessage.appendChild(tempDiv.firstChild);
            }

            lastMessage.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });

            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message ai-message typing-indicator';
        indicator.innerHTML = `
            <div class="typing-content">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicators = document.querySelectorAll('.typing-indicator');
        indicators.forEach(indicator => indicator.remove());
    }

    async function sendMessage() {
        const question = chatInput.value.trim();
        if (!question || isStreaming) return;

        addMessage(question, 'user');
        chatInput.value = '';
        isStreaming = true;
        showTypingIndicator();

        try {
            const url = new URL(API_URL);
            url.searchParams.set('question', encodeURIComponent(question));
            if (currentChatId) url.searchParams.set('id', currentChatId);

            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`);

            removeTypingIndicator();
            addMessage('', 'ai');
            let fullContent = '';

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            buffer = '';

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    const eventParts = buffer.split('\n\n');
                    buffer = eventParts.pop();

                    for (const event of eventParts) {
                        const lines = event.split('\n');
                        let chunkContent = '';
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const jsonStr = line.slice(6).trim();
                                if (!jsonStr) continue;
                                try {
                                    const data = JSON.parse(jsonStr);
                                    if (data.content) chunkContent += data.content;
                                    if (data.finished) done = true;
                                } catch (e) { console.error('JSON解析错误:', e); }
                            }
                        }
                        if (chunkContent) {
                            fullContent += chunkContent;
                            updateLastMessage(fullContent);
                        }
                    }
                }
            }

            if (buffer.trim()) {
                try {
                    const data = JSON.parse(buffer);
                    if (data.content) {
                        fullContent += data.content;
                        updateLastMessage(fullContent);
                    }
                } catch (e) {
                    fullContent += buffer;
                    updateLastMessage(fullContent);
                }
            }

        } catch (error) {
            console.error('错误:', error);
            removeTypingIndicator();
            addMessage('抱歉，出现了一个错误，请稍后再试。', 'ai', true);
        } finally {
            isStreaming = false;
        }
    }

    // 事件监听器
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('active');
        chatToggle.classList.toggle('active');
    });

    closeBtn.addEventListener('click', () => {
        chatContainer.classList.remove('active');
        chatToggle.classList.remove('active');
    });

    sendBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // 添加重新开始按钮的点击事件
    restartBtn.addEventListener('click', generateNewChatId);

    // 在DOMContentLoaded事件监听器中替换原来的document点击事件
    document.addEventListener('click', (e) => {
        // 检查点击是否在聊天框内部
        const isInsideChat = chatContainer.contains(e.target) ||
            e.target === sendBtn ||
            e.target === chatInput ||
            e.target === restartBtn;

        // 只有当点击的是外部且不是切换按钮时才关闭
        if (!isInsideChat && !chatToggle.contains(e.target)) {
            chatContainer.classList.remove('active');
            chatToggle.classList.remove('active');
        }
    });

    // 在DOMContentLoaded事件监听器中添加以下代码
    const ticketBtn = document.createElement('button');
    ticketBtn.className = 'ticket-btn';
    ticketBtn.innerHTML = '<i class="ti ti-lifebuoy"></i>人工帮助';
    chatContainer.querySelector('.ai-chat-header').appendChild(ticketBtn);

    // 新增工单处理函数
    async function createSupportTicket(message) {
        try {
            const response = await fetch(TICKET_API_URL + 'create_ticket.php', {  // 修改这里
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: currentChatId,
                    message: message
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                showAlert('人工请求已提交，客服将尽快联系您！', 'success');
            }
        } catch (error) {
            console.error('工单提交失败:', error);
            showAlert('请求提交失败，请稍后再试', 'error');
        }
    }

    // 显示提示信息
    function showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `admin-alert alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // 修改sendMessage函数，在流式接收数据的循环中添加检测逻辑
    let assistanceRequested = false;

    async function sendMessage() {
        const question = chatInput.value.trim();
        if (!question || isStreaming) return;

        addMessage(question, 'user');
        chatInput.value = '';
        isStreaming = true;
        showTypingIndicator();

        try {
            const url = new URL(API_URL);
            url.searchParams.set('question', encodeURIComponent(question));
            if (currentChatId) url.searchParams.set('id', currentChatId);

            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`);

            removeTypingIndicator();
            addMessage('', 'ai');
            let fullContent = '';

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            buffer = '';

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    const eventParts = buffer.split('\n\n');
                    buffer = eventParts.pop();

                    for (const event of eventParts) {
                        const lines = event.split('\n');
                        let chunkContent = '';
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const jsonStr = line.slice(6).trim();
                                if (!jsonStr) continue;
                                try {
                                    const data = JSON.parse(jsonStr);
                                    if (data.content) chunkContent += data.content;
                                    if (data.finished) done = true;
                                } catch (e) { console.error('JSON解析错误:', e); }
                            }
                        }
                        if (chunkContent) {
                            fullContent += chunkContent;
                            updateLastMessage(fullContent);

                            // 实时检测帮助请求
                            if (!assistanceRequested && fullContent.includes('[I require assistance]')) {
                                assistanceRequested = true;
                                createSupportTicket(fullContent);
                            }
                        }
                    }
                }
            }

            if (buffer.trim()) {
                try {
                    const data = JSON.parse(buffer);
                    if (data.content) {
                        fullContent += data.content;
                        updateLastMessage(fullContent);
                    }
                } catch (e) {
                    fullContent += buffer;
                    updateLastMessage(fullContent);
                }
            }

        } catch (error) {
            console.error('错误:', error);
            removeTypingIndicator();
            addMessage('抱歉，出现了一个错误，请稍后再试。', 'ai', true);
        } finally {
            isStreaming = false;
            assistanceRequested = false;
        }
    }

    // 工单按钮点击事件
    ticketBtn.addEventListener('click', () => {
        const lastMessage = [...chatMessages.querySelectorAll('.ai-message')].pop()?.textContent;
        createSupportTicket(lastMessage || '用户主动请求人工帮助');
    });

    function adjustChatPosition() {
        const chatRect = chatContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        if (chatRect.bottom > windowHeight) {
            chatContainer.style.bottom = `${windowHeight - chatRect.top - 20}px`;
        }
        if (chatRect.right > windowWidth) {
            chatContainer.style.right = `${windowWidth - chatRect.left - 20}px`;
        }
    }

    window.addEventListener('resize', adjustChatPosition);
    adjustChatPosition();
});

// 在ai-chat.js中添加
function adjustLayoutForMobile() {
    const chatContainer = document.querySelector('.ai-chat-container');
    if (window.innerWidth <= 768) {
        chatContainer.classList.add('mobile-view');
    } else {
        chatContainer.classList.remove('mobile-view');
    }
}

// 初始检查和监听
window.addEventListener('resize', adjustLayoutForMobile);
adjustLayoutForMobile();