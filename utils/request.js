/**
 * 基于 uni.request 的 HTTP 请求封装
 * 支持 401 自动重登录重试
 */
import { getToken, removeToken } from './token'
import { ensureLogin } from './auth'

const BASE_URL = 'http://123.60.91.107:2645/api'
let isRetrying = false

function request(url, options = {}) {
	return new Promise((resolve, reject) => {
		const token = getToken()
		uni.request({
			url: BASE_URL + url,
			method: options.method || 'GET',
			data: options.data || {},
			header: {
				'Content-Type': options.contentType || 'application/json',
				...token ? { 'Authorization': `Bearer ${token}` } : {},
				...options.headers
			},
			timeout: options.timeout || 15000,
			success: async (res) => {
				// 401 → token 过期，重登录后重试一次
				if (res.statusCode === 401 && !isRetrying) {
					isRetrying = true
					removeToken()
					console.log('[request] 401, 尝试重新登录...')
					const ok = await ensureLogin()
					isRetrying = false
					if (ok) {
						// 用新 token 重发请求
						const newToken = getToken()
						uni.request({
							url: BASE_URL + url,
							method: options.method || 'GET',
							data: options.data || {},
							header: {
								'Content-Type': options.contentType || 'application/json',
								'Authorization': `Bearer ${newToken}`,
								...options.headers
							},
							timeout: options.timeout || 15000,
							success: (retryRes) => resolve(retryRes),
							fail: (retryErr) => reject(retryErr)
						})
					} else {
						reject(new Error('重登录失败'))
					}
					return
				}
				resolve(res)
			},
			fail: (err) => {
				console.error('[request] 请求失败:', url, JSON.stringify(err).substring(0, 100))
				reject(err)
			}
		})
	})
}

export function get(url, data = {}, config = {}) {
	return request(url, { method: 'GET', data, ...config })
}

export function post(url, data = {}, config = {}) {
	return request(url, { method: 'POST', data, ...config })
}

export function put(url, data = {}, config = {}) {
	return request(url, { method: 'PUT', data, ...config })
}

export function del(url, config = {}) {
	return request(url, { method: 'DELETE', data: config.params || {}, ...config })
}
