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
  let r = parseInt(redRange.value);
  let g = parseInt(greenRange.value);
  let b = parseInt(blueRange.value);
  let brightness = parseInt(brightnessRange.value);

  // 调整明暗
  r = Math.round(r * brightness / 255);
  g = Math.round(g * brightness / 255);
  b = Math.round(b * brightness / 255);

  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  
  colorCard.style.backgroundColor = rgb;
  hexValue.textContent = `${hex}`;
  rgbValue.textContent = `${r}, ${g}, ${b}`;
  hexInput.value = hex.slice(1); // 更新HEX输入框

  // 更新对立色
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
  blueValue.textContent = randB;
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
    blueValue.textContent = adjustedB;

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
const uploadedImage = document.getElementById('uploadedImage');
const extractedColors = document.getElementById('extractedColors');
const colorThief = new ColorThief();

// 相机相关元素
const cameraPreview = document.getElementById('cameraPreview');
const videoElement = document.getElementById('videoElement');
const takePhotoButton = document.getElementById('takePhotoButton');
const closeCameraButton = document.getElementById('closeCameraButton');
let mediaStream = null;

uploadButton.addEventListener('click', () => {
  imageInput.click();
});

// 处理相机按钮点击
cameraButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment' // 使用后置相机
      } 
    });
    
    mediaStream = stream;
    videoElement.srcObject = stream;
    cameraPreview.style.display = 'flex';
    
  } catch (err) {
    console.error('相机调用失败:', err);
    showPopup('相机调用失败，请检查相机权限设置');
  }
});

// 拍照按钮点击事件
takePhotoButton.addEventListener('click', () => {
  if (!mediaStream) return;
  
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  // 将照片显示在图片元素中
  uploadedImage.src = canvas.toDataURL('image/png');
  uploadedImage.style.display = 'block';
  
  // 处理拍摄的照片
  const imageCanvas = document.getElementById('imageCanvas');
  imageCanvas.width = canvas.width;
  imageCanvas.height = canvas.height;
  const imageCtx = imageCanvas.getContext('2d');
  imageCtx.drawImage(canvas, 0, 0);
  
  // 提取颜色
  extractColorsFromImage(uploadedImage);
  
  // 关闭相机预览
  closeCamera();
});

// 关闭相机按钮点击事件
closeCameraButton.addEventListener('click', closeCamera);

// 关闭相机函数
function closeCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  videoElement.srcObject = null;
  cameraPreview.style.display = 'none';
}

// 处理图片上传
imageInput.addEventListener('change', handleImageSelect);

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
  uploadedImage.src = defaultImageURL;
  uploadedImage.style.display = 'block';
  uploadedImage.onload = function() {
    // 将图片绘制到canvas
    const canvas = document.getElementById('imageCanvas');
    canvas.width = uploadedImage.naturalWidth;
    canvas.height = uploadedImage.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    extractColorsFromImage(uploadedImage);
  }
  uploadedImage.onerror = function() {
    extractedColors.innerHTML = '<p>文件丢失加载失败 !!!</p>';
  }
}

function extractColorsFromImage(image) {
  try {
    if (!image.complete || image.naturalHeight === 0) {
      throw new Error('图片未正确加载 !!!');
    }
    const palette = colorThief.getPalette(image, 20);
    extractedColors.innerHTML = '';
    palette.forEach(color => {
      const swatch = document.createElement('div');
      swatch.classList.add('color-swatch');
      swatch.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

      const hex = "#" + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1).toUpperCase();

      const hexP = document.createElement('p');
      hexP.textContent = hex;

      swatch.appendChild(hexP);
      extractedColors.appendChild(swatch);

      swatch.addEventListener('click', () => {
        copyToClipboard(hex);
      });
    });
  } catch (err) {
    extractedColors.innerHTML = '';
    console.error(err);
  }
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
  uploadedImage.addEventListener('click', function(event) {
    if (!uploadedImage.src) return;

    const rect = uploadedImage.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');

    const scaleX = uploadedImage.naturalWidth / uploadedImage.width;
    const scaleY = uploadedImage.naturalHeight / uploadedImage.height;

    // 获取像素数据
    const pixelData = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    const r = pixelData[0];
    const g = pixelData[1];
    const b = pixelData[2];

    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

    // 显示点击获取的颜色
    const clickedColorCard = document.getElementById('clickedColorCard');
    const clickedColorDisplay = document.getElementById('clickedColorDisplay');
    const clickedHexValue = document.getElementById('clickedHexValue');
    const clickedRgbValue = document.getElementById('clickedRgbValue'); // 获取显示RGB值的元素
    const closestColorName = document.getElementById('closestColorName'); // 获取显示最接近颜色名称的元素

    clickedColorDisplay.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    clickedHexValue.textContent = `${hex}`;
    clickedRgbValue.textContent = `RGB(${r}, ${g}, ${b})`; // 显示RGB值
    closestColorName.textContent = getClosestColorName(r, g, b); // 显示最接近的颜色名称
    clickedColorCard.style.display = 'block';
  });


  // 检查颜色是否为绿色
