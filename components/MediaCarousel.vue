<template>
  <view class="media-carousel" :style="containerStyle">
    <!-- 空列表 -->
    <view v-if="mediaList.length === 0" class="empty-overlay">
      <text>暂无媒体内容</text>
    </view>

    <template v-else>
      <!-- 加载遮罩 -->
      <view v-if="mediaLoading && !loadError" class="loading-overlay">
        <view class="spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 错误占位 -->
      <view v-if="loadError" class="error-overlay">
        <text>无法加载媒体内容</text>
        <text class="error-file">{{ currentItemData?.fileName }}</text>
      </view>

      <!-- 图片 -->
      <image
        v-if="!loadError && currentItemData && currentItemData.mediaType === 'image'"
        :src="currentItemData.fileUrl"
        mode="aspectFit"
        :style="{ opacity: mediaLoading ? 0.3 : 1 }"
        @load="handleMediaLoad"
        @error="handleMediaError"
      ></image>

      <!-- 视频 -->
      <video
        v-if="!loadError && currentItemData && currentItemData.mediaType === 'video'"
        :src="currentItemData.fileUrl"
        :style="{ opacity: mediaLoading ? 0.3 : 1 }"
        autoplay
        loop
        muted
        object-fit="contain"
        @loadeddata="handleMediaLoad"
        @error="handleMediaError"
      ></video>

      <!-- 左右切换 -->
      <template v-if="mediaList.length > 1 && !mediaLoading && !loadError">
        <view class="nav-btn left" @click="changeMedia('prev')">
          <text class="nav-icon">‹</text>
        </view>
        <view class="nav-btn right" @click="changeMedia('next')">
          <text class="nav-icon">›</text>
        </view>
      </template>
    </template>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  mediaList: { type: Array, default: () => [] },
  autoSwitchInterval: { type: Number, default: 5000 },
  containerStyle: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['firstMediaLoaded'])

const currentIndex = ref(0)
const playing = ref(true)
const mediaLoading = ref(true)
const loadError = ref(false)
const hasFiredFirstLoad = ref(false)
let timer = null
let safetyTimer = null

const currentItemData = computed(() => {
  if (props.mediaList.length === 0) return null
  return props.mediaList[currentIndex.value]
})

// 安全超时：10秒后关闭加载遮罩
function startSafetyTimer() {
  clearSafetyTimer()
  safetyTimer = setTimeout(() => {
    mediaLoading.value = false
    loadError.value = true
  }, 10000)
}

function clearSafetyTimer() {
  if (safetyTimer) {
    clearTimeout(safetyTimer)
    safetyTimer = null
  }
}

watch(() => props.mediaList, (newList) => {
  currentIndex.value = 0
  mediaLoading.value = newList.length > 0
  loadError.value = false
  hasFiredFirstLoad.value = false
  if (newList.length > 0) {
    startSafetyTimer()
  }
  setupTimer()
}, { deep: true })

function setupTimer() {
  clearTimer()
  if (!playing.value || props.mediaList.length <= 1) return
  timer = setInterval(() => {
    playNext()
  }, props.autoSwitchInterval)
}

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function playNext() {
  setMediaLoading()
  currentIndex.value = (currentIndex.value + 1) % props.mediaList.length
}

function setMediaLoading() {
  mediaLoading.value = true
  loadError.value = false
  startSafetyTimer()
}

function handleMediaLoad() {
  clearSafetyTimer()
  mediaLoading.value = false
  if (currentIndex.value === 0 && !hasFiredFirstLoad.value) {
    hasFiredFirstLoad.value = true
    emit('firstMediaLoaded')
  }
}

function handleMediaError() {
  clearSafetyTimer()
  mediaLoading.value = false
  loadError.value = true
  if (currentIndex.value === 0 && !hasFiredFirstLoad.value) {
    hasFiredFirstLoad.value = true
    emit('firstMediaLoaded')
  }
}

function changeMedia(direction) {
  if (props.mediaList.length <= 1) return
  setMediaLoading()
  if (direction === 'prev') {
    currentIndex.value = (currentIndex.value - 1 + props.mediaList.length) % props.mediaList.length
  } else {
    currentIndex.value = (currentIndex.value + 1) % props.mediaList.length
  }
}

// 启动
onMounted(() => {
  if (props.mediaList.length > 0) {
    startSafetyTimer()
  }
  setupTimer()
})

onUnmounted(() => {
  clearTimer()
  clearSafetyTimer()
})
</script>

<style scoped>
.media-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

.empty-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
  background: rgba(0,0,0,0.3);
}

.spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 8px;
  color: #fff;
  font-size: 12px;
}

.error-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  z-index: 4;
}

.error-file {
  font-size: 12px;
  margin-top: 8px;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.nav-btn.left { left: 8px; }
.nav-btn.right { right: 8px; }

.nav-icon {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
}
</style>
