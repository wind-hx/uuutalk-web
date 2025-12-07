import { request } from '@/utils'
import user_api from '~/src/api'

export default {
  notifyList: (data) => request.post('/v1/notify/query', data),
  getWxPushQRCode: () => request.get('/v1/user/getWxPushQRCode', { responseType: 'blob' }),
  checkWxPushQRCode: () => request.get('/v1/user/checkWxPushQRCode'),
  cleanWxPushToken: () => request.get('/v1/user/cleanWxPushToken'),
  getUser: () => user_api.getUser(),
}
