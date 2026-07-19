<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'

onLaunch(() => {
  console.log('App Launch')
  // 启动时开始自动登录
  ensureLogin()
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/*每个页面公共css */
.uni-row {
	flex-direction: row;
}

.uni-column {
	flex-direction: column;
}
</style>
