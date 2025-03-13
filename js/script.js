// 导航逻辑
const pages = ['home', 'picker', 'more'];
const navButtons = {
  home: document.getElementById('navHome'),
  picker: document.getElementById('navPicker'),
  more: document.getElementById('navMore')
};

// 页面标题映射
const pageTitles = {
  home: '调色板',
  picker: '图片取色',
  more: '优选柬帖'
};

let currentPage = 'home';
const pageTitleElement = document.getElementById('pageTitle');

// 获取设置按钮和侧边页
const settingsButton = document.getElementById('settingsButton');
const sidebar = document.getElementById('sidebar');
const sidebarButtons = sidebar.querySelectorAll('button');

// 定义默认图片 URL
const defaultImageURL = 'svg/01.png';
let defaultImageLoaded = false; // 标志是否已加载默认图片

// 相机功能变量
let stream = null;

// 初始化页面显示
function initializePage() {
  const defaultPage = getDefaultPage();
  showPage(defaultPage);

  // 激活侧边页按钮状态
  sidebarButtons.forEach(button => {
    if (button.getAttribute('data-page') === defaultPage) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

// 获取设置默认启动页面
function getDefaultPage() {
  const savedPage = localStorage.getItem('defaultPage');
  if (savedPage && pages.includes(savedPage)) {
    return savedPage;
  }
  return 'home'; // 默认调色板页
}

// 设置默认启动页面（移除 alert）
function setDefaultPage(page) {
  if (pages.includes(page)) {
    localStorage.setItem('defaultPage', page);
    // 移除 alert 提示
    // 如果需要显示提示，可以使用 showPopup，比如：
    // showPopup(`默认启动页面已设置为 ${pageTitles[page]}。下次启动将显示该页面。`);
  }
}

// 切换显示页面函数
function showPage(page) {
  if (page === currentPage) return; // 如果点击当前页面，忽略

  const outgoingPage = document.getElementById(currentPage);
  const incomingPage = document.getElementById(page);

  // 添加退出动画
  outgoingPage.classList.remove('fade-in');
  outgoingPage.classList.add('fade-out');

  // 移除当前页面的active和导航按钮的active
  navButtons[currentPage].classList.remove('active');

  // 监听退出动画结束
  outgoingPage.addEventListener('animationend', function handleFadeOut() {
    outgoingPage.classList.remove('active', 'fade-out');
    outgoingPage.removeEventListener('animationend', handleFadeOut);
  });

  // 添加进入动画
  incomingPage.classList.add('active', 'fade-in');

  // 更新导航按钮的active状态
  navButtons[page].classList.add('active');

  // 更新当前页面
  currentPage = page;

  // 更新页面标题
  pageTitleElement.textContent = pageTitles[page];

  // 根据不同页面执行特定功能
  switch(page) {
    case 'more':
      generateRecommendedCards();
      initializeIntersectionObserver();
      break;
    case 'picker':
      if (!defaultImageLoaded) {
        loadDefaultImage();
        defaultImageLoaded = true;
      }
      break;
    default:
      break;
  }
}

// 添加导航按钮事件监听
navButtons.home.addEventListener('click', () => showPage('home'));
navButtons.picker.addEventListener('click', () => showPage('picker'));
navButtons.more.addEventListener('click', () => showPage('more'));

// 侧边栏切换功能
settingsButton.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  if (sidebar.classList.contains('active')) {
    // 推入一个新的历史状态
    history.pushState({sidebar: true}, '');
  }
});

// 侧边页设置按钮事件监听
sidebarButtons.forEach(button => {
  button.addEventListener('click', () => {
    const page = button.getAttribute('data-page');
    setDefaultPage(page);
    showPage(page);
    // 更新按钮激活状态
    sidebarButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    sidebar.classList.remove('active');
  });
});

// 处理移动端返回键关闭侧边页
window.addEventListener('popstate', (event) => {
  if (sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
    // 阻止历史回退
    history.replaceState(null, '');
  } else {
    // 允许回退到上一页面
    history.back();
  }
});

// 清空图片并恢复默认图片
function clearUploadedImage() {
  const imageInput = document.getElementById('imageInput');
  imageInput.value = '';
  const uploadedImage = document.getElementById('uploadedImage');
  uploadedImage.src = defaultImageURL;
  uploadedImage.style.display = 'block';
  const extractedColors = document.getElementById('extractedColors');
  extractedColors.innerHTML = '';
  const canvas = document.getElementById('imageCanvas');
  canvas.width = uploadedImage.naturalWidth;
  canvas.height = uploadedImage.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
  const clickedColorDisplay = document.getElementById('clickedColorDisplay');
  clickedColorDisplay.style.backgroundColor = '#AFC1FF';
}

// 监听清空按钮点击事件
document.addEventListener('DOMContentLoaded', function() {
  const clearButton = document.querySelector('.btnqc');
  if (clearButton) {
    clearButton.addEventListener('click', clearUploadedImage);
  }
});


// 首页调色...
const redRange = document.getElementById('redRange');
const greenRange = document.getElementById('greenRange');
const blueRange = document.getElementById('blueRange');
const brightnessRange = document.getElementById('brightnessRange');

const redValue = document.getElementById('redValue');
const greenValue = document.getElementById('greenValue');
const blueValue = document.getElementById('blueValue');
const brightnessValue = document.getElementById('brightnessValue');

const colorCard = document.getElementById('colorCard');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');

const hexInput = document.getElementById('hexInput');
const copyButton = document.getElementById('copyButton');
const randomButton = document.getElementById('randomButton');

// 设置滑块进度背景的函数
function setRangeBackground(rangeInput, color) {
  const value = ((rangeInput.value - rangeInput.min) / (rangeInput.max - rangeInput.min)) * 100;
  rangeInput.style.background = `linear-gradient(to right, ${color} ${value}%, #ddd ${value}%)`;
}

// 更新颜色并滑块背景
function updateColor() {
  const r = parseInt(redRange.value);
  const g = parseInt(greenRange.value);
  const b = parseInt(blueRange.value);
  const brightness = parseInt(brightnessRange.value);
  
  // 更新颜色显示
  const colorCard = document.getElementById('colorCard');
  colorCard.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  
  // 获取最接近的比色卡编号
  const closestColor = getClosestColorName(r, g, b);
  
  // 更新显示值
  document.getElementById('redValue').textContent = closestColor;
  document.getElementById('greenValue').textContent = '';
  document.getElementById('blueValue').textContent = '';
  document.getElementById('brightnessValue').textContent = '';
  
  // 更新HEX值显示
  const hexInput = document.getElementById('hexInput');
  const rgbValue = document.getElementById('rgbValue');
  const hexValue = document.getElementById('hexValue');
  
  hexInput.value = closestColor;
  rgbValue.textContent = closestColor;
  hexValue.textContent = closestColor;
  
  // 更新互补色
  updateComplementaryColors(r, g, b);
}

// 初始化滑块背景
function initializeSliders() {
  setRangeBackground(redRange, 'red');
  setRangeBackground(greenRange, 'green');
  setRangeBackground(blueRange, 'blue');
  setRangeBackground(brightnessRange, '#999');
}

// 生成随机颜色并更新滑块和颜色展示
function setRandomColor() {
  const randR = Math.floor(Math.random() * 256);
  const randG = Math.floor(Math.random() * 256);
  const randB = Math.floor(Math.random() * 256);
  const brightness = 255; // 亮度默认为255

  redRange.value = randR;
  greenRange.value = randG;
  blueRange.value = randB;
  brightnessRange.value = brightness;

  redValue.textContent = randR;
  greenValue.textContent = randG;
  greenValue.textContent = randB;
  brightnessValue.textContent = brightness;

  updateColor();

  // 更新滑块背景
  setRangeBackground(redRange, 'red');
  setRangeBackground(greenRange, 'green');
  setRangeBackground(blueRange, 'blue');
  setRangeBackground(brightnessRange, '#666');
}

// 自动生成随机颜色以初始化页面
setRandomColor();
initializeSliders();

// 监听滑块输入事件
[redRange, greenRange, blueRange, brightnessRange].forEach((slider, index) => {
  let color;
  switch(index) {
    case 0:
      color = 'red';
      break;
    case 1:
      color = 'green';
      break;
    case 2:
      color = 'blue';
      break;
    case 3:
      color = '#666';
      break;
    default:
      color = '#4CAF50';
  }
  slider.addEventListener('input', () => {
    updateColor();
    // 更新滑块值显示
    redValue.textContent = redRange.value;
    greenValue.textContent = greenRange.value;
    blueValue.textContent = blueRange.value;
    brightnessValue.textContent = brightnessRange.value;
    // 更新滑块背景
    setRangeBackground(slider, color);
  });
});

// HEX输入框功能
hexInput.addEventListener('input', () => {
  let hex = hexInput.value.trim().toUpperCase();
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  hex = hex.replace(/[^0-9A-F]/g, '');
  hexInput.value = hex;

  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    const brightness = parseInt(brightnessRange.value);
    const adjustedR = Math.round(r * brightness / 255);
    const adjustedG = Math.round(g * brightness / 255);
    const adjustedB = Math.round(b * brightness / 255);

    redRange.value = adjustedR;
    greenRange.value = adjustedG;
    blueRange.value = adjustedB;

    redValue.textContent = adjustedR;
    greenValue.textContent = adjustedG;
    greenValue.textContent = adjustedB;

    updateColor();

    setRangeBackground(redRange, 'red');
    setRangeBackground(greenRange, 'green');
    setRangeBackground(blueRange, 'blue');
  }
});

