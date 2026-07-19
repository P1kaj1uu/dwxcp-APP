<template>
  <view class="page4">
    <view class="media-section">
      <view class="section-header">
        <text class="section-title">组织生活</text>
      </view>
      <view class="media-content">
        <image
          v-if="orgLifeMedia.length > 0 && orgLifeMedia[0].mediaType === 'image'"
          :src="orgLifeMedia[0].fileUrl"
          mode="aspectFit"
          class="media-image"
          @error="() => {}"
        ></image>
        <video
          v-else-if="orgLifeMedia.length > 0 && orgLifeMedia[0].mediaType === 'video'"
          :src="orgLifeMedia[0].fileUrl"
          autoplay
          loop
          muted
          object-fit="contain"
          class="media-video"
        ></video>
        <text v-else class="media-empty">暂无内容</text>
      </view>
    </view>
    <view class="media-section">
      <view class="section-header">
        <text class="section-title">活动风采</text>
      </view>
      <view class="media-content">
        <image
          v-if="activityMedia.length > 0 && activityMedia[0].mediaType === 'image'"
          :src="activityMedia[0].fileUrl"
          mode="aspectFit"
          class="media-image"
          @error="() => {}"
        ></image>
        <video
          v-else-if="activityMedia.length > 0 && activityMedia[0].mediaType === 'video'"
          :src="activityMedia[0].fileUrl"
          autoplay
          loop
          muted
          object-fit="contain"
          class="media-video"
        ></video>
        <text v-else class="media-empty">暂无内容</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ensureLogin } from '@/utils/auth'
import { getMediaListApi, getShowMediaListApi } from '@/api/media'

const API_BASE_URL = 'http://123.60.91.107:2645'

const orgLifeMedia = ref([])
const activityMedia = ref([])

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
  } catch (e) { console.error(e) }
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

.section-header {
  text-align: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #fbbf24;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  letter-spacing: 2px;
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
