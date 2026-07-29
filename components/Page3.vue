<template>
  <view class="page3">
    <view v-for="category in categories" :key="category" class="pdf-card">
      <view class="pdf-card-header">
        <image :src="hbgIconImage" mode="aspectFit" class="pdf-card-header-bg"></image>
        <text class="pdf-card-header-title">{{ category }}</text>
      </view>
      <view class="pdf-card-body">
        <template v-if="pages[category] && pages[category].length > 0">
          <image :src="pages[category][currentIdx[category]]" mode="aspectFit" class="pdf-page-img"></image>
        </template>
        <text v-else class="pdf-status">{{ loading[category] ? '加载中...' : '暂无文档' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ensureLogin } from '@/utils/auth'
import { getPdfListApi } from '@/api/pdf'
import { getToken } from '@/utils/token'
import { hbgIconImage } from '@/utils/images'
import { get } from '@/utils/request'

const categories = ['重点工作', '党务公开', '光荣榜']
const fileIds = ref({})
const pages = ref({ '重点工作': [], '党务公开': [], '光荣榜': [] })
const currentIdx = ref({ '重点工作': 0, '党务公开': 0, '光荣榜': 0 })
const loading = ref({ '重点工作': true, '党务公开': true, '光荣榜': true })
let rotateTimers = {}
let refreshTimer = null

onUnmounted(() => {
  Object.values(rotateTimers).forEach(t => clearInterval(t))
  if (refreshTimer) clearInterval(refreshTimer)
})

async function fetchAll() {
  // 清除旧轮播
  Object.values(rotateTimers).forEach(t => clearInterval(t))
  rotateTimers = {}

  for (const category of categories) {
    try {
      const res = await getPdfListApi({ type: category })
      if (res.data?.code === 200 && res.data.data?.length > 0) {
        const f = res.data.data[0]
        fileIds.value[category] = f.id
        // 获取该PDF的每页图片
        const imgRes = await get('/pdf/preview-images', { id: f.id })
        if (imgRes.data?.code === 200 && imgRes.data.data?.length > 0) {
          pages.value[category] = imgRes.data.data
          if (imgRes.data.data.length > 1) {
            rotateTimers[category] = setInterval(() => {
              currentIdx.value[category] = (currentIdx.value[category] + 1) % imgRes.data.data.length
            }, 4000)
          }
        }
      }
    } catch (e) {
      console.error('[Page3]', category, '失败:', e)
    } finally { loading.value[category] = false }
  }
}

onMounted(async () => {
  await ensureLogin()
  await fetchAll()
  setTimeout(() => categories.forEach(c => { loading.value[c] = false }), 15000)
  // 每10秒刷新数据
  refreshTimer = setInterval(fetchAll, 10000)
})
</script>

<style scoped>
.page3 {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: clamp(3px, 0.42vw, 16px);
  padding: clamp(3px, 0.42vw, 16px);
  box-sizing: border-box;
  background: #f7eaca;
  min-height: 0;
}

.pdf-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 2px solid #d92228;
  overflow: hidden;
  border-radius: 2px;
  min-width: 0;
  min-height: 0;
}

.pdf-card-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  background: #d92228;
  height: clamp(22px, 3.33vh, 72px);
  overflow: hidden;
}

.pdf-card-header-bg {
  width: 100%;
  height: 100%;
}

.pdf-card-header-title {
  position: absolute;
  top: 50%;
  left: 55%;
  transform: translate(-50%, -50%);
  font-size: clamp(9px, 0.83vw, 32px);
  font-weight: bold;
  color: #fbbf24;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  letter-spacing: 2px;
  z-index: 1;
}

.pdf-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fefdf9;
  min-height: 0;
  position: relative;
}

.pdf-page-img {
  width: 100%;
  height: 100%;
}

.page-num {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
}

.pdf-status {
  font-size: clamp(8px, 0.68vw, 26px);
  color: #666;
  padding: clamp(8px, 1.04vw, 40px);
}
</style>
