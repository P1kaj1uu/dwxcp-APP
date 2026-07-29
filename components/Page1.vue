<template>
  <view class="page1">
    <!-- 标题图片 -->
    <view class="page1-header">
      <image :src="hbgIconImage" mode="heightFix" class="header-bg"></image>
      <text class="header-title">基本情况</text>
    </view>

    <!-- 中间区域 -->
    <view class="page1-body">
      <!-- 骨架屏加载 -->
      <view v-if="showSkeleton" class="skeleton-container">
        <view v-for="i in 3" :key="i" class="skeleton-group">
          <view class="skeleton-title"></view>
          <view class="skeleton-cards">
            <view v-for="j in 5" :key="j" class="skeleton-card-item">
              <view class="skeleton-avatar"></view>
              <view class="skeleton-line short"></view>
              <view class="skeleton-line shorter"></view>
            </view>
          </view>
          <view class="skeleton-stats"></view>
        </view>
      </view>

      <!-- 数据为空 -->
      <view v-if="!showSkeleton && !loading && groupedData.length === 0" class="empty-data">
        暂无数据
      </view>

      <!-- 正常数据展示 -->
      <view v-if="!showSkeleton && !loading && groupedData.length > 0" class="groups-container">
        <view v-for="(group, idx) in groupedData" :key="idx" class="group-item">
          <!-- 部门标题 -->
          <view class="group-title">
            <image v-if="group.image" :src="group.image" mode="aspectFit" class="group-icon"></image>
            <text>{{ group.title }}</text>
          </view>

          <!-- 成员轮播 -->
          <view class="member-carousel">
            <view class="member-row"
              :style="{ animation: `slideInFrom-${slideDirection[group.title] === 1 ? 'right' : 'left'} 0.6s ease` }">
              <view v-for="(member, mIdx) in getCurrentPageMembers(group)" :key="member.id || mIdx" class="member-card">
                <image :src="getPhotoUrl(member.photo)" mode="scaleToFill" class="member-photo"></image>
                <text class="member-label">姓名：<text class="member-value">{{ member.name }}</text></text>
                <text class="member-label">职务：<text class="member-value">{{ member.position }}</text></text>
              </view>
            </view>
          </view>

          <!-- 统计信息 -->
          <view class="stats-info">
            <text class="stats-text">{{ getStatsText(group.title) }}</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ensureLogin } from '@/utils/auth'
import { getBasicByTypeApi } from '@/api/basic'
import { getEvaluationResultList } from '@/api/evaluationResult'
import { getBasicInfoNumList } from '@/api/basicInfoNum'
import { hbgIconImage, danghuiImage, tuanhuiImage, gonghuiImage } from '@/utils/images'

const loading = ref(false)
const groupedData = ref([])
const evaluationResults = ref([])
const basicInfoNums = ref([])
const showSkeleton = ref(true)
const pageIndexes = ref({})
const slideDirection = ref({})

const departmentOptions = [
  { label: "党支部委员会", value: "党支部委员会", image: danghuiImage },
  { label: "车间分会委员会", value: "车间分会委员会", image: gonghuiImage },
  { label: "团支部委员会", value: "团支部委员会", image: tuanhuiImage },
]

let carouselTimer = null
let refreshTimer = null

// 按部门分组
function groupByType(data) {
  const groups = {}
  const orderMap = { '党支部委员会': 1, '车间分会委员会': 2, '团支部委员会': 3 }

  data.forEach(member => {
    if (!groups[member.type]) groups[member.type] = []
    groups[member.type].push(member)
  })

  return Object.keys(groups)
    .sort((a, b) => (orderMap[a] || 999) - (orderMap[b] || 999))
    .map(key => ({
      title: key,
      content: groups[key],
      image: departmentOptions.find(opt => opt.value === key)?.image || null
    }))
}

// 获取图片URL
function getPhotoUrl(photo) {
  if (!photo) return 'https://randomuser.me/api/portraits/men/default.jpg'
  if (photo.startsWith('data:image')) return photo
  return `data:image/jpeg;base64,${photo}`
}

// 获取当前页成员
function getCurrentPageMembers(group) {
  const totalPages = Math.max(1, Math.ceil(group.content.length / 5))
  const currentPage = Math.min(pageIndexes.value[group.title] || 0, totalPages - 1)
  const startIdx = currentPage * 5
  return group.content.slice(startIdx, startIdx + 5)
}

