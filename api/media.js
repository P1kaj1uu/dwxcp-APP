/**
 * 图片/视频 相关 API
 */
import { get, post, del } from '@/utils/request'

/**
 * 上传媒体文件
 */
export const uploadMediaApi = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    uni.uploadFile({
      url: 'http://123.60.91.107:2645/api/media/upload',
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

/**
 * 获取媒体文件列表
 */
export const getMediaListApi = (params) => {
  return get('/media/list', params)
}

/**
 * 查看媒体文件
 */
export const previewMediaApi = (id) => {
  return `/media/preview?id=${id}`
}

/**
 * 删除媒体文件
 */
export const deleteMediaApi = (id) => {
  return del('/media/delete', { params: { id } })
}

/**
 * 返回主页多媒体展示图片还是视频
 */
export const getShowMediaListApi = () => {
  return get('/show-media/list')
}

/**
 * 编辑主页多媒体展示图片还是视频
 */
export const editShowMediaApi = (params) => {
  return post('/show-media/edit', params)
}
