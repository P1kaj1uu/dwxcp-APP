/**
 * 考核本支部结果 API
 */
import { get, post } from '@/utils/request'

/**
 * 获取考核本支部结果列表
 */
export const getEvaluationResultList = (data) => {
  return get('/result/list', data)
}

/**
 * 新增
 */
export const addEvaluationResult = (data) => {
  return post('/result/add', data)
}

/**
 * 编辑
 */
export const editEvaluationResultById = (data) => {
  return post('/result/edit', data)
}