// 获取统计信息文本
function getStatsText(title) {
  const stats = basicInfoNums.value[0] || {}
  switch (title) {
    case "党支部委员会":
      return `现有党员${stats.partyNum1 || 0}名，其中预备党员${stats.partyNum2 || 0}名，平均年龄${stats.partyNum3 || 0}岁；现有发展党员${stats.partyNum4 || 0}名，入党积极分子${stats.partyNum5 || 0}名，递交入党申请书${stats.partyNum6 || 0}名。`
    case "车间分会委员会":
      return `现有班组${stats.cheNum1 || 0}个，分会会员${stats.cheNum2 || 0}名。`
    case "团支部委员会":
      return `现有团员${stats.tuanNum1 || 0}名，预备团委${stats.tuanNum2 || 0}名，平均年龄${stats.tuanNum3 || 0}岁；现有青工（35岁及以下）${stats.tuanNum4 || 0}名。`
    default:
      return ""
  }
}

// 获取所有部门数据
async function fetchAllData() {
  loading.value = true
  showSkeleton.value = true
  try {
    const promises = departmentOptions.map(opt => getBasicByTypeApi(opt.value))
    const results = await Promise.all(promises)

    let allMembers = []
    results.forEach((res, index) => {
      if (res.data && res.data.code === 200) {
        let data = res.data.data
        let members = []
        if (Array.isArray(data)) {
          members = data
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.list)) members = data.list
          else if (Array.isArray(data.records)) members = data.records
          else if (Array.isArray(data.content)) members = data.content
          else if (Array.isArray(data.items)) members = data.items
          else members = [data]
        }
        members = members.map(m => ({
          ...m,
          type: m.type || departmentOptions[index].value
        }))
        allMembers.push(...members)
      }
    })

    const groups = groupByType(allMembers)
    groupedData.value = groups

    // 初始化轮播索引
    const initIndexes = {}
    const initDirs = {}
    groups.forEach(g => {
      initIndexes[g.title] = 0
      initDirs[g.title] = 1
    })
    pageIndexes.value = initIndexes
    slideDirection.value = initDirs
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
    setTimeout(() => { showSkeleton.value = false }, 300)
  }
}

async function fetchEvaluationResults() {
  try {
    const [res1, res2] = await Promise.all([
      getEvaluationResultList({ pageNum: 1, pageSize: 10 }),
      getBasicInfoNumList({ pageNum: 1, pageSize: 10 })
    ])
    evaluationResults.value = res1.data?.data?.list || []
    basicInfoNums.value = res2.data?.data?.list || []
  } catch (error) {
    console.error('获取考核结果等数据失败:', error)
  }
}

// 每5秒切换轮播
function startCarousel() {
  carouselTimer = setInterval(() => {
    const next = { ...pageIndexes.value }
    const nextDir = { ...slideDirection.value }

    groupedData.value.forEach(group => {
      const totalPages = Math.ceil(group.content.length / 5)
      if (totalPages <= 1) {
        next[group.title] = 0
        nextDir[group.title] = 1
        return
      }
      const currentDir = slideDirection.value[group.title] || 1
      const currentPage = pageIndexes.value[group.title] || 0
      let newPage = currentPage + currentDir

      if (newPage >= totalPages) {
        newPage = totalPages - 2
        nextDir[group.title] = -1
      } else if (newPage < 0) {
        newPage = 1
        nextDir[group.title] = 1
      }
      next[group.title] = newPage
    })

    pageIndexes.value = next
    slideDirection.value = nextDir
  }, 5000)
}

onMounted(async () => {
  await ensureLogin()
  // 安全超时：15秒后无论请求是否完成都隐藏骨架屏
  const safetyTimer = setTimeout(() => {
    showSkeleton.value = false
    loading.value = false
  }, 15000)

  fetchEvaluationResults()
  fetchAllData().then(() => {
    clearTimeout(safetyTimer)
    // startCarousel()
  }).catch(() => {
    clearTimeout(safetyTimer)
    showSkeleton.value = false
    loading.value = false
  })

  // 每10秒刷新数据
  // refreshTimer = setInterval(() => {
  //   fetchAllData()
  //   fetchEvaluationResults()
  // }, 10000)
})

