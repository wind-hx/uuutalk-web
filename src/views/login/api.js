import { request } from '@/utils'

export default {
    login: (data) => request.post('/v1/user/login', data, { noNeedToken: true }),
    register: (data) => request.post('/v1/user/register', data, { noNeedToken: true }),
    changeLoginUserPassword: (data) => request.post('/v1/user/changeLoginUserPassword', data),
}