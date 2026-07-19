/**
 * Token 管理工具
 */
const TOKEN_KEY = 'dwxcp_token'

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function setToken(token) {
  const tokenValue = token ? token : generateToken()
  uni.setStorageSync(TOKEN_KEY, tokenValue)
}

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || null
}

export function removeToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

export function isAuthenticated() {
  return !!getToken()
}

export function setStorageItem(key, value) {
  uni.setStorageSync(key, value)
}

export function getStorageItem(key) {
  return uni.getStorageSync(key) || null
}

export function removeStorageItem(key) {
  uni.removeStorageSync(key)
}

export function clearStorage() {
  uni.clearStorageSync()
}
