<template>
  <view class="page3">
    <view v-for="category in categories" :key="category" class="pdf-card">
      <view class="pdf-card-header">
        <text class="pdf-card-title">{{ category }}</text>
      </view>
      <view class="pdf-viewer-wrap">
        <view v-if="pdfLoading[category]" class="pdf-loading">
          <text>加载中...</text>
        </view>
        <web-view
          v-if="pdfReady[category]"
          :src="pdfUrls[category]"
          class="pdf-webview"
        ></web-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ensureLogin } from '@/utils/auth'
import { getPdfListApi } from '@/api/pdf'
import { getToken } from '@/utils/token'

const categories = ['重点工作', '党务公开', '光荣榜']
const pdfUrls = ref({})
const pdfLoading = ref({ '重点工作': true, '党务公开': true, '光荣榜': true })
const pdfReady = ref({ '重点工作': false, '党务公开': false, '光荣榜': false })

async function fetchPdfData() {
  const token = getToken()
  
  await Promise.all(categories.map(async (category) => {
    try {
      const res = await getPdfListApi({ type: category })
      if (res.data?.code === 200 && res.data.data?.length > 0) {
        const file = res.data.data[0]
        // 直接使用PDF预览URL，加token参数
        // 服务器返回 Content-Type: application/pdf 时，webview内置PDF渲染器直接显示
        const previewUrl = `http://123.60.91.107:2645/api/pdf/preview?id=${file.id}&token=${token}`
        pdfUrls.value[category] = previewUrl
        pdfReady.value[category] = true
        console.log(`[Page3] ${category} URL:`, previewUrl)
      }
    } catch (error) {
      console.error(`[Page3] ${category} 失败:`, error)
    } finally {
      pdfLoading.value[category] = false
    }
  }))
}

onMounted(async () => {
  await ensureLogin()
  await fetchPdfData()
  // 10秒安全超时
  setTimeout(() => { categories.forEach(c => { pdfLoading.value[c] = false }) }, 10000)
})
</script>

<style scoped>
.page3 {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 6px;
  padding: 6px;
  box-sizing: border-box;
  background: #f7eaca;
  min-height: 0;
}

.pdf-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.pdf-card-header {
  background: #d92228;
  padding: 6px;
  text-align: center;
  flex-shrink: 0;
}

.pdf-card-title {
  font-size: 16px;
  font-weight: bold;
  color: #fbbf24;
  letter-spacing: 2px;
}

.pdf-viewer-wrap {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  border: 2px solid #d92228;
  border-top: none;
}

.pdf-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 13px;
  background: #fefdf9;
}

.pdf-webview {
  width: 100%;
  height: 100%;
}
</style>
