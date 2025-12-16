import { request } from '@/utils'
import { v4 as uuidv4 } from 'uuid'

export default {
    list: () => request.get('/v1/uuuTalkAccount/list'),
    transportServerList: () => request.get('/v1/transportServer/query'),
    userPlanList: () => request.get('/v1/userPlan/query'),
    sendPhoneVerifiedSms: (data) => request.post('/v1/uuuTalkAccount/sendCodeByPhone', data),
    sendMailVerifiedSms: (data) => request.post('/v1/uuuTalkAccount/sendCodeByMail', data),
    login: (data) => request.post('/v1/uuuTalkAccount/login', data),
    getLoginQRCode: (data) => request.post('/v1/uuuTalkAccount/getLoginQRCode', data),
    checkLoginQRCode: (data) => request.post('/v1/uuuTalkAccount/checkLoginQRCode', data),
    loginAuthCode: (data) => request.post('/v1/uuuTalkAccount/loginAuthCode', data),
    sync: (id) => request.get(`/v1/uuuTalkAccount/sync?id=${id}`),
    defaultMessage: (data) => request.post('/v1/uuuTalkAccount/defaultMessage', data),
    cleanDefaultMessage: (id) => request.get(`/v1/uuuTalkAccount/cleanDefaultMessage?id=${id}`),
    welcomeMessage: (data) => request.post('/v1/uuuTalkAccount/welcomeMessage', data),
    cleanWelcomeMessage: (id) => request.get(`/v1/uuuTalkAccount/cleanWelcomeMessage?id=${id}`),


    syncGroup: (id) => request.get(`/v1/uuuTalkAccount/syncGroup?id=${id}`),
    syncFriend: (id) => request.get(`/v1/uuuTalkAccount/syncFriend?id=${id}`),
    approvalFriendAction: (id) => request.get(`/v1/uuuTalkAccount/approvalFriend?id=${id}`),
    uuuTalkChatList: (data) => request.post('/v1/uuuTalkChat/query', data),
    uuuTalkGroupList: (data) => request.post('/v1/uuuTalkChat/querySelfGroup', data),
    uuuTalkFriendList: (data) => request.post('/v1/uuuTalkChat/querySelfUser', data),
    groupInvite: (data) => request.post('/v1/uuuTalkAccount/groupInvite', data),
    delete: (id) => request.get(`/v1/uuuTalkAccount/delete?id=${id}`),
    destroy: (id) => request.get(`/v1/uuuTalkAccount/destroy?id=${id}`),
    changeImMode: (data) => request.post('/v1/uuuTalkAccount/changeImMode', data),
    leaveChat: (data) => request.post('/v1/uuuTalkAccount/unFollowFriend', data),
    setSticker: (data) => request.post('/v1/uuuTalkAccount/setSticker', data),
    cleanSticker: (id) => request.get(`/v1/uuuTalkAccount/cleanSticker?id=${id}`),
}