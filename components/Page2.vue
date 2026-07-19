<template>
  <view class="page2">
    <!-- 标题 -->
    <view class="page2-header">
      <image :src="hbgIconImage" mode="widthFix" class="header-bg"></image>
      <text class="header-title">考核评比</text>
    </view>

    <view class="page2-body">
      <view class="content-row">
        <!-- 左侧光荣榜 -->
        <view class="honor-section">
          <view
            v-for="item in honorBoard"
            :key="item.id"
            class="honor-card"
          >
            <image :src="myImage" mode="aspectFill" class="honor-photo"></image>
            <text class="honor-name">{{ item.name }}</text>
            <view class="honor-details">
              <text v-if="item.responsibilityPost" class="honor-tag">★ {{ item.responsibilityPost }}</text>
              <view v-if="item.good && item.good !== '否' && item.good !== 'x' && item.good !== 'X'" class="honor-tag">
                <image :src="siYouImage" mode="aspectFit" class="tag-icon"></image> 四优党员
              </view>
              <view v-if="item.responsibilityArea" class="honor-tag">
                <image :src="hqqImage" mode="aspectFit" class="tag-icon"></image> {{ item.responsibilityArea }}
              </view>
            </view>
          </view>
        </view>

        <!-- 右侧考核结果 -->
        <view class="evaluation-section">
          <!-- 本支部考核结果 -->
          <view class="evaluation-block">
            <text class="evaluation-title">本支部考核结果</text>
            <view class="result-table">
              <view class="result-row header">
                <text class="result-cell quarter">一季度</text>
                <text class="result-cell quarter">二季度</text>
                <text class="result-cell quarter">三季度</text>
                <text class="result-cell quarter">四季度</text>
                <text class="result-cell quarter">上年度</text>
              </view>
              <view class="result-row" v-for="(item, idx) in evaluationResults" :key="idx">
                <text class="result-cell">{{ item.one || '-' }}</text>
                <text class="result-cell">{{ item.two || '-' }}</text>
                <text class="result-cell">{{ item.three || '-' }}</text>
                <text class="result-cell">{{ item.four || '-' }}</text>
                <text class="result-cell">{{ item.years || '-' }}</text>
              </view>
            </view>
          </view>

          <!-- 党小组考核结果 -->
          <view class="evaluation-block">
            <text class="evaluation-title">党小组考核结果</text>
            <view class="branch-table-wrap">
              <!-- 固定表头 -->
              <view class="branch-table-header">
                <text class="branch-cell w-24">党小组名称</text>
                <text class="branch-cell w-12">一季度</text>
                <text class="branch-cell w-12">二季度</text>
                <text class="branch-cell w-12">三季度</text>
                <text class="branch-cell w-12">四季度</text>
                <text class="branch-cell w-12">上年度</text>
              </view>
              <!-- 滚动内容（数据复制一份拼接，CSS动画无缝循环） -->
              <view class="branch-table-scroll">
                <view
                  class="branch-table-inner"
                  :style="{ animationDuration: scrollDuration + 's' }"
                >
                  <view
                    class="branch-table-row"
                    v-for="(row, idx) in scrollRows"
                    :key="row.key + '-' + idx"
                  >
                    <text class="branch-cell w-24">{{ row.partyBranch || '-' }}</text>
                    <text class="branch-cell w-12">{{ getPartyBranchLevelStyle(row.one) }}</text>
                    <text class="branch-cell w-12">{{ getPartyBranchLevelStyle(row.two) }}</text>
                    <text class="branch-cell w-12">{{ getPartyBranchLevelStyle(row.three) }}</text>
                    <text class="branch-cell w-12">{{ getPartyBranchLevelStyle(row.four) }}</text>
                    <text class="branch-cell w-12">{{ getPartyBranchLevelStyle(row.years) }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ensureLogin } from '@/utils/auth'
import { getEvaluationListApi } from '@/api/evaluation'
import { getEvaluationResultList } from '@/api/evaluationResult'
import { getPartyBranchEvaluationListApi } from '@/api/partyBranchEvaluation'
import { hbgIconImage, hqqImage, siYouImage, myImage } from '@/utils/images'

const loading = ref(false)
const dataSource = ref([])
const evaluationResults = ref([])
const partyBranchEvaluation = ref([])
const currentQuarter = ref('')
const honorPageIndex = ref(0)
const honorDirection = ref('left')

let honorTimer = null

// 获取当前年份和季度
function getCurrentYearAndQuarter() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  let quarter = '一季度'
  if (month >= 4 && month <= 6) quarter = '二季度'
  else if (month >= 7 && month <= 9) quarter = '三季度'
  else if (month >= 10 && month <= 12) quarter = '四季度'
  return { year, quarter }
}

// 获取光荣榜数据
const HONOR_PAGE_SIZE = 6
const honorTotalPages = computed(() => Math.max(1, Math.ceil(dataSource.value.length / HONOR_PAGE_SIZE)))
const honorBoard = computed(() => {
  if (honorTotalPages.value <= 1) return dataSource.value
  const start = honorPageIndex.value * HONOR_PAGE_SIZE
  return dataSource.value.slice(start, start + HONOR_PAGE_SIZE)
})

// 党小组表格数据
const partyBranchTableData = computed(() => {
  return transformToPartyBranchData(partyBranchEvaluation.value)
})

// 复制一份数据用于无缝循环滚动
const scrollRows = computed(() => {
  const data = partyBranchTableData.value
  if (data.length === 0) return []
  return [...data, ...data]
})