// 复制按钮功能
copyButton.addEventListener('click', () => {
  const hexCode = hexValue.textContent.replace('HEX: ', '');
  copyToClipboard(hexCode);
});

// 随机按钮功能
randomButton.addEventListener('click', () => {
  setRandomColor();
});

updateColor();
initializeSliders();

// 取色页功能
const imageInput = document.getElementById('imageInput');
const uploadButton = document.getElementById('uploadButton'); 
const cameraButton = document.getElementById('cameraButton');
const cameraInput = document.getElementById('cameraInput');
const uploadedImage = document.getElementById('uploadedImage');
const extractedColors = document.getElementById('extractedColors');
const colorThief = new ColorThief();

uploadButton.addEventListener('click', () => {
  imageInput.click();
});

// 处理相机按钮点击
cameraButton.addEventListener('click', async () => {
  const cameraPreview = document.getElementById('cameraPreview');
  const videoElement = document.getElementById('videoElement');
  
  try {
    // 如果相机已经打开，则关闭它
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
      cameraPreview.style.display = 'none';
      return;
    }

    // 请求相机权限并获取视频流
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment' // 优先使用后置相机
      }
    });
    
    // 显示相机预览
    videoElement.srcObject = stream;
    cameraPreview.style.display = 'flex';
    
  } catch (err) {
    console.error('相机访问失败:', err);
    showPopup('无法访问相机，请确保已授予相机权限');
  }
});

