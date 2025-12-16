import { request } from '@/utils'
import uuu_talk_account_api from '~/src/views/uuutalk-account/api'

export default {
    taskList: (data) => request.post('/v1/task/query', data),
    taskSave: (data) => request.post('/v1/task/save', data),
    taskUpdate: (data) => request.post('/v1/task/update', data),
    accountList: () => uuu_talk_account_api.list(),
    taskStart: (id) => request.get(`/v1/task/start?id=${id}`),
    taskStop: (id) => request.get(`/v1/task/stop?id=${id}`),
    taskDelete: (id) => request.get(`/v1/task/delete?id=${id}`),
    taskGet: (id) => request.get(`/v1/task/get?id=${id}`),
    sendRecordQuery: (data) => request.post('/v1/task/sendRecordQuery', data),
    tgChatQuerySelfGroup: (data) => request.post(`/v1/uuuTalkChat/querySelfGroup`, data),
    tgChatQuerySelfFriend: (data) => request.post(`/v1/uuuTalkChat/querySelfUser`, data),
    inviteTaskList: (data) => request.post('/v1/inviteTask/query', data),
    inviteTaskSave: (data) => request.post('/v1/inviteTask/save', data),
    inviteTaskDetails: (data) => request.post(`/v1/inviteTask/details`, data),
    inviteTaskStart: (id) => request.get(`/v1/inviteTask/start?id=${id}`),
    inviteTaskStop: (id) => request.get(`/v1/inviteTask/stop?id=${id}`),
    inviteTaskDelete: (id) => request.get(`/v1/inviteTask/delete?id=${id}`),

}