function isGreen(r, g, b) {
  // 定义绿色的RGB范围
  const minR = 0; 
  const maxR = 255;
  const minG = 125; 
  const maxG = 255;
  const minB = 0; 
  const maxB = 180;

  // 检查颜色是否在绿色范围内
  if (r >= minR && r <= maxR && g >= minG && g <= maxG && b >= minB && b<=maxB) {
      return true;
  }
  return false;
}

  // 定义颜色和对应的RGB值
function getClosestColorName(r, g, b) {
  const colors = [
    { name: "水绿色/青色", rgb: [0, 255, 255] },
    { name: "海蓝色", rgb: [127, 255, 212] },
    { name: "军绿色", rgb: [69, 75, 27] },
    { name: "蓝绿色", rgb: [8, 143, 143] },
    { name: "亮绿色", rgb: [170, 255, 0] },
    { name: "学员蓝", rgb: [95, 158, 160] },
    { name: "镉绿色", rgb: [9, 121, 105] },
    { name: "青瓷色", rgb: [175, 225, 175] },
    { name: "沙特勒斯", rgb: [223, 255, 0] },
    { name: "黄水晶", rgb: [228, 208, 10] },
    { name: "深绿色", rgb: [2, 48, 32] },
    { name: "电蓝色", rgb: [125, 249, 255] },
    { name: "翠绿色", rgb: [80 ,200, 120] },
    { name: "桉树绿", rgb: [95, 133, 117] },
    { name: "植物绿", rgb: [79, 121, 66] },
    { name: "森林绿", rgb: [34, 139, 34] },
    { name: "草绿色", rgb: [124, 252, 0] },
    { name: "绿色", rgb: [0, 128, 0] },
    { name: "猎人绿", rgb: [53, 94, 59] },
    { name: "翠绿色", rgb: [0, 163, 108] },
    { name: "丛林绿", rgb: [42, 170, 138] },
    { name: "凯利绿", rgb: [76, 187, 23]     },
{ name: "浅绿色", rgb: [144, 238, 144] },
    { name: "石灰绿", rgb: [50, 205, 50] },
    { name: "林肯绿", rgb: [71, 135, 120] },
    { name: "孔雀石绿", rgb: [11, 218, 81] },
    { name: "薄荷绿", rgb: [152, 251, 152] },
    { name: "苔藓绿", rgb: [138, 154, 91] },
    { name: "霓虹绿", rgb: [15, 255, 80] },
    { name: "尼安扎色", rgb: [236, 255, 220] },
    { name: "橄榄绿", rgb: [128, 128, 0] },
    { name: "柔和绿色", rgb: [193, 225, 193] },
    { name: "梨黄色", rgb: [201, 204, 63] },
    { name: "橄榄石", rgb: [180, 196, 36] },
    { name: "开心果绿", rgb: [147, 197, 114] },
    { name: "知更鸟蛋蓝色", rgb: [150, 222, 209] },
    { name: "海绿色", rgb: [46, 139, 87] },
    { name: "海泡绿", rgb: [159, 226, 191] },
    { name: "三叶草绿", rgb: [0, 158, 96] },
    { name: "春绿色", rgb: [0, 255, 127] },
    { name: "水鸭色", rgb: [0, 128, 128] }
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

  // 如果颜色是绿色，返回最接近的绿色名称，否则返回"未录入"
  return isGreen(r, g, b) ? closestColor : '未录入';
}

// 初始化事件监听器
window.addEventListener('load', initializeImageClick);

  // 点击获取颜色卡片添加点击复制功能
  const clickedColorCard = document.getElementById('clickedColorCard');
  clickedColorCard.addEventListener('click', () => {
    const hexCode = document.getElementById('clickedHexValue').textContent.replace('HEX: ', '');
    copyToClipboard(hexCode);
  });
}

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



