<template>
  <AppPage :show-footer="false" class="login-page bg-hex-f4f7fb dark:bg-hex-0f1218">
    <div class="login-shell">
      <section class="login-left bg-white dark:bg-hex-11151d">
        <div class="brand text-hex-2b2f38 dark:text-hex-e3e7f0">
          <img class="brand-icon" src="@/assets/images/logo.png" alt="UUUTalk" />
          <span class="brand-text">UUUTalk</span>
        </div>
        <h1 class="headline text-hex-2b2f38 dark:text-hex-f0f3f9">更愉快的与朋友交流</h1>
        <p class="subline text-hex-8a8f9c dark:text-hex-a6afc2">请输入账号密码登录或注册</p>

        <div class="form-card">
          <div class="form-toggle bg-hex-f2f4f8 dark:bg-white/6">
            <button
              type="button"
              class="toggle-item text-hex-6c7484"
              :class="[
                !isRegister
                  ? 'bg-white text-hex-2b2f38 shadow-[0_6px_16px_rgba(20,44,90,0.12)] dark:bg-hex-1b2230 dark:text-hex-f0f3f9 dark:shadow-[0_6px_16px_rgba(0,0,0,0.35)]'
                  : 'dark:text-hex-b9c2d6',
              ]"
              @click="isRegister = false">
              登录
            </button>
            <button
              type="button"
              class="toggle-item text-hex-6c7484"
              :class="[
                isRegister
                  ? 'bg-white text-hex-2b2f38 shadow-[0_6px_16px_rgba(20,44,90,0.12)] dark:bg-hex-1b2230 dark:text-hex-f0f3f9 dark:shadow-[0_6px_16px_rgba(0,0,0,0.35)]'
                  : 'dark:text-hex-b9c2d6',
              ]"
              @click="switchToRegister">
              注册
            </button>
          </div>
          <div class="form-row">
            <n-input
              v-model:value="loginInfo.name"
              autofocus
              placeholder="请输入用户名"
              :maxlength="20"
            />
          </div>
          <div class="form-row">
            <n-input
              v-model:value="loginInfo.password"
              type="password"
              show-password-on="mousedown"
              placeholder="请输入密码"
              :maxlength="20"
              @keydown.enter="handleLogin"
            />
          </div>
          <template v-if="isRegister">
            <div class="form-row">
              <n-input-group>
                <n-input
                  v-model:value="loginInfo.code"
                  show-password-on="mousedown"
                  placeholder="请输入验证码"
                  :maxlength="20"
                />
                <img :src="codeImageUrl" class="code-image" @click="initCodeImage" />
              </n-input-group>
            </div>
            <div class="form-row">
              <n-input
                :disabled="loginInfo.hasInviterCode"
                v-model:value="loginInfo.inviter"
                placeholder="请输入邀请码（可选）"
              />
            </div>
            <div class="form-row">
              <n-button
                w-full
                rounded-5
                text-16
                type="primary"
                :loading="loading"
                @click="registerAction">
                注册
              </n-button>
            </div>
          </template>
          <template v-else>
            <div class="remember-row">
              <n-checkbox
                :checked="isRemember"
                label="记住我"
                :on-update:checked="(val) => (isRemember = val)"
              />
            </div>
            <div class="form-row">
              <n-button
                w-full
                rounded-5
                text-16
                type="primary"
                :loading="loading"
                @click="handleLogin">
                登录
              </n-button>
            </div>
          </template>
        </div>
      </section>

      <section class="login-right">
        <div class="right-visual">
          <img src="@/assets/images/primary_logo.png" alt="UUUTalk" />
        </div>
        <div class="right-caption">拉近世界的距离，让通讯变为价值</div>
      </section>
    </div>

  </AppPage>
</template>

<script setup>
import { lStorage, setToken } from '@/utils'
import { useStorage } from '@vueuse/core'
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
const codeImageUrl = ref('')
const isRegister = ref(false)

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
    isRegister.value = false
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

function switchToRegister() {
  isRegister.value = true
  initCodeImage()
}

</script>

<style scoped>
:global(.login-page) {
  min-height: 100vh;
  font-family: 'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  padding: 0;
}

.login-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
}

.login-left {
  padding: 72px 8vw 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.brand-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.headline {
  margin: 10px 0 8px;
  font-size: 28px;
  letter-spacing: 0.5px;
}

.subline {
  margin: 0 0 24px;
  font-size: 14px;
}

.form-card {
  width: min(360px, 90%);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  width: 100%;
}

.form-card :deep(.n-input),
.form-card :deep(.n-button) {
  height: 50px;
}

.form-card :deep(.n-input__input-el) {
  font-size: 16px;
  line-height: 1.4;
}

.form-card :deep(.n-input__input) {
  display: flex;
  align-items: center;
  height: 50px;
}

.form-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
}

.toggle-item {
  height: 38px;
  border: 0;
  border-radius: 999px;
  font-size: 14px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.code-image {
  height: 50px;
  width: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
}

.remember-row {
  display: flex;
  justify-content: flex-start;
}

.login-right {
  position: relative;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.12), transparent 45%),
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.12), transparent 50%),
    linear-gradient(135deg, #3b6df6 0%, #4b7cf7 55%, #3b6df6 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 6vw;
  overflow: hidden;
}

.login-right::before,
.login-right::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.login-right::before {
  width: 420px;
  height: 420px;
  top: -80px;
  right: 10%;
}

.login-right::after {
  width: 520px;
  height: 520px;
  bottom: -160px;
  left: 12%;
}

.right-visual {
  width: min(420px, 70%);
  z-index: 1;
}

.right-visual img {
  width: 100%;
  display: block;
  filter: drop-shadow(0 24px 40px rgba(14, 40, 110, 0.3));
}

.right-caption {
  margin-top: 36px;
  font-size: 18px;
  letter-spacing: 1px;
  z-index: 1;
  text-align: center;
}

@media (max-width: 1024px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-right {
    min-height: 45vh;
  }
}

@media (max-width: 640px) {
  .login-left {
    padding: 64px 24px 40px;
  }

  .form-card {
    width: 100%;
  }
}
</style>
