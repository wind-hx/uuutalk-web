import { request } from '@/utils'

export default {
  list: () => request.get('/v1/userPlan/query'),
}
