# 地球贴图下载指南

## 🎯 快速开始（最小配置）

### ⚡ 推荐：只下载 2 个基础贴图

**最快方案**：只需下载这两个文件即可看到 80% 的效果！

1. **访问网站**
   ```
   https://www.solarsystemscope.com/textures/
   ```

2. **下载基础文件**（选择 2K 分辨率）
   - 滚动到 "Earth" 部分
   - 点击 "Download" 按钮
   - 选择 "2K" 分辨率（免费）
   - **只需下载这两个**：
     - ✅ `2k_earth_daymap.jpg` (日景贴图) - **必需**
     - ✅ `2k_earth_nightmap.jpg` (夜景灯光) - **必需**

3. **重命名文件**
   ```
   2k_earth_daymap.jpg   → earth-day.jpg
   2k_earth_nightmap.jpg → earth-night.jpg
   ```

4. **放置文件**
   - 将这 2 个文件复制到：`public/textures/`
   - 刷新页面即可看到日夜切换效果！

---

## 🌟 完整版（可选，最佳效果）

### 如果你想要 100% 的视觉效果

**额外下载**（增强细节）：
- ⭐ `2k_earth_normal_map.jpg` (法线贴图) - 可选
- ⭐ `2k_earth_specular_map.jpg` (高光贴图) - 可选

**重命名**：
```
2k_earth_normal_map.jpg   → earth-normal.jpg
2k_earth_specular_map.jpg → earth-specular.jpg
```

**效果提升**：
- 法线贴图：增加山脉和海沟的立体感
- 高光贴图：海洋会有真实的镜面反光

4. **放置文件**
   - 将重命名后的文件复制到当前目录：
   ```
   public/textures/
   ```

5. **刷新页面**
   - 保存文件后刷新浏览器
   - 系统会自动检测并使用完整版地球

---

## 🌍 其他资源站点

### NASA Visible Earth

**网址**：https://visibleearth.nasa.gov/

**特点**：
- ✅ 真实卫星图像
- ✅ 高分辨率
- ✅ 完全免费
- ❌ 需要手动搜索

**推荐搜索关键词**：
- "Blue Marble"
- "Earth at Night"
- "Earth Day Night"

### Planet Pixel Emporium

**网址**：http://planetpixelemporium.com/earth.html

**特点**：
- ✅ 专业行星纹理
- ✅ 多种分辨率
- ✅ 包含法线、高光贴图
- ⚠️ 需要注册

### Natural Earth

**网址**：https://www.naturalearthdata.com/

**特点**：
- ✅ 地理数据
- ✅ 矢量格式
- ⚠️ 需要转换为栅格图像

---

## 📐 贴图规格要求

### 最低要求
- **分辨率**：1024x512
- **格式**：JPG 或 PNG
- **大小**：< 10 MB

### 推荐配置
- **分辨率**：2048x1024
- **格式**：JPG（质量 90%）
- **大小**：< 5 MB

### 最佳效果
- **分辨率**：4096x2048
- **格式**：JPG（质量 95%）
- **大小**：< 15 MB

---

## 🎨 贴图说明

### 1. 日景贴图 (earth-day.jpg)

**用途**：地球白天的外观  
**内容**：陆地、海洋、云层  
**必需**：✅ 是

示例特征：
- 绿色/棕色的陆地
- 深蓝色的海洋
- 白色的云层（可选）

### 2. 夜景贴图 (earth-night.jpg)

**用途**：地球夜晚的城市灯光  
**内容**：城市灯光分布  
**必需**：✅ 是

示例特征：
- 黑色的海洋
- 点状的城市灯光
- 主要城市区域明亮

### 3. 法线贴图 (earth-normal.jpg)

**用途**：增强表面细节  
**内容**：高度信息（山脉、海沟）  
**必需**：⚠️ 可选（推荐）

示例特征：
- 蓝紫色调
- 山脉区域有深浅变化
- 平坦区域接近中性蓝

### 4. 高光贴图 (earth-specular.jpg)

**用途**：控制反光效果  
**内容**：材质反光度  
**必需**：⚠️ 可选（推荐）

示例特征：
- 海洋区域明亮（高反光）
- 陆地区域暗淡（低反光）
- 灰度图像

---

## 🛠️ 图像处理技巧

### 压缩贴图（减小文件大小）

**使用在线工具**：
1. TinyJPG - https://tinyjpg.com/
2. Squoosh - https://squoosh.app/

**Photoshop**：
```
File → Export → Save for Web (Legacy)
Quality: 85-90%
```

**ImageMagick（命令行）**：
```bash
magick convert input.jpg -quality 90 -resize 2048x1024 output.jpg
```

### 调整分辨率

**在线工具**：
- ResizeImage.net
- ILoveIMG.com

**命令行（ImageMagick）**：
```bash
magick convert input.jpg -resize 2048x1024! output.jpg
```

注意：`!` 强制精确尺寸，忽略宽高比

---

## ❓ 常见问题

### Q: 必须使用所有 4 个贴图吗？

**A:** **不是！** 系统会自动检测可用贴图：

**最小配置**（推荐快速开始）：
- ✅ `earth-day.jpg` (日景) - **必需**
- ✅ `earth-night.jpg` (夜景) - **必需**

→ 即可看到：日夜切换 + 城市灯光效果（80% 效果）

**完整配置**（最佳效果）：
- ✅ 上述 2 个 + `earth-normal.jpg` + `earth-specular.jpg`

→ 可以看到：所有效果 + 海洋反光 + 立体细节（100% 效果）

### Q: 可以使用不同分辨率的贴图吗？

**A:** 可以，但推荐所有贴图使用相同分辨率以避免不一致。

### Q: 贴图文件很大，如何优化？

**A:** 
1. 使用 JPG 格式（而非 PNG）
2. 降低质量到 85-90%
3. 使用 2K 而非 4K 分辨率
4. 使用在线压缩工具

### Q: 可以自己制作贴图吗？

**A:** 可以！要求：
- 等距圆柱投影（Equirectangular）
- 2:1 宽高比
- 0° 经度居中
- 北极在顶部

### Q: 下载的贴图有水印怎么办？

**A:** 
- 确保从免费资源站点下载
- Solar System Scope 的免费版本无水印
- 避免使用商业版本的预览图

---

## 📦 下载清单

### 基础配置（推荐）
```
public/textures/
├── earth-day.jpg       ✓ 必需
├── earth-night.jpg     ✓ 必需
└── README.md
```

### 完整配置（可选）
```
public/textures/
├── earth-day.jpg       ✓ 必需
├── earth-night.jpg     ✓ 必需
├── earth-normal.jpg    ✓ 可选
├── earth-specular.jpg  ✓ 可选
└── README.md
```

## ✅ 验证步骤

1. **检查文件名**：确保完全匹配（区分大小写）
2. **检查文件大小**：每个文件应在 1-15 MB 之间
3. **检查图像尺寸**：宽度应为高度的 2 倍
4. **刷新页面**：访问 `/footprints` 查看效果
5. **查看控制台**：应显示以下之一：
   - `🌍 使用完整版地球（含所有贴图效果）` - 4 个贴图
   - `🌍 使用基础版地球（含日夜贴图）` - 2 个贴图
   - `🌍 使用简化版地球（未找到贴图文件）` - 无贴图

---

## 🎊 完成！

如果一切正常，你应该能看到：
- ✅ 真实的地球纹理
- ✅ 背光面的城市灯光
- ✅ 海洋的镜面反射
- ✅ 细腻的表面细节

享受你的 3D 地球吧！🌍✨
