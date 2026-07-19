/**
 * 基本情况人员数量年龄模块 API
 */
import { get, post } from '@/utils/request'

/**
 * 查询基本信息人员年龄等情况列表
 */
export const getBasicInfoNumList = (data) => {
  return get('/basic-info-num/list', data)
}

/**
 * 新增
 */
export const addBasicInfoNum = (data) => {
  return post('/basic-info-num/add', data)
}

/**
 * 编辑
 */
export const editBasicInfoNumById = (data) => {
  return post('/basic-info-num/edit', data)
}
