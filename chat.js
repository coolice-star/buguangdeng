// 导入配置
import config from './config.js';

class ChatWidget {
    constructor() {
        this.messages = [];
        this.isOpen = false;
        this.isFirstMessage = true;
        this.init();
    }

    init() {
        try {
            console.log('Initializing chat widget...');
            // 创建聊天组件
            this.createChatWidget();
            // 绑定事件
            this.bindEvents();
            // 初始化欢迎消息
            this.initWelcomeMessage();
            console.log('Chat widget initialized successfully');
        } catch (error) {
            console.error('Error initializing chat widget:', error);
        }
    }

    createChatWidget() {
        try {
            console.log('Creating chat widget elements...');
            // 创建主容器
            this.container = document.createElement('div');
            this.container.className = 'chat-widget';
            
            // 创建聊天图标
            this.chatIcon = document.createElement('div');
            this.chatIcon.className = 'chat-icon';
            this.chatIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44 24C44 35.0457 35.0457 44 24 44C18.0265 44 4 44 4 44C4 44 4 29.0722 4 24C4 12.9543 12.9543 4 24 4C35.0457 4 44 12.9543 44 24Z" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 18L32 18" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 26L32 26" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 34L24 34" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            
            // 创建聊天窗口
            this.chatWindow = document.createElement('div');
            this.chatWindow.className = 'chat-window';
            this.chatWindow.innerHTML = `
                <div class="chat-header">
                    <span>在线客服</span>
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" class="close-btn">
                        <path d="M14 14L34 34" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 34L34 14" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="请输入消息...">
                    <button>发送</button>
                </div>
            `;
            
            // 添加到页面
            this.container.appendChild(this.chatIcon);
            this.container.appendChild(this.chatWindow);
            document.body.appendChild(this.container);
            
            // 获取必要的DOM元素
            this.messagesContainer = this.chatWindow.querySelector('.chat-messages');
            this.input = this.chatWindow.querySelector('input');
            this.sendButton = this.chatWindow.querySelector('button');
            this.closeButton = this.chatWindow.querySelector('.close-btn');
            
            console.log('Chat widget elements created successfully');
        } catch (error) {
            console.error('Error creating chat widget:', error);
            throw error;
        }
    }

    bindEvents() {
        // 打开/关闭聊天窗口
        this.chatIcon.addEventListener('click', () => this.toggleChat());
        this.closeButton.addEventListener('click', () => this.toggleChat());
        
        // 发送消息
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatWindow.classList.toggle('active');
        if (this.isOpen) {
            this.input.focus();
        }
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (message) {
            // 显示用户消息
            this.addMessage(message, 'user');
            this.input.value = '';
            
            try {
                // 显示加载状态
                this.setLoadingState(true);
                
                // 调用Coze API
                const response = await this.callCozeAPI(message);
                
                // 解析并显示助手回复
                if (response && response.data) {
                    const result = JSON.parse(response.data);
                    if (result.output) {
                        // 移除重复的问候语
                        let output = result.output;
                        if (!this.isFirstMessage) {
                            // 移除常见的问候语模式
                            output = output.replace(/^(您好！|你好！|您好,|你好,).*?(我是|这里是).*?(客服助手|在线客服|客服小美).*?(很高兴为您服务。|为您服务。|能为您效劳。)/, '');
                        }
                        
                        // 移除可能的Markdown或HTML标记
                        output = this.cleanTextFormat(output.trim());
                        
                        this.addMessage(output, 'agent');
                        this.isFirstMessage = false;
                    }
                }
            } catch (error) {
                console.error('Error calling Coze API:', error);
                this.addMessage('抱歉，我遇到了一些问题，请稍后再试。', 'agent');
            } finally {
                this.setLoadingState(false);
            }
        }
    }

    cleanTextFormat(text) {
        // 移除Markdown标记
        text = text.replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗
                   .replace(/\*(.*?)\*/g, '$1')     // 移除斜体
                   .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接
                   .replace(/`(.*?)`/g, '$1')       // 移除代码块
                   .replace(/```[\s\S]*?```/g, '')  // 移除多行代码块
                   .replace(/#{1,6}\s/g, '')        // 移除标题标记
                   .replace(/\n\s*[-*+]\s/g, '\n• '); // 统一列表样式

        // 移除HTML标记
        text = text.replace(/<[^>]*>/g, '');
        
        // 处理换行
        text = text.replace(/\n{3,}/g, '\n\n'); // 将多个换行减少为最多两个

        return text;
    }

    async callCozeAPI(input) {
        try {
            const response = await fetch(config.COZE_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.COZE_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    workflow_id: config.COZE_WORKFLOW_ID,
                    parameters: {
                        input: input
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data); // 添加日志以便调试
            return data;
        } catch (error) {
            console.error('Error calling Coze API:', error);
            throw error;
        }
    }

    setLoadingState(isLoading) {
        const sendButton = this.sendButton;
        if (isLoading) {
            sendButton.disabled = true;
            sendButton.textContent = '发送中...';
        } else {
            sendButton.disabled = false;
            sendButton.textContent = '发送';
        }
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // 处理换行符
        const formattedText = text.split('\n').map(line => {
            line = line.trim();
            return line.length > 0 ? line : '';
        }).filter(line => line.length > 0).join('\n');
        
        messageDiv.textContent = formattedText;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    initWelcomeMessage() {
        // 添加欢迎消息
        setTimeout(() => {
            this.addMessage('您好！我是美颜补光灯的客服助手，很高兴为您服务。请问有什么可以帮您？', 'agent');
        }, 500);
    }

    getMockResponse() {
        const responses = [
            '好的，我明白了。让我帮您处理这个问题。',
            '感谢您的咨询，这个问题我们会尽快解决。',
            '您说得对，我们会认真考虑您的建议。',
            '抱歉让您久等了，我们正在处理中。',
            '这个问题我很清楚，让我为您详细解答。'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// 等待DOM完全加载后再初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded, initializing chat widget...');
        window.chatWidget = new ChatWidget();
    } catch (error) {
        console.error('Error during chat widget initialization:', error);
    }
}); 