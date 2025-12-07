import { request } from '@/utils'
import yuni_account_api from '~/src/views/yuni-account/api'

export default {
  yuniAccountList: () => yuni_account_api.list(),
}
