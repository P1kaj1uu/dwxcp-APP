/**
 * 评价相关 API
 */
import { get, post, del } from '@/utils/request'

/**
 * 获取评价列表
 */
export const getEvaluationListApi = (data) => {
  return get('/evaluation/list', data)
}

/**
 * 单个新增评价
 */
export const addEvaluationApi = (data) => {
  return post('/evaluation/add', data)
}

/**
 * 删除评价
 */
export const delEvaluationApi = (id) => {
  return del('/evaluation/delete', { params: { id } })
}

/**
 * 编辑评价
 */
export const editEvaluationApi = (data) => {
  return post('/evaluation/edit', data)
}

/**
 * 批量新增评价
 */
export const batchAddEvaluationApi = (data) => {
  return post('/evaluation/batch/add', data)
}
