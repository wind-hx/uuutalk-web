import { request } from '@/utils'
import UUUTalkAccountApi from '../uuutalk-account/api'

export default {
  statistic: () => request.get('/v1/statistic/statistic'),
  userPlanList: () => UUUTalkAccountApi.userPlanList(),
}
