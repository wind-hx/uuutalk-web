<template>
  <n-dropdown :options="options" @select="handleSelect">
    <div flex cursor-pointer items-center>
      <img src="@/assets/images/logo.png" alt="UUUTalk" mr10 h-35 w-35 />
      <span>{{ userStore.account }}</span>
    </div>
  </n-dropdown>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="修改登录密码"
    positive-text="确认"
    negative-text="取消"
    @positive-click="submitCallback"
    @negative-click="cancelCallback">
    <n-form ref="formRef" :model="form" :rules="rules">
      <n-form-item path="oldPassword" label="旧密码">
        <n-input
          v-model:value="form.oldPassword"
          type="password"/>
      </n-form-item>
      <n-form-item path="newPassword" label="新密码">
        <n-input
          v-model:value="form.newPassword"
          type="password"/>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from '@/store'
import { renderIcon } from '@/utils'
import api from '../../../../views/login/api'

const userStore = useUserStore()
const showModal = ref(false)
const form = ref({
  oldPassword: '',
  newPassword: '',
})

const options = [
  {
    label: '修改登录密码',
    key: 'changeLoginUserPassword',
    icon: renderIcon('mdi:password-outline', { size: '14px' }),
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon('mdi:exit-to-app', { size: '14px' }),
  },
]

function handleSelect(key) {
  if (key === 'logout') {
    $dialog.confirm({
      title: '提示',
      type: 'info',
      content: '确认退出？',
      confirm() {
        userStore.logout()
        $message.success('已退出登录')
      },
    })
  } else if (key === 'changeLoginUserPassword') {
    showModal.value = true
  }
}

function cancelCallback() {
  showModal.value = false
}

async function submitCallback() {
  if (!form.value.oldPassword) {
    $message.error('旧密码不能为空')
    return false;
  }
  if (!form.value.newPassword) {
    $message.error('新密码不能为空')
    return false;
  }
  let result = await api.changeLoginUserPassword(form.value)
  if (result.code != 200) {
    $message.error(result.message)
    return false;
  }
  $message.success('修改成功')
  userStore.logout()
  showModal.value = false
}
</script>
