/**
 * 基本情况相关 API
 */
import { get, post, del } from '@/utils/request'

/**
 * 获取基本情况列表
 */
export const getBasicListApi = (data) => {
  return get('/basic/list', data)
}

/**
 * 按部门筛选
 */
export const getBasicByTypeApi = (type) => {
  return get('/basic/find', { type })
}

/**
 * 新增基本情况
 */
export const addBasicApi = (data) => {
  return post('/basic/add', data)
}

/**
 * 删除基本情况
 */
export const delBasicApi = (id) => {
  return del('/basic/delete', { params: { id } })
}

/**
 * 编辑基本情况
 */
export const editBasicApi = (data) => {
  return post('/basic/edit', data)
}

/**
 * 上传照片
 */
export const uploadPhotoApi = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    uni.uploadFile({
      url: 'http://123.60.91.107:2645/api/basic/upload-photo',
      filePath,
      name: 'file',
      header: {
        ...token ? { 'Authorization': `Bearer ${token}` } : {}
      },
      success: resolve,
      fail: reject
    })
  })
}