// 处理拍照按钮点击
document.getElementById('takePhotoButton').addEventListener('click', () => {
  if (!stream) return;
  
  const videoElement = document.getElementById('videoElement');
  const canvas = document.getElementById('imageCanvas');
  const context = canvas.getContext('2d');
  
  // 设置canvas尺寸为视频的实际尺寸
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  // 在canvas上绘制当前视频帧
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  // 将canvas内容转换为图片
  const imageData = canvas.toDataURL('image/png');
  uploadedImage.src = imageData;
  uploadedImage.style.display = 'block';
  
  // 提取颜色
  extractColorsFromImage(uploadedImage);
  
  // 关闭相机预览
  stream.getTracks().forEach(track => track.stop());
  stream = null;
  document.getElementById('cameraPreview').style.display = 'none';
});

// 处理关闭相机按钮点击
document.getElementById('closeCameraButton').addEventListener('click', () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  document.getElementById('cameraPreview').style.display = 'none';
});

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImage.src = e.target.result;
      uploadedImage.style.display = 'block';
      uploadedImage.onload = function() {
        const canvas = document.getElementById('imageCanvas');
        canvas.width = uploadedImage.naturalWidth;
        canvas.height = uploadedImage.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
        extractColorsFromImage(uploadedImage);
      }
    };
    reader.readAsDataURL(file);
  }
}

function loadDefaultImage() {
  if (uploadedImage.src === defaultImageURL) return; // 避免重复加载
  
  uploadedImage.src = defaultImageURL;
  uploadedImage.style.display = 'block';
  
  const loadHandler = function() {
    const canvas = document.getElementById('imageCanvas');
    canvas.width = uploadedImage.naturalWidth;
    canvas.height = uploadedImage.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    extractColorsFromImage(uploadedImage);
    
    // 初始化颜色卡片显示
    const clickedColorCard = document.getElementById('clickedColorCard');
    const clickedColorDisplay = document.getElementById('clickedColorDisplay');
    const clickedHexValue = document.getElementById('clickedHexValue');
    const clickedRgbValue = document.getElementById('clickedRgbValue');
    const closestColorName = document.getElementById('closestColorName');

    clickedColorDisplay.style.backgroundColor = '';
    clickedHexValue.textContent = '';
    clickedRgbValue.textContent = '';
    closestColorName.textContent = '比色卡编号';
    clickedColorCard.style.display = 'block';
    
    uploadedImage.removeEventListener('load', loadHandler);
  };
  
  uploadedImage.addEventListener('load', loadHandler);
  
  uploadedImage.onerror = function() {
    extractedColors.innerHTML = '<p>文件丢失加载失败 !!!</p>';
    uploadedImage.removeEventListener('load', loadHandler);
  };
}

function extractColorsFromImage(image) {
  const canvas = document.getElementById('imageCanvas');
  const ctx = canvas.getContext('2d');
  const extractedColors = document.getElementById('extractedColors');
  
  // 清空之前的颜色
  extractedColors.innerHTML = '';
  
  // 创建DocumentFragment以优化DOM操作
  const fragment = document.createDocumentFragment();
  
  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const colorMap = new Map();
  
  // 统计颜色出现次数
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const rgb = `${r},${g},${b}`;
    
    colorMap.set(rgb, (colorMap.get(rgb) || 0) + 1);
  }
  
  // 转换为数组并排序
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20); // 只显示前20种最常见的颜色
  
  // 创建颜色展示元素
  sortedColors.forEach(([rgb]) => {
    const [r, g, b] = rgb.split(',').map(Number);
    const colorName = getClosestColorName(r, g, b);
    
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = `rgb(${r},${g},${b})`;
    
    const label = document.createElement('p');
    label.textContent = colorName;
    swatch.appendChild(label);
    
    fragment.appendChild(swatch);
  });
  
  extractedColors.appendChild(fragment);
  extractedColors.style.display = 'flex';
}

const recommendedCards = document.getElementById('recommendedCards');

function generateRecommendedCards() {
  if (recommendedCards.childElementCount > 0) return;

  for (let i = 0; i < 100; i++) {
    const card = document.createElement('div');
    card.classList.add('recommended-card');

    const swatches = document.createElement('div');
    swatches.classList.add('swatches');
    const hexCodes = [];

    for (let j = 0; j < 5; j++) {
      const swatch = document.createElement('div');
      swatch.classList.add('swatch');
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      swatch.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
      swatch.dataset.hex = hex;
      hexCodes.push(hex);
      swatches.appendChild(swatch);
    }

    const hexDisplay = document.createElement('p');
    hexDisplay.classList.add('hex-display');
    hexDisplay.textContent = hexCodes.length > 0 ? hexCodes[0] : '';
    if (hexCodes.length > 0) {
      hexDisplay.style.borderBottomColor = hexCodes[0]; // 设置初始边框颜色
    }

    const copyBtn = document.createElement('button');
    copyBtn.classList.add('copy-button');
    copyBtn.textContent = '';

    swatches.querySelectorAll('.swatch').forEach((swatch, index) => {
      swatch.addEventListener('click', () => {
        const selectedHex = swatch.dataset.hex;
        hexDisplay.textContent = selectedHex;
        hexDisplay.style.borderBottomColor = selectedHex; // 更新边框颜色
      });
    });

    copyBtn.addEventListener('click', () => {
      const hexToCopy = hexDisplay.textContent;
      if (hexToCopy) {
        copyToClipboard(hexToCopy);
      } else {
        showPopup('请先选择一个颜色进行复制。');
      }
    });

    card.appendChild(swatches);
    card.appendChild(hexDisplay);
    card.appendChild(copyBtn);
    recommendedCards.appendChild(card);
  }
}

