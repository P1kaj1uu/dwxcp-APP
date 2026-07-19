/**
 * 认证相关 API
 */
import { post } from '@/utils/request'

/**
 * 用户登录
 */
export const loginApi = (data) => {
  return post('/user/login', data)
}

/**
 * 用户注册
 */
export const registerApi = (data) => {
  return post('/user/register', data)
}
