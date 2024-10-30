const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

// 设置画布尺寸为全屏
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// 烟花粒子类
class Particle {
    constructor(x, y, color, type = 'normal') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.size = Math.random() * 3 + 1;
        
        if (type === 'normal') {
            this.velocity = {
                x: (Math.random() - 0.5) * 6,
                y: (Math.random() - 0.5) * 6
            };
        } else if (type === 'circle') {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            this.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
        } else if (type === 'heart') {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 0.5;
            this.angle = angle;
            this.speed = speed;
            this.curve = Math.random() * 2 + 0.5;
        }
        
        this.alpha = 1;
        this.decay = Math.random() * 0.01 + 0.005;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.fill();
    }

    update() {
        if (this.type === 'normal' || this.type === 'circle') {
            this.velocity.y += 0.05;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        } else if (this.type === 'heart') {
            this.angle += 0.02;
            this.x += Math.cos(this.angle) * this.curve;
            this.y += Math.sin(this.angle) * this.curve + 0.3;
        }
        
        this.alpha -= this.decay;
    }
}

// 存储所有烟花粒子
let particles = [];

// 随机颜色
function randomColor() {
    const colors = [
        '255, 182, 193',    // 粉红
        '255, 192, 203',    // 浅粉红
        '255, 20, 147',     // 深粉红
        '255, 105, 180',    // 热粉红
        '255, 0, 255',      // 紫红
        '255, 215, 0',      // 金色
        '0, 191, 255',      // 深天蓝
        '127, 255, 212',    // 碧绿
        '255, 69, 0',       // 红橙
        '148, 0, 211'       // 紫罗兰
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 创建烟花
function createFirework(x, y) {
    const types = ['normal', 'circle', 'heart'];
    const type = types[Math.floor(Math.random() * types.length)];
    const color = randomColor();
    const particleCount = type === 'normal' ? 150 : type === 'circle' ? 200 : 120;
    
    // 创建主烟花
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, color, type));
    }
    
    // 增加闪光效果
    for (let i = 0; i < 30; i++) {
        const sparkle = new Particle(x, y, '255, 255, 255');
        sparkle.velocity = {
            x: (Math.random() - 0.5) * 3,
            y: (Math.random() - 0.5) * 3
        };
        sparkle.decay = 0.05;
        particles.push(sparkle);
    }
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(particle => particle.alpha > 0);
    particles.forEach(particle => {
        particle.draw();
        particle.update();
    });
}

// 点击创建烟花
canvas.addEventListener('click', (e) => {
    createFirework(e.clientX, e.clientY);
});

// 自动创建烟花
setInterval(() => {
    const numFireworks = Math.floor(Math.random() * 3) + 2; // 随机创建2-4个烟花
    for (let i = 0; i < numFireworks; i++) {
        createFirework(
            Math.random() * canvas.width,
            Math.random() * canvas.height * 0.6
        );
    }
}, 1500); // 缩短间隔到1.5秒

// 添加鼠标移动触发效果
let mouseX = 0;
let mouseY = 0;
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// 开始动画
animate();

// 在文件开头添加音乐控制代码
const bgMusic = document.getElementById('bgMusic');
const musicControl = document.getElementById('musicControl');
let isMusicPlaying = false;

musicControl.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicControl.textContent = '播放音乐';
    } else {
        bgMusic.play();
        musicControl.textContent = '暂停音乐';
    }
    isMusicPlaying = !isMusicPlaying;
});

// 添加音乐自动播放（需要用户交互后才能播放）
document.addEventListener('click', () => {
    if (!isMusicPlaying) {
        bgMusic.play();
        musicControl.textContent = '暂停音乐';
        isMusicPlaying = true;
    }
}, { once: true });

// 设置音量
bgMusic.volume = 0.5;

// 修改轮播图相关代码
const slideshow = document.getElementById('slideshow');
const debugInfo = document.getElementById('debugInfo');
debugInfo.style.display = 'block'; // 显示调试信息

const images = [
    'file:///C:/Users/33012/Desktop/image/1.jpg',
    'file:///C:/Users/33012/Desktop/image/2.jpg',
    'file:///C:/Users/33012/Desktop/image/4.jpg',
    'file:///C:/Users/33012/Desktop/image/5.jpg',
    'file:///C:/Users/33012/Desktop/image/6.jpg',
    'file:///C:/Users/33012/Desktop/image/7.jpg',
    'file:///C:/Users/33012/Desktop/image/8.jpg',
    'file:///C:/Users/33012/Desktop/image/9.jpg',
    'file:///C:/Users/33012/Desktop/image/10.jpg'
];

// 创建并添加图片元素
images.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    
    // 添加加载错误处理
    img.onerror = function() {
        console.error(`图片${index + 1}加载失败，请检查文件是否存在:`, src);
        // 尝试重新加载一次
        setTimeout(() => {
            img.src = src;
        }, 1000);
    };
    
    // 添加加载成功处理
    img.onload = function() {
        console.log(`图片${index + 1}加载成功`);
    };
    
    slideshow.appendChild(img);
});

// 轮播函数
let currentImageIndex = 0;
const allImages = slideshow.getElementsByTagName('img');

function showNextImage() {
    // 移除当前图片的active类
    allImages[currentImageIndex].classList.remove('active');
    allImages[currentImageIndex].style.opacity = '0';
    
    // 更新索引，确保循环
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
    
    // 添加active类到新图片
    allImages[currentImageIndex].classList.add('active');
    allImages[currentImageIndex].style.opacity = '0.9';
}

// 显示第一张图片
allImages[0].classList.add('active');
allImages[0].style.opacity = '0.9';

// 创建轮播定时器
function startSlideshow() {
    return setInterval(showNextImage, 4000);
}

// 初始化轮播
let interval = startSlideshow();

// 优化键盘控制
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        // 上一张图片
        allImages[currentImageIndex].classList.remove('active');
        allImages[currentImageIndex].style.opacity = '0';
        currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
        allImages[currentImageIndex].classList.add('active');
        allImages[currentImageIndex].style.opacity = '0.9';
        
        // 重置定时器
        clearInterval(interval);
        interval = startSlideshow();
    } else if (e.key === 'ArrowRight') {
        // 下一张图片
        showNextImage();
        // 重置定时器
        clearInterval(interval);
        interval = startSlideshow();
    } else if (e.key === 'Space') {
        // 空格键暂停/继续轮播
        e.preventDefault();
        if (interval) {
            clearInterval(interval);
            interval = null;
        } else {
            interval = startSlideshow();
        }
    }
});