function initializeIntersectionObserver() {
  const cards = document.querySelectorAll('.recommended-card');
  
  const options = {
    root: document.getElementById('more'),
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, options);

  cards.forEach(card => {
    observer.observe(card);
  });
}

// 替代方案复制函数（统一使用）
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showPopup(`HEX 颜色 ${text} 已复制 !`);
    }).catch(err => {
      console.error('复制失败:', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

// 替代方案复制函数
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // 隐藏textarea，避免影响页面布局
  textArea.style.position = 'fixed';
  textArea.style.top = '-1000px';
  textArea.style.left = '-1000px';
  textArea.setAttribute('readonly', ''); // 只读，避免触发输入法
  
  document.body.appendChild(textArea);
  
  // 不调用focus()，避免触发输入法
  // textArea.focus(); // 移除或注释掉这一行
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showPopup('颜色码已复制！');
    } else {
      showPopup('复制失败，请手动复制。');
    }
  } catch (err) {
    console.error('复制失败:', err);
    showPopup('复制失败，请手动复制。');
  }
  
  document.body.removeChild(textArea);
}


// 图片取色页功能：点击图片获取颜色
function initializeImageClick() {
  const uploadedImage = document.getElementById('uploadedImage');
  const canvas = document.getElementById('imageCanvas');
  const clickedColorCard = document.getElementById('clickedColorCard');
  const clickedColorDisplay = document.getElementById('clickedColorDisplay');
  const clickedHexValue = document.getElementById('clickedHexValue');
  const clickedRgbValue = document.getElementById('clickedRgbValue');
  const closestColorName = document.getElementById('closestColorName');
  let currentMarker = null;

  uploadedImage.addEventListener('click', function(e) {
    // 移除旧的标记
    if (currentMarker) {
      currentMarker.remove();
    }

    // 创建新的标记
    const marker = document.createElement('div');
    marker.className = 'color-marker';
    marker.style.left = e.offsetX + 'px';
    marker.style.top = e.offsetY + 'px';
    e.target.parentElement.appendChild(marker);
    currentMarker = marker;

    // 获取点击位置的颜色
    const rect = uploadedImage.getBoundingClientRect();
    const x = e.offsetX * (canvas.width / uploadedImage.width);
    const y = e.offsetY * (canvas.height / uploadedImage.height);
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = pixel;

    // 获取最接近的比色卡编号
    const closestColor = getClosestColorName(r, g, b);

    // 更新显示
    clickedColorDisplay.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    clickedHexValue.textContent = '';
    clickedRgbValue.textContent = '';
    closestColorName.textContent = closestColor;
    clickedColorCard.style.display = 'block';
  });
}

// 显示颜色对应的图片
function showColorImage(colorName) {
  const imageDisplay = document.getElementById('colorImageDisplay');
  const colorImage = document.getElementById('colorMatchImage');
  
  // 移除颜色名称末尾的A、B、C、D后缀
  const formattedName = colorName.replace(/\s+[ABCD]$/, '').trim();
  
  console.log('原始颜色名称:', colorName);
  console.log('格式化后的名称:', formattedName);
  
  // 尝试不同的图片格式
  const formats = ['jpg', 'png', 'jpeg', 'webp'];
  let loadAttempts = 0;
  
  function tryLoadImage(format) {
    const imagePath = `images/${formattedName}.${format}`;
    console.log(`尝试加载图片 (${format}):`, imagePath);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = function() {
        console.log(`图片加载成功 (${format}):`, imagePath);
        colorImage.src = imagePath;
        imageDisplay.style.display = 'block';
        resolve(true);
      };
      
      img.onerror = function() {
        console.log(`图片加载失败 (${format}):`, imagePath);
        reject();
      };
      
      img.src = imagePath;
    });
  }
  
  async function tryAllFormats() {
    for (const format of formats) {
      try {
        await tryLoadImage(format);
        return; // 如果成功加载，直接返回
      } catch (e) {
        loadAttempts++;
        continue; // 尝试下一个格式
      }
    }
    
    // 所有格式都尝试失败
    if (loadAttempts === formats.length) {
      console.log('所有图片格式加载失败');
      console.log('请确保图片文件存在于images文件夹中');
      console.log('图片命名应该为:', formattedName + '.[jpg/png/jpeg/webp]');
      imageDisplay.style.display = 'none';
    }
  }
  
  tryAllFormats();
}

// 关闭图片显示
document.addEventListener('DOMContentLoaded', function() {
  const imageDisplay = document.getElementById('colorImageDisplay');
  
  // 点击关闭按钮关闭图片
  imageDisplay.addEventListener('click', function(e) {
    if (e.target === imageDisplay || e.target.closest('.color-image-display::after')) {
      imageDisplay.style.display = 'none';
    }
  });
});

