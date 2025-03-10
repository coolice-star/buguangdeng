// 配置对象
const config = {
    COZE_API_KEY: 'pat_B0OegddRIZqMUht2ha1ON5CS204gg8HGxSkNmYviBUL8V4vlAUtESo1Q91NGlbAQ', // Coze API密钥
    COZE_WORKFLOW_ID: '7478721788534276148', // Coze工作流ID
    COZE_API_URL: 'https://api.coze.cn/v1/workflow/run', // Coze API地址
    API_OPTIONS: {
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }
};

// 确保配置对象可以被正确导入
export default config; 