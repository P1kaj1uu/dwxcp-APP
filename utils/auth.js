/**
 * 自动登录和登录状态管理
 * 每次启动都重新登录，确保 token 有效
 */
import { setToken, removeToken } from './token'

let _loginPromise = null

/**
 * 等待登录完成
 */
export function ensureLogin() {
  if (_loginPromise) return _loginPromise

  _loginPromise = new Promise((resolve) => {
    // 先清除旧 token，每次都重新登录
    removeToken()
    doAutoLogin().then(resolve).catch(() => resolve(false))
  })

  return _loginPromise
}

async function doAutoLogin() {
  console.log('[auth] 正在登录 admin/admin')
  try {
    const res = await uni.request({
      url: 'http://123.60.91.107:2645/api/user/login',
      method: 'POST',
      data: { username: 'admin', password: 'admin' },
      header: { 'Content-Type': 'application/json' },
      timeout: 15000
    })
    console.log('[auth] 登录响应:', JSON.stringify(res.data).substring(0, 300))

    if (res.data && res.data.code === 200) {
      const token = res.data.data && res.data.data.token
      if (token) {
        setToken(token)
        console.log('[auth] 登录成功')
        return true
      }
      // 尝试其他可能的字段名
      if (res.data.data && typeof res.data.data === 'string') {
        setToken(res.data.data)
        console.log('[auth] 登录成功(data为字符串)')
        return true
      }
    }

    console.warn('[auth] 登录失败, 完整响应:', JSON.stringify(res.data))
    return false
  } catch (err) {
    console.error('[auth] 登录异常:', JSON.stringify(err))
    return false
  }
}

/**
 * 重置登录状态
 */
export function resetLogin() {
  _loginPromise = null
}
