/**
 * PDF 文件相关 API
 */
import { get, post, del } from '@/utils/request'

/**
 * 上传 PDF 文件
 */
export const uploadPdfApi = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    uni.uploadFile({
      url: 'http://123.60.91.107:2645/api/pdf/upload',
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
 * 获取 PDF 文件列表
 */
export const getPdfListApi = (params) => {
  return get('/pdf/list', params)
}

/**
 * 查看 PDF 文件
 */
export const previewPdfApi = (id) => {
  return `/pdf/preview?id=${id}`
}

/**
 * 删除 PDF 文件
 */
export const deletePdfApi = (id) => {
  return del('/pdf/delete', { params: { id } })
}