// 修改getClosestColorName函数，在返回颜色名称时同时显示图片
function getClosestColorName(r, g, b) {
  const colors = [
    { name: "BLUE-GREEN GROUP 111 A", rgb: [0, 125, 189] },
    { name: "BLUE-GREEN GROUP 111 B", rgb: [0, 188, 240] },
    { name: "BLUE-GREEN GROUP 111 C", rgb: [85, 214, 253] },
    { name: "BLUE-GREEN GROUP 111 D", rgb: [161, 236, 255] },
    { name: "BLUE-GREEN GROUP 112 A", rgb: [197, 244, 253] },
    { name: "BLUE-GREEN GROUP 112 B", rgb: [230, 255, 253] },
    { name: "BLUE-GREEN GROUP 112 C", rgb: [241, 255, 255] },
    { name: "BLUE-GREEN GROUP 112 D", rgb: [249, 255, 255] },
    { name: "BLUE-GREEN GROUP 113 A", rgb: [0, 133, 178 ]},
    { name: "BLUE-GREEN GROUP 113 B", rgb: [0, 162, 208] },
    { name: "BLUE-GREEN GROUP 113 C", rgb: [88, 215, 247] },
    { name: "BLUE-GREEN GROUP 113 D", rgb: [225, 255, 255] },
    { name: "BLUE-GREEN GROUP 114 A", rgb: [0, 55, 100] },
    { name: "BLUE-GREEN GROUP 114 B", rgb: [0 ,82, 121] },
    { name: "BLUE-GREEN GROUP 114 C", rgb: [0, 108, 147] },
    { name: "BLUE-GREEN GROUP 114 D", rgb: [0, 139, 180] },
    { name: "BLUE-GREEN GROUP 115 A", rgb: [0, 130, 170] },
    { name: "BLUE-GREEN GROUP 115 B", rgb: [60, 150, 180] },
    { name: "BLUE-GREEN GROUP 115 C", rgb: [119, 176, 203] },
    { name: "BLUE-GREEN GROUP 115 D", rgb: [181, 216, 236] },
    { name: "BLUE-GREEN GROUP 116 A", rgb: [0, 78, 117] },
    { name: "BLUE-GREEN GROUP 116 B", rgb: [0, 92, 131] },
    { name: "BLUE-GREEN GROUP 116 C", rgb: [0, 119, 149] },
    { name: "BLUE-GREEN GROUP 116 D", rgb: [70, 146, 169] },
    { name: "BLUE-GREEN GROUP 117 A", rgb: [95, 205, 232] },
    { name: "BLUE-GREEN GROUP 117 B", rgb: [142, 230, 252] },
    { name: "BLUE-GREEN GROUP 117 C", rgb: [187, 245, 255] },
    { name: "BLUE-GREEN GROUP 117 D", rgb: [205, 253, 255] },
    { name: "BLUE-GREEN GROUP 118 A", rgb: [0, 142, 182] },
    { name: "BLUE-GREEN GROUP 118 B", rgb: [0, 175, 209] },
    { name: "BLUE-GREEN GROUP 118 C", rgb: [77, 212, 241] },
    { name: "BLUE-GREEN GROUP 118 D", rgb: [208, 252, 255] },
    { name: "BLUE-GREEN GROUP 119 A", rgb: [1, 132, 152] },
    { name: "BLUE-GREEN GROUP 119 B", rgb: [64, 159, 177] },
    { name: "BLUE-GREEN GROUP 119 C", rgb: [102, 182, 195] },
    { name: "BLUE-GREEN GROUP 119 D", rgb: [150, 223, 232] },
    { name: "BLUE-GREEN GROUP 120 A", rgb: [1, 145, 172] },
    { name: "BLUE-GREEN GROUP 120 B", rgb: [1, 163, 184] },
    { name: "BLUE-GREEN GROUP 120 C", rgb: [76, 198, 211] },
    { name: "BLUE-GREEN GROUP 120 D", rgb: [202, 246, 247] },
    { name: "BLUE-GREEN GROUP 121 A", rgb: [0, 159, 180] },
    { name: "BLUE-GREEN GROUP 121 B", rgb: [84, 195, 211] },
    { name: "BLUE-GREEN GROUP 121 C", rgb: [142, 220, 232] },
    { name: "BLUE-GREEN GROUP 121 D", rgb: [205, 244, 249] },
    { name: "BLUE-GREEN GROUP 122 A", rgb: [68, 140, 146] },
    { name: "BLUE-GREEN GROUP 122 B", rgb: [97, 158, 161] },
    { name: "BLUE-GREEN GROUP 122 C", rgb: [157, 203, 205] },
    { name: "BLUE-GREEN GROUP 122 D", rgb: [208, 241, 246] },
    { name: "BLUE-GREEN GROUP 123 A", rgb: [92, 215, 215] },
    { name: "BLUE-GREEN GROUP 123 B", rgb: [137, 235, 236] },
    { name: "BLUE-GREEN GROUP 123 C", rgb: [194, 254, 252] },
    { name: "BLUE-GREEN GROUP 123 D", rgb: [219, 255, 255] },
    { name: "BLUE-GREEN GROUP 124 A", rgb: [1, 152, 147] },
    { name: "BLUE-GREEN GROUP 124 B", rgb: [0, 185, 180] },
    { name: "BLUE-GREEN GROUP 124 C", rgb: [104, 214, 205] },
    { name: "BLUE-GREEN GROUP 124 D", rgb: [216, 255, 255] },
    { name: "GREEN GROUP 125 A", rgb: [0, 138, 113] },
    { name: "GREEN GROUP 125 B", rgb: [0, 174, 149] },
    { name: "GREEN GROUP 125 C", rgb: [0, 236, 216] },
    { name: "GREEN GROUP 125 D", rgb: [94, 255, 239] },
    { name: "GREEN GROUP 126 A", rgb: [0, 82, 76] },
    { name: "GREEN GROUP 126 B", rgb: [0, 114, 106] },
    { name: "GREEN GROUP 126 C", rgb: [1, 137, 127] },
    { name: "GREEN GROUP 126 D", rgb: [7, 167, 159] },
    { name: "GREEN GROUP 127 A", rgb: [1, 95, 81] },
    { name: "GREEN GROUP 127 B", rgb: [0, 132, 111] },
    { name: "GREEN GROUP 127 C", rgb: [1, 154, 133] },
    { name: "GREEN GROUP 127 D", rgb: [0, 182, 160] },
    { name: "GREEN GROUP 128 A", rgb: [0, 170, 128] },
    { name: "GREEN GROUP 128 B", rgb: [3, 194, 163] },
    { name: "GREEN GROUP 128 C", rgb: [116, 229, 201] },
    { name: "GREEN GROUP 128 D", rgb: [227, 243, 246] },
    { name: "GREEN GROUP 129 A", rgb: [0, 173, 120] },
    { name: "GREEN GROUP 129 B", rgb: [0, 16, 166] },
    { name: "GREEN GROUP 129 C", rgb: [83, 234, 193] },
    { name: "GREEN GROUP 129 D", rgb: [190, 253, 226] },
    { name: "GREEN GROUP 130 A", rgb: [2, 198, 129] },
    { name: "GREEN GROUP 130 B", rgb: [67, 224, 168] },
    { name: "GREEN GROUP 130 C", rgb: [137, 239, 197] },
    { name: "GREEN GROUP 130 D", rgb: [231, 255, 239] },
    { name: "GREEN GROUP 131 A", rgb: [0, 46, 33] },
    { name: "GREEN GROUP 131 B", rgb: [0, 73, 43] },
    { name: "GREEN GROUP 131 C", rgb: [0, 94, 60] },
    { name: "GREEN GROUP 131 D", rgb: [1, 137, 97] },
    { name: "GREEN GROUP 132 A", rgb: [0, 74, 41] },
    { name: "GREEN GROUP 132 B", rgb: [0, 83, 54] },
    { name: "GREEN GROUP 132 C", rgb: [1, 132, 98] },
    { name: "GREEN GROUP 132 D", rgb: [47, 186, 134] },
    { name: "GREEN GROUP 133 A", rgb: [1, 61, 51] },
    { name: "GREEN GROUP 133 B", rgb: [1, 118, 101] },
    { name: "GREEN GROUP 133 C", rgb: [79, 158, 138] },
    { name: "GREEN GROUP 133 D", rgb: [123, 199, 173] },
    { name: "GREEN GROUP 134 A", rgb: [0, 146, 39] },
    { name: "GREEN GROUP 134 B", rgb: [0, 200, 103] },
    { name: "GREEN GROUP 134 C", rgb: [67, 233, 157] },
    { name: "GREEN GROUP 134 D", rgb: [159, 248, 192] },

    { name: "GREEN GROUP N134 A", rgb: [1, 61, 20] },
    { name: "GREEN GROUP N134 B", rgb: [0, 92, 40] },
    { name: "GREEN GROUP N134 C", rgb: [0, 143, 71] },
    { name: "GREEN GROUP N134 D", rgb: [1, 180, 120] },

    { name: "GREEN GROUP 135 A", rgb: [0, 56, 24] },
    { name: "GREEN GROUP 135 B", rgb: [0, 82, 36] },
    { name: "GREEN GROUP 135 C", rgb: [0, 146, 73] },
    { name: "GREEN GROUP 135 D", rgb: [118, 216, 138] },

    { name: "GREEN GROUP 136 A", rgb: [0, 55, 33] },
    { name: "GREEN GROUP 136 B", rgb: [0, 81, 56] },
    { name: "GREEN GROUP 136 C", rgb: [70, 150, 98] },
    { name: "GREEN GROUP 136 D", rgb: [168, 231, 180] },

    { name: "GREEN GROUP 137 A", rgb: [5, 83, 34] },
    { name: "GREEN GROUP 137 B", rgb: [35, 96, 40] },
    { name: "GREEN GROUP 137 C", rgb: [57, 114, 57] },
    { name: "GREEN GROUP 137 D", rgb: [66, 134, 71] },

    { name: "GREEN GROUP N137 A", rgb: [13, 64, 20] },
    { name: "GREEN GROUP N137 B", rgb: [21, 70, 22] },
    { name: "GREEN GROUP N137 C", rgb: [16, 74, 32] },
    { name: "GREEN GROUP N137 D", rgb: [22, 82, 38] },
    { name: "GREEN GROUP 138 A", rgb: [59, 118, 50] },
    { name: "GREEN GROUP 138 B", rgb: [106, 151, 87] },
    { name: "GREEN GROUP 138 C", rgb: [155, 200, 133] },
    { name: "GREEN GROUP 138 D", rgb: [180, 223, 154] },

    { name: "GREEN GROUP N138 A", rgb: [15, 106, 81] },
    { name: "GREEN GROUP N138 B", rgb: [55, 112, 76] },
    { name: "GREEN GROUP N138 C", rgb: [103, 142, 113] },
    { name: "GREEN GROUP N138 D", rgb: [99, 147, 118] },

    { name: "GREEN GROUP N138 A", rgb: [0, 57, 24] },
    { name: "GREEN GROUP N138 B", rgb: [20, 110, 55] },
    { name: "GREEN GROUP N138 C", rgb: [110, 158, 84] },
    { name: "GREEN GROUP N138 D", rgb: [181, 214, 137] },

    { name: "GREEN GROUP 139 A", rgb: [1, 145, 40] },
    { name: "GREEN GROUP 139 B", rgb: [1, 201, 105] },
    { name: "GREEN GROUP 139 C", rgb: [70, 225, 157] },
    { name: "GREEN GROUP 139 D", rgb: [159, 247, 193] },

    { name: "GREEN GROUP 140 A", rgb: [0, 170, 10] },
    { name: "GREEN GROUP 140 B", rgb: [0, 204, 71] },
    { name: "GREEN GROUP 140 C", rgb: [82, 241, 140] },
    { name: "GREEN GROUP 140 D", rgb: [189, 255, 189] },

    { name: "GREEN GROUP 141 A", rgb: [0, 88, 1] },
    { name: "GREEN GROUP 141 B", rgb: [0, 100, 10] },
    { name: "GREEN GROUP 141 C", rgb: [62, 160, 62] },
    { name: "GREEN GROUP 141 D", rgb: [120, 214, 101] },
    { name: "GREEN GROUP 142 A", rgb: [97, 228, 86] },
    { name: "GREEN GROUP 142 B", rgb: [131, 232, 109] },
    { name: "GREEN GROUP 142 C", rgb: [204, 255, 163] },
    { name: "GREEN GROUP 142 D", rgb: [233, 255, 206] },

    { name: "GREEN GROUP 143 A", rgb: [43, 128, 14] },
    { name: "GREEN GROUP 143 B", rgb: [60, 150, 1] },
    { name: "GREEN GROUP 143 C", rgb: [105, 164, 28] },
    { name: "GREEN GROUP 143 D", rgb: [145, 220, 129] },

    { name: "YELLOW-GREEN GROUP 144 A", rgb: [90, 131, 1] },
    { name: " YELLOW -GREEN GROUP 144 B", rgb: [124, 176, 6] },
    { name: " YELLOW -GREEN GROUP 144 C", rgb: [144, 204, 31] },
    { name: " YELLOW -GREEN GROUP 144 D", rgb: [202, 239, 133] },
    { name: " YELLOW -GREEN GROUP N144 A", rgb: [176, 184, 2] },
    { name: " YELLOW -GREEN GROUP N144 B", rgb: [172, 210, 0] },
    { name: " YELLOW -GREEN GROUP N144 C", rgb: [129, 185, 0] },
    { name: " YELLOW -GREEN GROUP N144 D", rgb: [180, 219, 74] },
    { name: " YELLOW -GREEN GROUP 145 A", rgb: [165, 198, 65] },
    { name: " YELLOW -GREEN GROUP 145 B", rgb: [187, 220, 105] },
    { name: " YELLOW -GREEN GROUP 145 C", rgb: [244, 247, 158] },
    { name: " YELLOW -GREEN GROUP 145 D", rgb: [255, 254, 203] },
    { name: " YELLOW -GREEN GROUP 146 A", rgb: [55, 89, 2] },
    { name: " YELLOW -GREEN GROUP 146 B", rgb: [92, 117, 16] },
    { name: " YELLOW -GREEN GROUP 146 C", rgb: [127, 142, 39] },
    { name: " YELLOW -GREEN GROUP 146 D", rgb: [152, 163, 69] },
    { name: " YELLOW -GREEN GROUP 147 A", rgb: [15, 60, 19] },
    { name: " YELLOW -GREEN GROUP 147 B", rgb: [82 ,112, 50] },
    { name: " YELLOW -GREEN GROUP 147 C", rgb: [148, 159, 93] },
    { name: " YELLOW -GREEN GROUP 147 D", rgb: [182, 205, 137] },
    { name: " YELLOW -GREEN GROUP 148 A", rgb: [86, 101, 42] },
    { name: " YELLOW -GREEN GROUP 148 B", rgb: [109, 130, 74] },
    { name: " YELLOW -GREEN GROUP 148 C", rgb: [159, 174, 119] },
    { name: " YELLOW -GREEN GROUP 148 D", rgb: [175, 192, 137] },
    { name: " YELLOW -GREEN GROUP 149 A", rgb: [136, 244, 37] },
    { name: " YELLOW -GREEN GROUP 149 B", rgb: [188, 253, 99] },
    { name: " YELLOW -GREEN GROUP 149 C", rgb: [219, 154, 136] },
    { name: " YELLOW -GREEN GROUP 149 D", rgb: [255, 254, 197] },
    { name: " YELLOW -GREEN GROUP 150 A", rgb: [215, 254, 3] },
    { name: " YELLOW -GREEN GROUP 150 B", rgb: [248, 252, 71] },
    { name: " YELLOW -GREEN GROUP 150 C", rgb: [254, 255, 115] },
    { name: " YELLOW -GREEN GROUP 150 D", rgb: [255, 253, 202] },
    { name: " YELLOW -GREEN GROUP 151 A", rgb: [198, 191, 0] },
    { name: " YELLOW -GREEN GROUP 151 B", rgb: [215, 211, 0] },
    { name: " YELLOW -GREEN GROUP 151 C", rgb: [241, 233, 0] },
    { name: " YELLOW -GREEN GROUP 151 D", rgb: [245, 237, 48] },
    { name: " YELLOW -GREEN GROUP 152 A", rgb: [109, 101, 0] },
    { name: " YELLOW -GREEN GROUP 152 B", rgb: [126, 115, 0] },
    { name: " YELLOW -GREEN GROUP 152 C", rgb: [157, 138, 0] },
    { name: " YELLOW -GREEN GROUP 152 D", rgb: [184, 159, 4] },
    { name: " YELLOW -GREEN GROUP 153 A", rgb: [187, 159, 0] },
    { name: " YELLOW -GREEN GROUP 153 B", rgb: [217, 175, 1] },
    { name: " YELLOW -GREEN GROUP 153 C", rgb: [231, 190, 0] },
    { name: " YELLOW -GREEN GROUP 153 D", rgb: [241, 202, 1] },
    { name: " YELLOW -GREEN GROUP 154 A", rgb: [239, 249, 4] },
    { name: " YELLOW -GREEN GROUP 154 B", rgb: [255, 255, 41] },
    { name: " YELLOW -GREEN GROUP 154 C", rgb: [255, 255, 109] },
    { name: " YELLOW -GREEN GROUP 154 D", rgb: [255, 254, 148] },

  ];

  // 初始化最小差异和最接近的颜色
  let minDiff = Infinity;
  let closestColor = null;

  // 遍历颜色列表，找到最接近的颜色
  colors.forEach(color => {
    const diff = Math.sqrt(
      Math.pow(r - color.rgb[0], 2) +
      Math.pow(g - color.rgb[1], 2) +
      Math.pow(b - color.rgb[2], 2)
    );
    if (diff < minDiff) {
      minDiff = diff;
      closestColor = color.name;
    }
  });

  // 找到最接近的颜色后，显示对应的图片
  if (closestColor) {
    console.log('找到最接近的颜色:', closestColor); // 调试信息
    showColorImage(closestColor);
  }

  return closestColor;
}

