<template>
  <view class="page4">
    <view class="media-section">
      <view class="page4-header">
        <image :src="hbgIconImage" mode="widthFix" class="page4-header-bg"></image>
        <text class="page4-header-title">组织生活</text>
      </view>
      <view class="media-content">
        <!-- 图片 -->
        <image
          v-if="orgLifeMedia.length > 0 && orgLifeMedia[orgLifeIdx].mediaType === 'image'"
          :src="orgLifeMedia[orgLifeIdx].fileUrl"
          mode="aspectFit"
          class="media-image"
          :key="'org-img-' + orgLifeIdx"
        ></image>
        <!-- 视频 -->
        <video
          v-else-if="orgLifeMedia.length > 0 && orgLifeMedia[orgLifeIdx].mediaType === 'video'"
          :src="orgLifeMedia[orgLifeIdx].fileUrl"
          autoplay="true"
          muted="true"
          object-fit="contain"
          class="media-video"
          :key="'org-vid-' + orgLifeIdx"
          :controls="false"
          :enable-play-gesture="false"
          :show-progress="false"
          :show-center-play-btn="false"
          @ended="nextOrgLife"
        ></video>
        <text v-else class="media-empty">暂无内容</text>
      </view>
    </view>

    <view class="media-section">
      <view class="page4-header">
        <image :src="hbgIconImage" mode="widthFix" class="page4-header-bg"></image>
        <text class="page4-header-title">活动风采</text>
      </view>
      <view class="media-content">
        <image
          v-if="activityMedia.length > 0 && activityMedia[activityIdx].mediaType === 'image'"
          :src="activityMedia[activityIdx].fileUrl"
          mode="aspectFit"
          class="media-image"
          :key="'act-img-' + activityIdx"
        ></image>
        <video
          v-else-if="activityMedia.length > 0 && activityMedia[activityIdx].mediaType === 'video'"
          :src="activityMedia[activityIdx].fileUrl"
          autoplay="true"
          muted="true"
          object-fit="contain"
          class="media-video"
          :key="'act-vid-' + activityIdx"
          :controls="false"
          :enable-play-gesture="false"
          :show-progress="false"
          :show-center-play-btn="false"
          @ended="nextActivity"
        ></video>
        <text v-else class="media-empty">暂无内容</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ensureLogin } from '@/utils/auth'
import { getMediaListApi, getShowMediaListApi } from '@/api/media'
import { hbgIconImage } from '@/utils/images'

const API_BASE_URL = 'http://123.60.91.107:2645'

const orgLifeMedia = ref([])
const activityMedia = ref([])
const orgLifeIdx = ref(0)
const activityIdx = ref(0)
let orgTimer = null
let actTimer = null

function nextOrgLife() {
  if (orgLifeMedia.value.length <= 1) return
  orgLifeIdx.value = (orgLifeIdx.value + 1) % orgLifeMedia.value.length
}

function nextActivity() {
  if (activityMedia.value.length <= 1) return
  activityIdx.value = (activityIdx.value + 1) % activityMedia.value.length
}

function startCarousel() {
  // 图片用定时器切换，视频用 @ended 事件触发
  if (orgLifeMedia.value.length > 1) {
    const first = orgLifeMedia.value[0]
    const isImage = first && first.mediaType === 'image'
    // 图片每5秒切换，视频由 @ended 驱动
    if (isImage) {
      orgTimer = setInterval(nextOrgLife, 5000)
    }
  }
  if (activityMedia.value.length > 1) {
    const first = activityMedia.value[0]
    const isImage = first && first.mediaType === 'image'
    if (isImage) {
      actTimer = setInterval(nextActivity, 5000)
    }
  }
}

function detectMediaType(fileName) {
  const ext = fileName.toLowerCase()
  if (ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') ||
      ext.endsWith('.gif') || ext.endsWith('.bmp') || ext.endsWith('.webp')) return 'image'
  if (ext.endsWith('.mp4') || ext.endsWith('.webm') || ext.endsWith('.ogg') ||
      ext.endsWith('.mov') || ext.endsWith('.avi')) return 'video'
  if (ext.includes('video')) return 'video'
  return 'image'
}

function processMedia(list, type) {
  let filtered = list || []
  if (filtered.length) {
    filtered = filtered.filter(item => {
      const isVideo = detectMediaType(item.fileName) === 'video'
      return type === 'video' ? isVideo : !isVideo
    })
  }
  return filtered.map(item => ({
    ...item,
    fileUrl: `${API_BASE_URL}${item.fileUrl}`,
    mediaType: detectMediaType(item.fileName)
  }))
}

onMounted(async () => {
  await ensureLogin()
  let type = 'image'
  try {
    const res = await getShowMediaListApi()
    if (res?.data?.code === 200) {
      type = res.data.data?.[0]?.type === 'video' ? 'video' : 'image'
    }
  } catch (e) { console.error(e) }
  
  try {
    const [orgLifeRes, activityRes] = await Promise.all([
      getMediaListApi({ category: 'orgLife' }),
      getMediaListApi({ category: 'activityStyle' })
    ])
    orgLifeMedia.value = processMedia(orgLifeRes?.data?.data, type)
    activityMedia.value = processMedia(activityRes?.data?.data, type)
    startCarousel()
  } catch (e) { console.error(e) }
})

onUnmounted(() => {
  if (orgTimer) clearInterval(orgTimer)
  if (actTimer) clearInterval(actTimer)
})
</script>

<style scoped>
.page4 {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;
  background: #f7eaca;
  min-height: 0;
}

.media-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.page4-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  background: #d92228;
  height: 36px;
  margin-bottom: 8px;
  overflow: hidden;
}

.page4-header-bg {
  width: 100%;
  height: 36px;
}

.page4-header-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: bold;
  color: #fbbf24;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  white-space: nowrap;
  letter-spacing: 2px;
  z-index: 1;
}

.media-content {
  flex: 1;
  min-height: 0;
  border: 3px solid #fefefe;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-image {
  width: 100%;
  height: 100%;
}

.media-video {
  width: 100%;
  height: 100%;
}

.media-empty {
  color: #999;
}
</style>
