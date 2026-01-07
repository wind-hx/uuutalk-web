import { request } from '@/utils'
import { v4 as uuidv4 } from 'uuid'

export default {
    list: () => request.get('/v1/uuuTalkAccount/list'),
    transportServerList: () => request.get('/v1/transportServer/query'),
    userPlanList: () => request.get('/v1/userPlan/query'),
    sendPhoneVerifiedSms: (data) => request.post('/v1/uuuTalkAccount/sendCodeByPhone', data),
    sendMailVerifiedSms: (data) => request.post('/v1/uuuTalkAccount/sendCodeByMail', data),
    delete: (id) => request.get(`/v1/uuuTalkAccount/delete?id=${id}`),
    login: (data) => request.post('/v1/uuuTalkAccount/login', data),
    getLoginQRCode: (data) => request.post('/v1/uuuTalkAccount/getLoginQRCode', data),
    checkLoginQRCode: (data) => request.post('/v1/uuuTalkAccount/checkLoginQRCode', data),
    sync: (id) => request.get(`/v1/uuuTalkAccount/sync?id=${id}`),
    defaultMessage: (data) => request.post('/v1/uuuTalkAccount/defaultMessage', data),
    cleanDefaultMessage: (id) => request.get(`/v1/uuuTalkAccount/cleanDefaultMessage?id=${id}`),
    welcomeMessage: (data) => request.post('/v1/uuuTalkAccount/welcomeMessage', data),
    cleanWelcomeMessage: (id) => request.get(`/v1/uuuTalkAccount/cleanWelcomeMessage?id=${id}`),
    rechargeCreate: (data) => request.post('/v1/recharge/create', data),
    approvalFriendAction: (id) => request.get(`/v1/uuuTalkAccount/approvalFriend?id=${id}`),
    destroy: (id) => request.get(`/v1/uuuTalkAccount/destroy?id=${id}`),
    uuuTalkChatList: (data) => request.post('/v1/uuuTalkChat/query', data),
    exportGroupMemberUid: (id, toId) =>
        request.get(`/v1/uuuTalkAccount/exportGroupMemberUid?id=${id}&toId=${toId}`),
}
