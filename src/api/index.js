import { request } from '@/utils'

export default {
  getUser: () => request.get('/v1/user/getLoginUser'),
}
