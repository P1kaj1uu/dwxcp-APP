/**
 * 党小组评价相关 API
 */
import { get, post, del } from '@/utils/request'

/**
 * 获取党小组评价列表
 */
export const getPartyBranchEvaluationListApi = (data) => {
  return get('/party-branch/evaluation/list', data)
}

/**
 * 新增
 */
export const addPartyBranchEvaluationApi = (data) => {
  return post('/party-branch/evaluation/add', data)
}

/**
 * 删除
 */
export const deletePartyBranchEvaluationByIdApi = (id) => {
  return del('/party-branch/evaluation/delete', { params: { id } })
}

/**
 * 编辑
 */
export const editPartyBranchEvaluationByIdApi = (data) => {
  return post('/party-branch/evaluation/edit', data)
}