onUnmounted(() => {
  if (carouselTimer) clearInterval(carouselTimer)
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.page1 {
  position: relative;
  width: 100%;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.page1-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  background: #d92228;
  height: clamp(24px, 4.08vh, 88px);
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: auto;
  height: 100%;
  display: block;
}

.header-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(12px, 1.15vw, 44px);
  font-weight: bold;
  color: #fbbf24;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  letter-spacing: 2px;
  z-index: 1;
}

.page1-body {
  flex: 1;
  width: 100%;
  background: #ffffe7;
  padding: clamp(3px, 0.42vw, 16px);
  box-sizing: border-box;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.groups-container {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-auto-rows: minmax(0, 1fr);
  gap: clamp(2px, 0.37vh, 8px);
  overflow: hidden;
}

/* 骨架屏 */
.skeleton-container {
  flex: 1;
  min-height: 0;
  padding: clamp(3px, 0.42vw, 16px);
  overflow: hidden;
}

.skeleton-group {
  margin-bottom: clamp(6px, 1.1vh, 24px);
}

.skeleton-title {
  width: 25%;
  height: clamp(10px, 1.04vw, 40px);
  background: #e0e0e0;
  border-radius: 4px;
  margin: 0 auto clamp(4px, 0.74vh, 16px);
  animation: shimmer 1.5s infinite;
}

.skeleton-cards {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(3px, 0.63vw, 24px);
  justify-content: center;
  margin-bottom: clamp(3px, 0.56vh, 12px);
}

.skeleton-card-item {
  width: 15%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2px, 0.21vw, 8px);
}

.skeleton-avatar {
  width: clamp(20px, 1.98vw, 76px);
  height: clamp(20px, 1.98vw, 76px);
  background: #e0e0e0;
  border-radius: 50%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line {
  height: clamp(6px, 0.63vw, 24px);
  background: #e0e0e0;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 70%;
}

.skeleton-line.shorter {
  width: 56%;
}

.skeleton-stats {
  width: 75%;
  height: clamp(24px, 4.63vh, 100px);
  background: #e0e0e0;
  border-radius: 4px;
  margin: 0 auto;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
}

.empty-data {
  text-align: center;
  padding: clamp(20px, 2.08vw, 80px);
  font-size: clamp(10px, 0.83vw, 32px);
  color: #999;
}

.group-item {
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.group-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(10px, 0.94vw, 36px);
  font-weight: 700;
  color: #dc2626;
  text-align: center;
  margin-bottom: clamp(8px, 0.67vh, 16px);
  flex-shrink: 0;
}

.group-icon {
  width: clamp(11px, 1.04vw, 40px);
  height: clamp(11px, 1.04vw, 40px);
  margin-right: clamp(3px, 0.31vw, 12px);
}

.member-carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
  /* flex: 1; */
  min-height: 0;
}

.member-row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: clamp(2px, 0.21vw, 8px);
  /* height: 100%; */
  min-height: 0;
}

.member-card {
  /* flex: 0 1 calc((100% - clamp(8px, 0.84vw, 32px)) / 5); */
  min-width: 0;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto auto;
  align-content: start;
  gap: 0;
  border: 1px solid black;
  overflow: hidden;
}

.member-photo {
  width: 100%;
  height: clamp(52px, 8vh, 172px);
  display: block;
  align-self: start;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.member-label {
  width: 100%;
  min-width: 0;
  font-size: clamp(7px, 0.63vw, 24px);
  font-weight: 700;
  /* text-align: center; */
  line-height: 1.2;
  padding: 1px 2px;
  margin: 0;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.member-value {
  position: relative;
  display: inline;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.stats-info {
  padding: 0 clamp(2px, 0.63vw, 24px);
  margin: 20px clamp(3px, 1.25vw, 48px) 0;
  font-weight: 700;
  flex-shrink: 0;
}

.stats-text {
  display: block;
  font-size: clamp(7px, 0.63vw, 24px);
  line-height: 1.2;
  color: #374151;
  text-align: center;
}

@keyframes slideInFrom-right {
  0% {
    opacity: 0;
    transform: translateX(30px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFrom-left {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