// 初始化事件监听器
window.addEventListener('load', initializeImageClick);

// 点击获取颜色卡片添加点击复制功能
const clickedColorCard = document.getElementById('clickedColorCard');
clickedColorCard.addEventListener('click', () => {
  const hexCode = document.getElementById('clickedHexValue').textContent.replace('HEX: ', '');
  copyToClipboard(hexCode);
});

// 对立色生成函数
function updateComplementaryColors(r, g, b) {
  const complementaryColors = generateComplementaryColors(r, g, b, 4);
  const complementaryColorsContainer = document.getElementById('complementaryColors');
  complementaryColorsContainer.innerHTML = ''; // 清空之前的颜色

  complementaryColors.forEach(hex => {
    const swatch = document.createElement('div');
    swatch.classList.add('complementary-color-swatch');
    swatch.style.backgroundColor = hex;

    const hexP = document.createElement('p');
    hexP.textContent = hex;

    swatch.appendChild(hexP);
    complementaryColorsContainer.appendChild(swatch);

    swatch.addEventListener('click', () => {
      copyToClipboard(hex);
    });
  });
}

// 生成指定数量的对立颜色，确保不包含主色相
function generateComplementaryColors(r, g, b, count) {
  let hsl = rgbToHsl(r, g, b);
  let complementaryColors = [];
  let step = 360 / count; // 均匀分布对立颜色

  for (let i = 1; i <= count; i++) {
    let newHue = (hsl.h + step * i) % 360; // 均匀分布
    // 如果新色相与主色相相同，调整步长
    if (newHue === hsl.h) {
      newHue = (newHue + 30) % 360;
    }
    let newHsl = { h: newHue, s: hsl.s, l: hsl.l };
    let rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    let hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    complementaryColors.push(hex);
  }

  return complementaryColors;
}

// RGB 转 HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if(max === min){
      h = s = 0; // achromatic
  } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
  }

  return { h: Math.round(h), s: +(s * 100).toFixed(1), l: +(l * 100).toFixed(1) };
}

// HSL 转 RGB
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r=0, g=0, b=0;

  if(0 <= h && h < 60){
      r = c; g = x; b = 0;
  } else if(60 <= h && h < 120){
      r = x; g = c; b = 0;
  } else if(120 <= h && h < 180){
      r = 0; g = c; b = x;
  } else if(180 <= h && h < 240){
      r = 0; g = x; b = c;
  } else if(240 <= h && h < 300){
      r = x; g = 0; b = c;
  } else if(300 <= h && h < 360){
      r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return { r, g, b };
}

// RGB 转 HEX
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
      const hex = x.toString(16).toUpperCase();
      return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// 初始化页面和相关功能
document.addEventListener('DOMContentLoaded', () => {
  initializePage();
  initializeImageClick();
});



