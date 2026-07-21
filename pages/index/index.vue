<template>
  <view class="home-container">
    <view class="home-inner">
      <!-- 左边：Page1 基本情况 -->
      <view class="left-panel">
        <Page1 />
      </view>

      <!-- 右边区域 -->
      <view class="right-panel">
        <view class="right-flex-row">
          <!-- 右列1：四强/四优 + Page2 -->
          <view class="right-col">
            <view class="sqiq-boxes">
              <view class="sqiq-item">
                <view class="sqiq-header sqiq-red">四强</view>
                <view class="sqiq-body">
                  <text class="sqiq-text">支部班子强</text>
                  <text class="sqiq-text">党员队伍强</text>
                  <text class="sqiq-text">基础工作强</text>
                  <text class="sqiq-text">堡垒作用强</text>
                </view>
              </view>
              <view class="sqiq-item">
                <view class="sqiq-header sqiq-red">四优</view>
                <view class="sqiq-body">
                  <text class="sqiq-text">政治素质优</text>
                  <text class="sqiq-text">工作业绩优</text>
                  <text class="sqiq-text">岗位技能优</text>
                  <text class="sqiq-text">群众评价优</text>
                </view>
              </view>
            </view>
            <view class="page2-wrap">
              <Page2 />
            </view>
          </view>

          <!-- 右列2：Page3 + Page4 -->
          <view class="right-col">
            <view class="page3-wrap">
              <Page3 />
            </view>
            <view class="page4-wrap">
              <Page4 />
            </view>
          </view>
        </view>

        <!-- 底部标语 -->
        <view class="bottom-banner">
          <view class="banner-line"></view>
          <text class="banner-text">牢记历史使命&nbsp;&nbsp;&nbsp;&nbsp;不负时代担当</text>
          <view class="banner-line"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import Page1 from '@/components/Page1.vue'
import Page2 from '@/components/Page2.vue'
import Page3 from '@/components/Page3.vue'
import Page4 from '@/components/Page4.vue'
</script>

<style>
page {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

view,
text,
image {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #fff;
}

.home-inner {
  width: 100%;
  height: 100%;
  padding: clamp(6px, 0.83vw, 32px);
  padding-bottom: 0;
  display: flex;
  gap: clamp(6px, 0.83vw, 32px);
  box-sizing: border-box;
}

/* 左侧 33% */
.left-panel {
  width: 33%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 右侧 66% */
.right-panel {
  display: flex;
  flex-direction: column;
  width: 66%;
  height: 100%;
  min-height: 0;
}

.right-flex-row {
  display: flex;
  gap: clamp(6px, 0.83vw, 32px);
  flex: 1;
  min-height: 0;
}

/* 右侧每列 50% */
.right-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 四强/四优盒子 */
.sqiq-boxes {
  display: flex;
  justify-content: space-between;
  gap: clamp(4px, 0.63vw, 24px);
  margin-bottom: clamp(8px, 1.2vh, 24px);
  flex-shrink: 0;
}

.sqiq-item {
  flex: 1;
  text-align: center;
  border: 1px solid #b5b6b5;
}

.sqiq-header {
  height: clamp(24px, 4.05vh, 88px);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: clamp(12px, 1.15vw, 44px);
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.sqiq-red {
  background-color: #da2129;
  color: rgb(251, 191, 36);
}

.sqiq-body {
  color: #b4360c;
  font-size: clamp(11px, 1.04vw, 40px);
  font-weight: bold;
  letter-spacing: 2px;
}

.sqiq-text {
  display: block;
  padding: clamp(5px, 1.35vh, 28px) clamp(4px, 0.7vw, 28px) 0;
}

.sqiq-text:last-child {
  padding-bottom: clamp(8px, 2.6vh, 52px);
}

/* Page2 容器 */
.page2-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page3-wrap {
  flex: 1;
  min-height: 0;
  margin-bottom: clamp(5px, 0.83vh, 16px);
  display: flex;
  flex-direction: column;
}

.page4-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 底部标语横幅 */
.bottom-banner {
  height: clamp(32px, 5.93vh, 128px);
  background-color: #a53605;
  margin-top: clamp(4px, 0.63vh, 14px);
  font-size: clamp(12px, 1.15vw, 44px);
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 1.04vw, 40px);
  flex-shrink: 0;
}

.banner-line {
  width: min(9.4vw, 360px);
  height: clamp(1px, 0.1vw, 4px);
  background-color: #fff;
}

@media (max-aspect-ratio: 4/3) {
  .home-inner {
    padding-left: 6px;
    padding-right: 6px;
    gap: 6px;
  }

  .left-panel {
    width: 36%;
  }

  .right-panel {
    width: 64%;
  }

  .right-flex-row {
    gap: 6px;
  }

  .banner-line {
    width: 6vw;
  }
}

.banner-text {
  white-space: nowrap;
}
</style>