// 滚动速度：每行约3秒，总时长控制在20~60秒
const scrollDuration = computed(() => {
  const n = partyBranchTableData.value.length
  if (n <= 1) return 0
  return Math.min(60, Math.max(20, n * 3))
})

// 转换党小组数据
function transformToPartyBranchData(data) {
  const grouped = {}
  data.forEach(item => {
    if (!grouped[item.partyBranch]) {
      grouped[item.partyBranch] = {
        key: item.partyBranch,
        partyBranch: item.partyBranch,
        one: '-', two: '-', three: '-', four: '-', years: '-'
      }
    }
    if (item.quarter === '一季度') grouped[item.partyBranch].one = item.level || '-'
    else if (item.quarter === '二季度') grouped[item.partyBranch].two = item.level || '-'
    else if (item.quarter === '三季度') grouped[item.partyBranch].three = item.level || '-'
    else if (item.quarter === '四季度') grouped[item.partyBranch].four = item.level || '-'
  })
  return Object.values(grouped)
}

// 党小组级别徽章
function getPartyBranchLevelStyle(value) {
  if (!value || value === '-') return '-'
  if (value === '红旗党小组') return '🚩'
  if (value === '警示党小组') return '⚠️'
  return value
}

// 获取数据
async function fetchData() {
  loading.value = true
  try {
    const { year, quarter } = getCurrentYearAndQuarter()
    currentQuarter.value = quarter
    
    const [res1, res2, res3] = await Promise.all([
      getEvaluationListApi({ pageNum: 1, pageSize: 10000, year }),
      getPartyBranchEvaluationListApi({ pageNum: 1, pageSize: 10000, year }),
      getEvaluationResultList({ pageNum: 1, pageSize: 10000, year, quarter })
    ])
    
    if (res1.data?.code === 200) dataSource.value = res1.data.data.list || []
    if (res2.data?.code === 200) partyBranchEvaluation.value = res2.data.data.list || []
    if (res3.data?.code === 200) evaluationResults.value = res3.data.data.list || []
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 30秒切换一次光荣榜
function startHonorCarousel() {
  if (honorTotalPages.value <= 1) return
  honorTimer = setInterval(() => {
    honorDirection.value = honorDirection.value === 'left' ? 'right' : 'left'
    honorPageIndex.value = (honorPageIndex.value + 1) % honorTotalPages.value
  }, 30000)
}

onMounted(async () => {
  await ensureLogin()
  const safetyTimer = setTimeout(() => {
    loading.value = false
  }, 15000)
  fetchData().then(() => {
    clearTimeout(safetyTimer)
    startHonorCarousel()
  }).catch(() => {
    clearTimeout(safetyTimer)
    loading.value = false
  })
})

onUnmounted(() => {
  if (honorTimer) clearInterval(honorTimer)
})
</script>

<style scoped>
.page2 {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page2-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  background: #d92228;
}

.header-bg {
  width: 100%;
  height: 44px;
}

.header-title {
  position: absolute;
  top: 50%;
  left: 52%;
  transform: translate(-50%, -50%);
  font-size: 22px;
  font-weight: bold;
  color: #fbbf24;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  white-space: nowrap;
  letter-spacing: 2px;
}

.page2-body {
  flex: 1;
  width: 100%;
  background: #fff;
  padding: 12px;
  box-sizing: border-box;
}

.content-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

/* 光荣榜 */
.honor-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  flex-shrink: 0;
  width: 280px;
}

.honor-card {
  overflow: hidden;
  background: #fff;
}

.honor-photo {
  width: 100%;
  height: 80px;
  display: block;
}

.honor-name {
  background: #a73300;
  color: #fff;
  text-align: center;
  padding: 4px;
  font-weight: bold;
  font-size: 14px;
  display: block;
}

.honor-details {
  padding: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: #333;
}

.honor-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 2px 0;
}

.tag-icon {
  width: 11px;
  height: 11px;
}

/* 考核结果 */
.evaluation-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.evaluation-block {
  flex: 1;
}

.evaluation-title {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 16px;
  color: red;
  text-align: center;
  display: block;
}

/* 本支部考核结果表格 */
.result-table {
  width: 100%;
  border: 1px solid #d9d9d9;
}

.result-row {
  display: flex;
}

.result-row.header {
  background: #a73300;
}

.result-row:nth-child(odd):not(.header) {
  background: #fafafa;
}

.result-cell {
  flex: 1;
  text-align: center;
  padding: 6px 4px;
  font-size: 13px;
  border-right: 1px solid #d9d9d9;
  border-bottom: 1px solid #d9d9d9;
}

.result-row.header .result-cell {
  color: #fff;
  font-weight: bold;
  font-size: 14px;
}

.result-cell:last-child {
  border-right: none;
}

.result-cell.quarter {
  flex: 1;
}

/* 党小组表格 */
.branch-table-wrap {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #a73300;
}

.branch-table-header {
  display: flex;
  background: #a73300;
  flex-shrink: 0;
}

.branch-table-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.branch-table-inner {
  animation: branchScroll linear infinite;
}

@keyframes branchScroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

.branch-table-row {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
}

.branch-table-row:last-child {
  border-bottom: none;
}

.branch-table-row:nth-child(odd) {
  background: #fafafa;
}

.branch-cell {
  text-align: center;
  padding: 6px 8px;
  font-size: 13px;
  color: #333;
  border-right: 1px solid #d9d9d9;
}

.branch-cell:last-child {
  border-right: none;
}

.branch-table-header .branch-cell {
  color: #fff;
  font-weight: bold;
}

.w-24 { width: 24%; }
.w-12 { width: 12.66%; }
</style>
