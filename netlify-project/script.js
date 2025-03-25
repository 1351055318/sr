document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const cardCover = document.getElementById('card-cover');
    const cardContainer = document.getElementById('card-container');
    const surpriseBtn = document.getElementById('surprise-btn');
    const surpriseMessage = document.getElementById('surprise-message');
    const fireworksCanvas = document.getElementById('fireworks');
    const ctx = fireworksCanvas.getContext('2d');
    const backBtn = document.getElementById('back-btn');
    const musicControl = document.getElementById('music-control');
    const themeToggle = document.getElementById('theme-toggle');
    const shareBtn = document.getElementById('share-btn');
    const bgMusic = document.getElementById('bgMusic');
    const balloons = document.querySelectorAll('.balloon');
    
    // 设置Canvas尺寸
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
    
    // 调整窗口大小时重设Canvas尺寸
    window.addEventListener('resize', function() {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    });
    
    // 点击蛋糕显示贺卡内容
    cardCover.addEventListener('click', function(e) {
        const cakeContainer = cardCover.querySelector('.cake-container');
        if (e.target === cakeContainer || cakeContainer.contains(e.target)) {
            cardCover.classList.add('hidden');
            cardContainer.classList.remove('hidden');
            
            // 自动播放音乐
            playBackgroundMusic();
            
            // 显示烟花效果
            createFireworks(3);
        }
    });
    
    // 点击返回按钮返回封面
    backBtn.addEventListener('click', function() {
        cardContainer.classList.add('hidden');
        cardCover.classList.remove('hidden');
    });
    
    // 点击气球飞走
    balloons.forEach(balloon => {
        balloon.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.add('fly-away');
            // 创建一个烟花在气球位置
            const rect = this.getBoundingClientRect();
            launchFirework(rect.left + rect.width/2, rect.top);
        });
        
        balloon.addEventListener('click', function() {
            this.classList.add('fly-away');
            // 创建一个烟花在气球位置
            const rect = this.getBoundingClientRect();
            launchFirework(rect.left + rect.width/2, rect.top);
        });
    });
    
    // 惊喜按钮点击事件 - 礼物盒打开动画
    surpriseBtn.addEventListener('click', function() {
        // 如果礼物盒已经打开，则不再执行
        if (this.classList.contains('open')) {
            return;
        }
        
        // 添加礼物盒打开动画
        this.classList.add('open');
        
        // 礼物盒打开后的抖动动画
        setTimeout(() => {
            this.style.animation = 'shake 0.5s ease-in-out';
        }, 500);
        
        // 配置打开音效
        playGiftOpenSound();
        
        // 等待礼物盒动画完成后显示惊喜内容
        setTimeout(() => {
            // 显示惊喜消息
            surpriseMessage.classList.remove('hidden');
            setTimeout(() => {
                surpriseMessage.classList.add('show');
            }, 10);
            
            // 礼物盒在显示惊喜后消失
            this.style.opacity = '0';
            this.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                this.style.display = 'none';
            }, 500);
            
            // 播放生日歌
            playBirthdaySong();
            
            // 触发烟花特效，数量更多
            createFireworks(12);
            
            // 滚动到惊喜内容
            surpriseMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // 设置滑动吹蜡烛事件
            setupBlowCandles();
        }, 800);
    });
    
    // 设置吹蜡烛的滑动事件
    function setupBlowCandles() {
        const cakeContainer = document.querySelector('.surprise-cake-container');
        const flames = document.querySelectorAll('.surprise-flame');
        const wishText = document.querySelector('.wish-text');
        
        let startX, startY;
        let blownCandles = 0;
        const totalCandles = flames.length;
        
        // 触摸开始事件
        cakeContainer.addEventListener('touchstart', handleTouchStart, false);
        cakeContainer.addEventListener('touchmove', handleTouchMove, false);
        
        // 鼠标事件 (桌面端)
        cakeContainer.addEventListener('mousedown', handleMouseDown, false);
        cakeContainer.addEventListener('mousemove', handleMouseMove, false);
        cakeContainer.addEventListener('mouseup', function() {
            startX = null;
            startY = null;
        }, false);
        
        function handleTouchStart(e) {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            e.preventDefault(); // 防止页面滚动
        }
        
        function handleMouseDown(e) {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        function handleTouchMove(e) {
            if (!startX || !startY) return;
            
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
            e.preventDefault();
        }
        
        function handleMouseMove(e) {
            if (!startX || !startY) return;
            
            handleMove(e.clientX, e.clientY);
        }
        
        function handleMove(currentX, currentY) {
            // 计算移动距离和速度
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const speed = distance / 50; // 调整灵敏度
            
            // 只有足够快的滑动才能吹灭蜡烛
            if (speed > 0.5) {
                // 检查每个蜡烛，判断是否被吹灭
                flames.forEach((flame, index) => {
                    if (!flame.classList.contains('blown')) {
                        const flameRect = flame.getBoundingClientRect();
                        const flameCenterX = flameRect.left + flameRect.width / 2;
                        const flameCenterY = flameRect.top + flameRect.height / 2;
                        
                        // 计算滑动方向与蜡烛的方向夹角
                        const angleToFlame = Math.atan2(flameCenterY - startY, flameCenterX - startX);
                        const angleOfMotion = Math.atan2(deltaY, deltaX);
                        
                        // 角度差的绝对值
                        let angleDiff = Math.abs(angleToFlame - angleOfMotion);
                        if (angleDiff > Math.PI) {
                            angleDiff = 2 * Math.PI - angleDiff;
                        }
                        
                        // 如果滑动方向与蜡烛方向大致一致，且滑动速度足够快
                        if (angleDiff < Math.PI / 4 && speed > 0.8) {
                            blowOutCandle(flame, index);
                            
                            // 播放吹灭音效
                            playBlowSound();
                            
                            // 增加已吹灭蜡烛计数
                            blownCandles++;
                            
                            // 检查是否全部吹灭
                            if (blownCandles === totalCandles) {
                                allCandlesBlown();
                            }
                        }
                    }
                });
                
                // 重置起始点，准备下一次滑动
                startX = currentX;
                startY = currentY;
            }
        }
        
        function blowOutCandle(flame, index) {
            // 添加吹灭动画
            flame.classList.add('blown');
            
            // 创建烟雾效果
            createSmoke(flame);
            
            // 触发小烟花
            const flameRect = flame.getBoundingClientRect();
            setTimeout(() => {
                launchFirework(
                    flameRect.left + flameRect.width / 2,
                    flameRect.top,
                    true
                );
            }, 300);
        }
        
        function createSmoke(flame) {
            const smokeParticles = 5;
            const flameRect = flame.getBoundingClientRect();
            const x = flameRect.left + flameRect.width / 2;
            const y = flameRect.top;
            
            for (let i = 0; i < smokeParticles; i++) {
                const smoke = document.createElement('div');
                smoke.className = 'smoke-particle';
                smoke.style.position = 'absolute';
                smoke.style.left = `${x}px`;
                smoke.style.top = `${y}px`;
                smoke.style.width = `${Math.random() * 10 + 5}px`;
                smoke.style.height = `${Math.random() * 10 + 5}px`;
                smoke.style.borderRadius = '50%';
                smoke.style.background = 'rgba(200, 200, 200, 0.4)';
                smoke.style.zIndex = '200';
                smoke.style.transform = 'translate(-50%, -50%)';
                smoke.style.animation = `smokeRise ${Math.random() * 2 + 1}s forwards`;
                
                document.body.appendChild(smoke);
                
                // 动画结束后移除烟雾元素
                setTimeout(() => {
                    smoke.remove();
                }, 3000);
            }
            
            // 添加烟雾动画样式
            if (!document.querySelector('#smoke-animation')) {
                const style = document.createElement('style');
                style.id = 'smoke-animation';
                style.textContent = `
                    @keyframes smokeRise {
                        0% {
                            transform: translate(-50%, -50%) scale(1);
                            opacity: 0.7;
                        }
                        100% {
                            transform: translate(${Math.random() * 40 - 20}px, -50px) scale(2);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        function playBlowSound() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioContext();
                
                // 创建噪声
                const bufferSize = 4096;
                const whiteNoise = audioCtx.createScriptProcessor(bufferSize, 1, 1);
                
                whiteNoise.onaudioprocess = function(e) {
                    const output = e.outputBuffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        output[i] = Math.random() * 0.15; // 低音量白噪声
                    }
                };
                
                const gainNode = audioCtx.createGain();
                gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                
                whiteNoise.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                // 自动在0.3秒后停止
                setTimeout(() => {
                    whiteNoise.disconnect();
                    gainNode.disconnect();
                }, 300);
                
            } catch (e) {
                console.log('无法播放吹灭音效:', e);
            }
        }
        
        function allCandlesBlown() {
            // 显示愿望文本
            setTimeout(() => {
                wishText.classList.remove('hidden');
                setTimeout(() => {
                    wishText.classList.add('show');
                }, 10);
                
                // 播放成功音效
                playSuccessSound();
                
                // 触发更多烟花
                createFireworks(15);
            }, 1000);
        }
        
        function playSuccessSound() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioContext();
                
                // 创建成功音效的音符
                const notes = [
                    { note: 'C5', duration: 0.1 },
                    { note: 'E5', duration: 0.1 },
                    { note: 'G5', duration: 0.1 },
                    { note: 'C6', duration: 0.3 }
                ];
                
                const frequencies = {
                    'C5': 523.25, 'E5': 659.25, 'G5': 783.99, 'C6': 1046.50
                };
                
                let time = audioCtx.currentTime;
                
                // 播放音符
                notes.forEach(n => {
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.value = frequencies[n.note];
                    
                    gainNode.gain.setValueAtTime(0.2, time);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, time + n.duration + 0.1);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    oscillator.start(time);
                    oscillator.stop(time + n.duration + 0.1);
                    
                    time += n.duration;
                });
            } catch (e) {
                console.log('无法播放成功音效:', e);
            }
        }
    }
    
    // 播放礼物盒打开音效
    function playGiftOpenSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            
            // 创建振荡器
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            // 配置音调
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5
            
            // 配置音量
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            
            // 连接节点
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            // 播放音效
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            console.log('无法播放音效:', e);
        }
    }
    
    // 音乐控制
    musicControl.addEventListener('click', function() {
        if (bgMusic.paused) {
            playBackgroundMusic();
        } else {
            bgMusic.pause();
            this.classList.remove('playing');
        }
    });
    
    // 播放背景音乐
    function playBackgroundMusic() {
        bgMusic.play().then(() => {
            musicControl.classList.add('playing');
        }).catch(err => {
            console.log('无法自动播放音乐:', err);
        });
    }
    
    // 主题切换
    let currentTheme = 0;
    const themes = ['', 'theme-blue', 'theme-purple', 'theme-green'];
    
    themeToggle.addEventListener('click', function() {
        // 移除当前主题
        document.body.classList.remove(themes[currentTheme]);
        
        // 切换到下一个主题
        currentTheme = (currentTheme + 1) % themes.length;
        
        // 应用新主题
        document.body.classList.add(themes[currentTheme]);
    });
    
    // 分享功能
    shareBtn.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: '妈妈，50岁生日快乐！',
                text: '我为妈妈制作的50岁生日贺卡，祝妈妈生日快乐！',
                url: window.location.href
            }).then(() => {
                console.log('分享成功');
            }).catch((error) => {
                console.log('分享失败:', error);
                alert('分享失败，请手动分享。');
            });
        } else {
            alert('您的浏览器不支持分享功能，请手动分享。');
        }
    });
    
    // 点击页面任意位置触发烟花
    document.addEventListener('click', function(e) {
        // 如果点击的不是按钮和控制元素
        if (e.target !== surpriseBtn && 
            !e.target.closest('.music-control') && 
            !e.target.closest('.theme-toggle') && 
            !e.target.closest('.share-btn') &&
            !e.target.closest('.cake-container') &&
            !e.target.closest('#back-btn') &&
            !e.target.closest('.gift-box') &&
            !e.target.closest('.surprise-cake-container')) {
            launchFirework(e.clientX, e.clientY);
        }
    });
    
    // 触摸事件支持
    document.addEventListener('touchstart', function(e) {
        // 防止默认行为，比如缩放
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // 播放生日歌
    function playBirthdaySong() {
        // 尝试通过Web Audio API创建简单的生日歌
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            
            const notes = [
                { note: 'C4', duration: 0.5 },
                { note: 'C4', duration: 0.5 },
                { note: 'D4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 2 },
                
                { note: 'C4', duration: 0.5 },
                { note: 'C4', duration: 0.5 },
                { note: 'D4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'F4', duration: 2 },
                
                { note: 'C4', duration: 0.5 },
                { note: 'C4', duration: 0.5 },
                { note: 'C5', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1.5 },
                
                { note: 'A#4', duration: 0.5 },
                { note: 'A#4', duration: 0.5 },
                { note: 'A4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'F4', duration: 2 }
            ];
            
            const frequencies = {
                'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
                'G4': 392.00, 'A4': 440.00, 'A#4': 466.16, 'C5': 523.25
            };
            
            let time = audioCtx.currentTime;
            
            // 播放音符
            notes.forEach(n => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.value = frequencies[n.note];
                
                gainNode.gain.setValueAtTime(0.3, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + n.duration);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.start(time);
                oscillator.stop(time + n.duration);
                
                time += n.duration;
            });
        } catch (e) {
            console.log('无法播放音频:', e);
        }
    }
    
    // 烟花粒子类
    class Particle {
        constructor(x, y, color, isSmall = false) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.radius = isSmall ? Math.random() * 1.5 + 0.5 : Math.random() * 2 + 1;
            this.velocity = {
                x: (isSmall ? Math.random() * 3 - 1.5 : Math.random() * 6 - 3),
                y: (isSmall ? Math.random() * 3 - 1.5 : Math.random() * 6 - 3)
            };
            this.gravity = isSmall ? 0.03 : 0.05;
            this.alpha = 1;
            this.decay = isSmall ? Math.random() * 0.03 + 0.02 : Math.random() * 0.02 + 0.015;
        }
        
        update() {
            this.velocity.y += this.gravity;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.decay;
            
            return this.alpha > 0;
        }
        
        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 烟花类
    class Firework {
        constructor(x, y, isSmall = false) {
            this.x = x;
            this.y = y;
            this.particles = [];
            this.isSmall = isSmall;
            this.createParticles();
        }
        
        createParticles() {
            const colors = [
                '#ff4081', '#ff6b6b', '#ffb86c', '#fdfd96',
                '#2ecc71', '#3498db', '#9b59b6', '#f1c40f'
            ];
            
            // 随机选择烟花颜色
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // 创建粒子
            const particleCount = this.isSmall ? 40 : 100;
            for (let i = 0; i < particleCount; i++) {
                this.particles.push(new Particle(this.x, this.y, color, this.isSmall));
            }
        }
        
        update() {
            this.particles = this.particles.filter(p => p.update());
            return this.particles.length > 0;
        }
        
        draw() {
            this.particles.forEach(p => p.draw());
        }
    }
    
    // 存储所有活跃的烟花
    const fireworks = [];
    
    // 创建随机烟花
    function createFireworks(count = 8) {
        // 创建多个烟花，随机位置
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const x = Math.random() * fireworksCanvas.width;
                const y = Math.random() * (fireworksCanvas.height * 0.6);
                launchFirework(x, y);
            }, i * 300);
        }
    }
    
    // 发射烟花
    function launchFirework(x, y, isSmall = false) {
        fireworks.push(new Firework(x, y, isSmall));
    }
    
    // 动画循环
    function animate() {
        // 清除画布，使用半透明黑色以创建拖尾效果
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
        
        // 更新并绘制所有烟花
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const fw = fireworks[i];
            fw.draw();
            if (!fw.update()) {
                fireworks.splice(i, 1);
            }
        }
        
        // 继续动画循环
        requestAnimationFrame(animate);
    }
    
    // 如果是移动端，自动进入全屏模式
    function requestFullScreen() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            const docElm = document.documentElement;
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            }
        }
    }
    
    // 当用户交互时尝试进入全屏
    document.addEventListener('click', function() {
        requestFullScreen();
    }, { once: true });
    
    // 添加礼物盒抖动动画
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = `
    @keyframes shake {
        0%, 100% { transform: rotate(0deg); }
        20% { transform: rotate(-10deg); }
        40% { transform: rotate(5deg); }
        60% { transform: rotate(-5deg); }
        80% { transform: rotate(3deg); }
    }`;
    document.head.appendChild(styleSheet);
    
    // 启动动画
    animate();
}); 