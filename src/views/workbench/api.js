import { request } from '@/utils'
import YuniAccountApi from '../yuni-account/api'

export default {
  statistic: () => request.get('/v1/statistic/statistic'),
  userPlanList: () => YuniAccountApi.userPlanList(),
}
