import { request } from '@/utils'
import { v4 as uuidv4 } from 'uuid'

export default {
    list: () => request.get('/v1/uuuTalkAccount/list'),
    transportServerList: () => request.get('/v1/transportServer/query'),
    userPlanList: () => request.get('/v1/userPlan/query'),
    sendVerifiedSms: (data) => request.post('/v1/uuuTalkAccount/sendCodeByPhone', data),
    getLoginQRCode: (data) => request.post('/v1/uuuTalkAccount/getLoginQRCode', data),
    checkLoginQRCode: (data) => request.post('/v1/uuuTalkAccount/checkLoginQRCode', data),
    loginAuthCode: (data) => request.post('/v1/uuuTalkAccount/loginAuthCode', data),



    syncGroup: (id) => request.get(`/v1/uuuTalkAccount/syncGroup?id=${id}`),
    syncFriend: (id) => request.get(`/v1/uuuTalkAccount/syncFriend?id=${id}`),
    sync: (id) => request.get(`/v1/uuuTalkAccount/sync?id=${id}`),
    approvalFriendAction: (id) => request.get(`/v1/uuuTalkAccount/approvalFriend?id=${id}`),
    uuuTalkChatList: (data) => request.post('/v1/uuuTalkChat/query', data),
    yuniGroupList: (data) => request.post('/v1/uuuTalkChat/querySelfGroup', data),
    yuniFriendList: (data) => request.post('/v1/uuuTalkChat/querySelfFriend', data),
    groupInvite: (data) => request.post('/v1/uuuTalkAccount/groupInvite', data),
    delete: (id) => request.get(`/v1/uuuTalkAccount/delete?id=${id}`),
    destroy: (id) => request.get(`/v1/uuuTalkAccount/destroy?id=${id}`),
    changeImMode: (data) => request.post('/v1/uuuTalkAccount/changeImMode', data),
    leaveChat: (data) => request.post('/v1/uuuTalkAccount/unFollowFriend', data),
    defaultMessage: (data) => request.post('/v1/uuuTalkAccount/defaultMessage', data),
    setSticker: (data) => request.post('/v1/uuuTalkAccount/setSticker', data),
    cleanSticker: (id) => request.get(`/v1/uuuTalkAccount/cleanSticker?id=${id}`),
    welcomeMessage: (data) => request.post('/v1/uuuTalkAccount/welcomeMessage', data),
    cleanWelcomeMessage: (id) => request.get(`/v1/uuuTalkAccount/cleanWelcomeMessage?id=${id}`),
}