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
html, body, #app, uni-app, uni-page, uni-page-wrapper, uni-page-body {
	width: 100%;
	height: 100%;
	margin: 0;
	overflow: hidden;
}

body {
	min-width: 640px;
	background: #fff;
	-webkit-font-smoothing: antialiased;
}

.uni-row {
	flex-direction: row;
}

.uni-column {
	flex-direction: column;
}
</style>
