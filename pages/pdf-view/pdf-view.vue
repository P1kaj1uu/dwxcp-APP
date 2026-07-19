<template>
  <view class="pdf-preview-page">
    <web-view :src="pdfUrl"></web-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const pdfUrl = ref('')

onLoad((options) => {
  if (options.url) {
    pdfUrl.value = decodeURIComponent(options.url)
  }
})
</script>

<style>
.pdf-preview-page {
  width: 100%;
  height: 100vh;
}
</style>
