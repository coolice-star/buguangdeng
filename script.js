document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const cameraPreview = document.getElementById('cameraPreview');
    const lightFrame = document.getElementById('lightFrame');
    const colorButtons = document.querySelectorAll('.color-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterOverlay = document.getElementById('filterOverlay');
    
    // 滑块元素
    const brightnessSlider = document.getElementById('brightnessSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    const hueSlider = document.getElementById('hueSlider');
    const hueValue = document.getElementById('hueValue');
    const saturationSlider = document.getElementById('saturationSlider');
    const saturationValue = document.getElementById('saturationValue');
    
    // 自定义颜色元素
    const colorPicker = document.getElementById('colorPicker');
    const addCustomColorBtn = document.getElementById('addCustomColor');
    
    // 位置按钮元素
    const positionButtons = document.querySelectorAll('.position-btn');
    
    // 美颜滑块
    const smoothSlider = document.getElementById('smoothSlider');
    const whiteningSlider = document.getElementById('whiteningSlider');
    const blushSlider = document.getElementById('blushSlider');
    const smoothValue = document.getElementById('smoothValue');
    const whiteningValue = document.getElementById('whiteningValue');
    const blushValue = document.getElementById('blushValue');
    
    // 默认设置
    let currentColor = '#FFFFFF';
    let currentBrightness = 70;
    let currentHue = 0;
    let currentSaturation = 100;
    let currentFilter = 'none';
    let lightPosition = 'center'; // 默认中央位置
    
    // 默认美颜设置
    let smoothLevel = 0;
    let whiteningLevel = 0;
    let blushLevel = 0;
    
    // 检测设备类型
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 初始化摄像头函数修改
    async function initCamera() {
        try {
            // 移动设备的摄像头配置
            const constraints = { 
                video: { 
                    facingMode: 'user',
                    width: isMobile ? { ideal: 720 } : { ideal: 1280 },
                    height: isMobile ? { ideal: 1280 } : { ideal: 720 }
                } 
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            cameraPreview.srcObject = stream;
            
            // 处理视频首次加载
            cameraPreview.addEventListener('loadeddata', function() {
                // 移除加载指示器（如果有）
                const loadingIndicator = document.querySelector('.loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                
                console.log('摄像头已成功初始化');
            });
            
        } catch (error) {
            console.error('无法访问摄像头:', error);
            
            // 显示更友好的错误信息，特别是针对移动设备
            let errorMessage = '无法访问摄像头，请确保您已授予摄像头访问权限，并刷新页面重试。';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = '您拒绝了摄像头访问权限。请在浏览器设置中允许访问摄像头，然后刷新页面。';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '未找到摄像头设备。请确保您的设备有前置摄像头并且工作正常。';
            } else if (error.name === 'NotReadableError') {
                errorMessage = '无法访问摄像头，可能被其他应用占用。请关闭可能使用摄像头的其他应用后刷新页面。';
            }
            
            alert(errorMessage);
        }
    }
    
    // 更新补光颜色和亮度
    function updateLightEffect() {
        // 计算亮度调整后的颜色
        const rgbColor = hexToRgb(currentColor);
        const alpha = currentBrightness / 100;
        
        // 应用HSL调整
        const hslColor = rgbToHsl(rgbColor.r, rgbColor.g, rgbColor.b);
        hslColor.h = (hslColor.h + currentHue) % 360;
        hslColor.s = (hslColor.s * currentSaturation / 100);
        
        // 转回RGB
        const adjustedRgb = hslToRgb(hslColor.h, hslColor.s, hslColor.l);
        
        // 根据位置设置不同的渐变中心
        let gradientPosition;
        switch(lightPosition) {
            case 'topleft': gradientPosition = '20% 20%'; break;
            case 'top': gradientPosition = '50% 20%'; break;
            case 'topright': gradientPosition = '80% 20%'; break;
            case 'left': gradientPosition = '20% 50%'; break;
            case 'center': gradientPosition = '50% 50%'; break;
            case 'right': gradientPosition = '80% 50%'; break;
            case 'bottomleft': gradientPosition = '20% 80%'; break;
            case 'bottom': gradientPosition = '50% 80%'; break;
            case 'bottomright': gradientPosition = '80% 80%'; break;
            default: gradientPosition = '50% 50%';
        }
        
        const gradientColor = `rgba(${adjustedRgb.r}, ${adjustedRgb.g}, ${adjustedRgb.b}, ${alpha})`;
        const transparentColor = `rgba(${adjustedRgb.r}, ${adjustedRgb.g}, ${adjustedRgb.b}, 0)`;
        
        // 设置主光源和辅助光源
        lightFrame.style.background = `
            radial-gradient(circle at ${gradientPosition}, ${gradientColor} 0%, ${transparentColor} 70%),
            radial-gradient(circle at 50% 50%, ${gradientColor} 0%, ${transparentColor} 90%)
        `;
        
        // 添加边缘光晕效果
        lightFrame.style.boxShadow = `0 0 30px 5px rgba(${adjustedRgb.r}, ${adjustedRgb.g}, ${adjustedRgb.b}, ${alpha * 0.7})`;
        
        // 更新显示值
        brightnessValue.textContent = `${currentBrightness}%`;
        hueValue.textContent = `${currentHue}°`;
        saturationValue.textContent = `${currentSaturation}%`;
    }
    
    // 更新滤镜效果
    function updateFilterEffect() {
        // 移除所有滤镜类
        filterOverlay.className = 'filter-overlay';
        
        // 添加当前滤镜类
        if (currentFilter !== 'none') {
            filterOverlay.classList.add(`filter-${currentFilter}`);
        }
        
        // 更新滤镜按钮状态
        filterButtons.forEach(btn => {
            if (btn.getAttribute('data-filter') === currentFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // 十六进制颜色转RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
    
    // RGB转HSL
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // 灰色
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return { h: h * 360, s: s, l: l };
    }
    
    // HSL转RGB
    function hslToRgb(h, s, l) {
        h /= 360;
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // 灰色
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    // 添加自定义颜色到色卡
    function addCustomColor(color) {
        // 创建新的颜色按钮
        const newColorBtn = document.createElement('button');
        newColorBtn.className = 'color-btn';
        newColorBtn.setAttribute('data-color', color);
        newColorBtn.style.backgroundColor = color;
        
        // 添加点击事件
        newColorBtn.addEventListener('click', function() {
            colorButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentColor = this.getAttribute('data-color');
            updateLightEffect();
        });
        
        // 添加到色卡网格
        const colorGrid = document.querySelector('.color-grid');
        colorGrid.appendChild(newColorBtn);
        
        // 更新colorButtons集合
        colorButtons.forEach(btn => btn.classList.remove('active'));
        newColorBtn.classList.add('active');
        currentColor = color;
        updateLightEffect();
    }
    
    // 颜色按钮点击事件
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除其他按钮的active类
            colorButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加active类到当前按钮
            this.classList.add('active');
            
            // 更新当前颜色
            currentColor = this.getAttribute('data-color');
            
            // 更新补光效果
            updateLightEffect();
        });
    });
    
    // 滤镜按钮点击事件
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            updateFilterEffect();
        });
    });
    
    // 亮度滑块事件
    brightnessSlider.addEventListener('input', function() {
        currentBrightness = this.value;
        updateLightEffect();
    });
    
    // 色相滑块事件
    hueSlider.addEventListener('input', function() {
        currentHue = parseInt(this.value);
        updateLightEffect();
    });
    
    // 饱和度滑块事件
    saturationSlider.addEventListener('input', function() {
        currentSaturation = parseInt(this.value);
        updateLightEffect();
    });
    
    // 添加自定义颜色按钮事件
    addCustomColorBtn.addEventListener('click', function() {
        addCustomColor(colorPicker.value);
    });
    
    // 位置按钮点击事件
    positionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除其他按钮的active类
            positionButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加active类到当前按钮
            this.classList.add('active');
            
            // 更新当前位置
            lightPosition = this.id.replace('light', '').toLowerCase();
            
            // 更新补光效果
            updateLightEffect();
        });
    });
    
    // 更新美颜效果
    function updateBeautyEffect() {
        // 计算滤镜值
        const blur = smoothLevel * 0.05; // 磨皮效果（模糊）
        const brightness = 100 + whiteningLevel * 0.3; // 美白效果（亮度）
        const saturate = 100 + blushLevel * 0.5; // 红润效果（饱和度）
        
        // 应用滤镜到视频
        const filterValue = `blur(${blur}px) brightness(${brightness}%) saturate(${saturate}%)`;
        cameraPreview.style.filter = filterValue;
        
        // 更新显示值
        smoothValue.textContent = `${smoothLevel}%`;
        whiteningValue.textContent = `${whiteningLevel}%`;
        blushValue.textContent = `${blushLevel}%`;
    }
    
    // 拍照功能
    function capturePhoto() {
        return new Promise((resolve) => {
            // 开始倒计时
            startCountdown(3).then(() => {
                // 设置画布尺寸 - 移动设备可以使用较小的尺寸以提高性能
                let width, height;
                
                if (isMobile) {
                    // 移动设备使用较小的尺寸
                    width = Math.min(cameraPreview.videoWidth, 1280);
                    height = Math.min(cameraPreview.videoHeight, 1280);
                    
                    // 保持原始宽高比
                    if (cameraPreview.videoWidth > cameraPreview.videoHeight) {
                        height = width * (cameraPreview.videoHeight / cameraPreview.videoWidth);
                    } else {
                        width = height * (cameraPreview.videoWidth / cameraPreview.videoHeight);
                    }
                } else {
                    width = cameraPreview.videoWidth;
                    height = cameraPreview.videoHeight;
                }
                
                photoCanvas.width = width;
                photoCanvas.height = height;
                
                // 在画布上绘制视频帧
                const context = photoCanvas.getContext('2d');
                
                // 镜像处理
                context.translate(width, 0);
                context.scale(-1, 1);
                
                // 绘制视频
                context.drawImage(cameraPreview, 0, 0, width, height);
                
                // 应用当前的滤镜和美颜效果
                if (currentFilter !== 'none' || smoothLevel > 0 || whiteningLevel > 0 || blushLevel > 0) {
                    // 保存当前的滤镜效果为图像
                    const filterStyles = window.getComputedStyle(filterOverlay);
                    const videoStyles = window.getComputedStyle(cameraPreview);
                    
                    // 模拟应用滤镜（这里简化处理，实际上滤镜效果可能无法完全复制）
                    if (currentFilter !== 'none') {
                        switch(currentFilter) {
                            case 'warm':
                                context.fillStyle = 'rgba(255, 183, 77, 0.2)';
                                context.fillRect(0, 0, width, height);
                                break;
                            case 'cool':
                                context.fillStyle = 'rgba(100, 181, 246, 0.2)';
                                context.fillRect(0, 0, width, height);
                                break;
                            case 'vintage':
                                // 简单模拟复古效果
                                context.fillStyle = 'rgba(121, 85, 72, 0.15)';
                                context.fillRect(0, 0, width, height);
                                break;
                            // 其他滤镜效果...
                        }
                    }
                }
                
                // 获取图像数据 - 移动设备可以降低图片质量以减小文件大小
                const quality = isMobile ? 0.8 : 0.9;
                const dataUrl = photoCanvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            });
        });
    }
    
    // 倒计时功能
    function startCountdown(seconds) {
        return new Promise((resolve) => {
            let count = seconds;
            
            // 显示倒计时
            countdownOverlay.style.opacity = '1';
            countdownOverlay.textContent = count;
            
            const interval = setInterval(() => {
                count--;
                if (count <= 0) {
                    clearInterval(interval);
                    countdownOverlay.style.opacity = '0';
                    setTimeout(() => {
                        resolve();
                    }, 300);
                } else {
                    countdownOverlay.textContent = count;
                }
            }, 1000);
        });
    }
    
    // 显示预览图
    function showPhotoPreview(imageUrl) {
        previewImage.src = imageUrl;
        photoPreview.style.display = 'block';
        cameraPreview.style.display = 'none';
    }
    
    // 返回拍照模式
    function returnToCamera() {
        photoPreview.style.display = 'none';
        cameraPreview.style.display = 'block';
    }
    
    // 保存照片
    function savePhoto(dataUrl) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'beauty_selfie_' + new Date().getTime() + '.jpg';
        link.click();
    }
    
    // 美颜滑块事件
    smoothSlider.addEventListener('input', function() {
        smoothLevel = parseInt(this.value);
        updateBeautyEffect();
    });
    
    whiteningSlider.addEventListener('input', function() {
        whiteningLevel = parseInt(this.value);
        updateBeautyEffect();
    });
    
    blushSlider.addEventListener('input', function() {
        blushLevel = parseInt(this.value);
        updateBeautyEffect();
    });
    
    // 拍照按钮点击事件
    captureBtn.addEventListener('click', function() {
        capturePhoto().then(photoUrl => {
            showPhotoPreview(photoUrl);
        });
    });
    
    // 保存照片按钮点击事件
    savePhotoBtn.addEventListener('click', function() {
        savePhoto(previewImage.src);
    });
    
    // 重拍按钮点击事件
    retakeBtn.addEventListener('click', function() {
        returnToCamera();
    });
    
    // 为移动设备添加方向变化处理
    if (isMobile) {
        window.addEventListener('orientationchange', function() {
            // 延迟执行以等待方向变化完成
            setTimeout(function() {
                // 重新调整界面布局
                const mainContent = document.querySelector('.main-content');
                
                if (window.orientation === 90 || window.orientation === -90) {
                    // 横屏模式
                    mainContent.classList.add('landscape');
                } else {
                    // 竖屏模式
                    mainContent.classList.remove('landscape');
                }
            }, 300);
        });
        
        // 添加折叠控制面板功能
        const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
        collapsibleHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('.toggle-icon');
                
                content.classList.toggle('active');
                icon.classList.toggle('active');
            });
        });
    }
    
    // 初始化
    function init() {
        // 设置默认选中的颜色
        colorButtons[0].classList.add('active');
        
        // 设置默认选中的滤镜
        filterButtons[0].classList.add('active');
        
        // 添加滤镜样式
        const style = document.createElement('style');
        style.textContent = `
            .filter-warm {
                background-color: rgba(255, 183, 77, 0.2);
            }
            .filter-cool {
                background-color: rgba(100, 181, 246, 0.2);
            }
            .filter-vintage {
                background-color: rgba(121, 85, 72, 0.15);
                filter: sepia(30%);
            }
            .filter-sepia {
                filter: sepia(70%);
            }
            .filter-grayscale {
                filter: grayscale(100%);
            }
            .filter-brightness {
                filter: brightness(120%);
            }
            .filter-contrast {
                filter: contrast(130%);
            }
        `;
        document.head.appendChild(style);
        
        // 初始化摄像头
        initCamera();
        
        // 初始化补光效果
        updateLightEffect();
        
        // 初始化美颜效果
        updateBeautyEffect();
    }
    
    // 启动应用
    init();
}); 