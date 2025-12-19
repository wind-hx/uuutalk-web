<template>
  <AppPage :show-footer="true" bg-cover :style="{ backgroundImage: `url(${bgImg})` }">
    <div
      style="transform: translateY(25px)"
      class="m-auto max-w-700 min-w-345 f-c-c rounded-10 bg-white bg-opacity-60 p-15 card-shadow"
      dark:bg-dark>
      <div hidden w-380 px-20 py-35 md:block>
        <img src="@/assets/images/login_banner.webp" w-full alt="login_banner" />
      </div>

      <div w-320 flex-col px-20 py-35>
        <h5 f-c-c text-24 font-normal color="#6a6a6a">
          <icon-custom-logo mr-10 text-50 color-primary />{{ title }}
        </h5>
        <div mt-30>
          <n-input
            v-model:value="loginInfo.name"
            autofocus
            class="h-50 items-center pl-10 text-16"
            placeholder="请输入用户名"
            :maxlength="20"
          />
        </div>
        <div mt-30>
          <n-input
            v-model:value="loginInfo.password"
            class="h-50 items-center pl-10 text-16"
            type="password"
            show-password-on="mousedown"
            placeholder="请输入密码"
            :maxlength="20"
            @keydown.enter="handleLogin"
          />
        </div>

        <div mt-20>
          <n-checkbox
            :checked="isRemember"
            label="记住我"
            :on-update:checked="(val) => (isRemember = val)"
          />
        </div>

        <div mt-20>
          <n-button
            h-50
            w-full
            rounded-5
            text-16
            type="primary"
            :loading="loading"
            @click="handleLogin">
            登录
          </n-button>
        </div>

        <div mt-20>
          <n-button
            ghost
            h-50
            w-full
            rounded-5
            text-16
            type="error"
            :loading="loading"
            @click="showRegisterView = true">
            注册
          </n-button>
        </div>
      </div>
    </div>

    <n-modal
			v-model:show="showRegisterView"
			:mask-closable="false"
			preset="dialog"
			title="注册"
			positive-text="确认"
			negative-text="取消"
			@positive-click="registerAction"
			@negative-click="onNegativeClick">
      <div mt-30>
        <n-input
          v-model:value="loginInfo.name"
          autofocus
          class="h-50 items-center pl-10 text-16"
          placeholder="请输入用户名"
          :maxlength="20" />
      </div>
			
      <div mt-30>
        <n-input
          v-model:value="loginInfo.password"
          class="h-50 items-center pl-10 text-16"
          type="password"
          show-password-on="mousedown"
          placeholder="请输入密码"
          :maxlength="20" />
      </div>

      <div mt-30>
        <n-input-group>
          <n-input
            v-model:value="loginInfo.code"
            class="h-50 items-center pl-10 text-16"
            show-password-on="mousedown"
            placeholder="请输入验证码"
            :maxlength="20" />
          <img :src="codeImageUrl" h-50 @click="initCodeImage"/>
        </n-input-group>
      </div>

      <div mt-30>
        <n-input-group>
          <n-input
            :disabled="loginInfo.hasInviterCode"
            v-model:value="loginInfo.inviter"
            class="h-50 items-center pl-10 text-16"
            placeholder="请输入邀请码（可选）" />
        </n-input-group>
      </div>
		</n-modal>
  </AppPage>
</template>

<script setup>
import { lStorage, setToken } from '@/utils'
import { useStorage } from '@vueuse/core'
import bgImg from '@/assets/images/login_bg.webp'
import api from './api'
import { addDynamicRoutes } from '@/router'
import { v4 as uuidv4 } from 'uuid';

const title = import.meta.env.VITE_TITLE

const router = useRouter()
const { query } = useRoute()

const loginInfo = ref({
  name: '',
  password: '',
  uuid: uuidv4(),
  code: '',
  inviter: '',
  hasInviterCode: false,
})
const showRegisterView = ref(false)
const codeImageUrl = ref('')

initCodeImage()
initLoginInfo()
load()

function load() {
  const code = localStorage.getItem('inviteCode')
  if (code) {
    loginInfo.value.inviter = code
    loginInfo.value.hasInviterCode = true
  }
}

function initLoginInfo() {
  const localLoginInfo = lStorage.get('loginInfo')
  if (localLoginInfo) {
    loginInfo.value.name = localLoginInfo.name || ''
    loginInfo.value.password = localLoginInfo.password || ''
  }
}

function initCodeImage() {
  loginInfo.value.uuid = uuidv4();
  codeImageUrl.value = `${import.meta.env.VITE_BASE_API}/v1/user/registerVerifyImage?uuid=${loginInfo.value.uuid}`
}

const isRemember = useStorage('isRemember', false)
const loading = ref(false)
async function handleLogin() {
  const { name, password } = loginInfo.value
  if (!name || !password) {
    $message.warning('请输入用户名和密码')
    return
  }
  try {
    loading.value = true
    $message.loading('正在验证...')
    const res = await api.login({ account: name.toString(), password: password.toString() })
    $message.success('登录成功')
    setToken(res.data.token)
    if (isRemember.value) {
      lStorage.set('loginInfo', { name, password })
    } else {
      lStorage.remove('loginInfo')
    }
    await addDynamicRoutes()
    if (query.redirect) {
      const path = query.redirect
      Reflect.deleteProperty(query, 'redirect')
      router.push({ path, query })
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error(error)
    $message.removeMessage()
  }
  loading.value = false
}

async function registerAction() {
  const { name, password } = loginInfo.value
  if (!name || !password) {
    $message.warning('请输入用户名和密码')
    return
  }
  try {
    loading.value = true
    $message.loading('正在验证...')
    const res = await api.register({ 
      account: name.toString(), 
      password: password.toString(),
      uuid: loginInfo.value.uuid,
      code: loginInfo.value.code,
      inviter: loginInfo.value.inviter,
    })
    $message.success('注册成功')
    showRegisterView.value
  } catch (error) {
    console.error(error)
    $message.removeMessage()
  }
  loading.value = false
  initCodeImage();
}

async function getInviteCode() {
  window.open('https://t.me/feitapp')
}

</script>
