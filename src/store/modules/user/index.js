import { defineStore } from 'pinia'
import { resetRouter } from '@/router'
import { useTagsStore, usePermissionStore } from '@/store'
import { removeToken, setToken, toLogin } from '@/utils'
import api from '@/api'

export const useUserStore = defineStore('user', {
  state() {
    return {
      userInfo: {},
    }
  },
  getters: {
    userId() {
      return this.userInfo?.id
    },
    account() {
      return this.userInfo?.account
    },
    avatar() {
      return this.userInfo?.avatar
    },
    role() {
      return this.userInfo?.role || []
    },
    type() {
      return this.userInfo?.type
    },
    expire() {
      return this.userInfo?.expire
    },
    superiorRemark() {
      return this.userInfo?.superiorRemark
    }
  },
  actions: {
    async getUserInfo() {
      try {
        const res = await api.getUser()
        const { id, account, avatar, role, type, expire, token, superiorRemark } = res.data
        this.userInfo = { id, account, avatar, role, type, expire, superiorRemark }
        if (token) {
          setToken(token)
        }
        return Promise.resolve(res.data)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async logout() {
      const { resetTags } = useTagsStore()
      const { resetPermission } = usePermissionStore()
      removeToken()
      resetTags()
      resetPermission()
      resetRouter()
      this.$reset()
      toLogin()
    },
    setUserInfo(userInfo = {}) {
      this.userInfo = { ...this.userInfo, ...userInfo }
    },
  },
})
