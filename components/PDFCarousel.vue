<template>
  <view class="pdf-carousel" @tap="openPDF">
    <!-- Loading -->
    <view v-if="isLoading" class="loading-overlay">
      <view class="spinner"></view>
      <text class="loading-text">加载 {{ title }} 中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-if="!isLoading && error" class="error-state">
      <text class="error-icon">📄</text>
      <text>PDF 加载失败</text>
      <text class="error-hint">请检查文件或网络连接</text>
    </view>

    <!-- PDF 内容：显示为图片方式渲染 -->
    <view v-if="!error && pdfReady" class="pdf-content">
      <image
        :src="pdfImageUrl"
        mode="aspectFit"
        class="pdf-image"
        @load="onImageLoad"
        @error="onImageError"
      ></image>
      
      <!-- 翻页控件 -->
      <view v-if="numPages > 1 && !imageLoading" class="page-controls">
        <view class="page-btn" @tap.stop="prevPage">
          <text class="page-arrow">‹</text>
        </view>
        <view class="page-dots">
          <view
            v-for="idx in numPages"
            :key="idx"
            class="dot"
            :class="{ active: idx - 1 === currentPage }"
            @tap.stop="goToPage(idx - 1)"
          ></view>
        </view>
        <view class="page-btn" @tap.stop="nextPage">
          <text class="page-arrow">›</text>
        </view>
      </view>
      <text v-if="numPages > 1" class="page-info">{{ currentPage + 1 }} / {{ numPages }}</text>
    </view>

    <!-- 无数据状态 -->
    <view v-if="!isLoading && !error && !pdfReady && pdfUrl === ''" class="empty-state">
      <text>暂无{{ title }}文档</text>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  pdfUrl: { type: String, default: '' },
  title: { type: String, default: '' },
  autoSwitchInterval: { type: Number, default: 5000 }
})

const emit = defineEmits(['loaded'])

const isLoading = ref(true)
const error = ref(false)
const pdfReady = ref(false)
const numPages = ref(0)
const currentPage = ref(0)
const imageLoading = ref(true)
const pdfImageUrl = ref('')

let timer = null

// 将 base64 PDF 通过 webview 方式渲染为图片
// 由于 uni-app 没有原生 PDF 渲染，我们使用服务端渲染或简单展示
// 这里采用：如果 pdfUrl 是 data:application/pdf;base64,...
// 我们创建一个临时 webview 来渲染，或者显示一个通知

// 更实用的方法：直接打开 PDF
function openPDF() {
  if (!pdfUrl.value) return
  // 下载 PDF 并用原生方式打开
  const tempFilePath = pdfUrl.value
  if (tempFilePath.startsWith('data:')) {
    // base64 数据，需要先保存为文件
    const base64 = tempFilePath.split(',')[1]
    const fileName = `${props.title || 'document'}.pdf`
    const filePath = `${uni.env.USER_DATA_PATH}/${fileName}`
    
    uni.getFileSystemManager().writeFile({
      filePath,
      data: base64,
      encoding: 'base64',
      success() {
        uni.openDocument({
          filePath,
          success() {
            console.log('打开PDF成功')
          },
          fail(err) {
            console.error('打开PDF失败:', err)
          }
        })
      },
      fail(err) {
        console.error('保存PDF文件失败:', err)
      }
    })
  }
}

// 计算要显示的页面数（对于自动展示模式）
watch(() => props.pdfUrl, (url) => {
  if (url) {
    isLoading.value = true
    error.value = false
    currentPage.value = 0
    startAutoSwitch()
  }
})

function onImageLoad() {
  isLoading.value = false
  imageLoading.value = false
  pdfReady.value = true
  emit('loaded')
}

function onImageError() {
  error.value = true
  isLoading.value = false
  imageLoading.value = false
}

function prevPage() {
  if (numPages.value <= 1) return
  currentPage.value = currentPage.value === 0 ? numPages.value - 1 : currentPage.value - 1
  resetAutoSwitch()
}

function nextPage() {
  if (numPages.value <= 1) return
  currentPage.value = (currentPage.value + 1) % numPages.value
  resetAutoSwitch()
}

function goToPage(idx) {
  currentPage.value = idx
  resetAutoSwitch()
}

function startAutoSwitch() {
  clearInterval(timer)
  if (numPages.value <= 1) return
  timer = setInterval(() => {
    currentPage.value = (currentPage.value + 1) % numPages.value
  }, props.autoSwitchInterval)
}

function resetAutoSwitch() {
  clearInterval(timer)
  if (numPages.value > 1) {
    timer = setInterval(() => {
      currentPage.value = (currentPage.value + 1) % numPages.value
    }, props.autoSwitchInterval)
  }
}

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.pdf-carousel {
  flex: 1;
  border: 1px solid black;
  text-align: center;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.9);
  z-index: 5;
}

.spinner {
  width: 32px; height: 32px;
  border: 3px solid #ddd;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.error-state {
  position: absolute;
  inset: 0;
  color: #ff4d4f;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-icon { font-size: 28px; margin-bottom: 8px; }
.error-hint { font-size: 12px; margin-top: 4px; color: #999; }

.pdf-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pdf-image {
  width: 90%;
  height: 80%;
}

.page-controls {
  position: absolute;
  left: 0; right: 0; bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 10;
}

.page-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-arrow { color: #fff; font-size: 18px; font-weight: bold; line-height: 1; }

.page-dots { display: flex; gap: 6px; }
.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.6);
}
.dot.active { background: #1890ff; }

.page-info {
  position: absolute;
  bottom: 8px; right: 8px;
  font-size: 10px;
  color: rgba(255,255,255,0.7);
  background: rgba(0,0,0,0.4);
  padding: 2px 6px;
  border-radius: 10px;
  z-index: 10;
}

.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
</style>
