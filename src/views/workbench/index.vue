<template>
  <AppPage :show-footer="true">
    <div flex-1>
      <n-card rounded-10>
        <div flex items-center>
          <icon-custom-logo text-36 color-primary h-70 w-70></icon-custom-logo>
          <div ml-20>
            <p text-16>Hello, {{ userStore.account }}</p>
            <p op-60 style="color: red; font-size: 12px;" v-if="userStore.superiorRemark !== ''">
              <strong>{{ userStore.superiorRemark }}</strong>
            </p>
            <n-button v-if="!userStore.superiorRemark || userStore.superiorRemark === ''" ghost type="error" @click="openAction">联系客服</n-button>
          </div>
          <div ml-auto flex items-center>
            <n-statistic label="UUUTalk账户" ml-80 w-100 :value="statistic.uuuTalkAccountCount"></n-statistic>
            <n-statistic label="群发任务" ml-80 w-100 :value="statistic.taskCount"></n-statistic>
          </div>
        </div>
      </n-card>

      <n-card title="套餐列表（联系客服购买套餐）" size="small" :segmented="true" mt-15 rounded-10>
        <div flex flex-wrap justify-between>
          <n-card
            class="mb-10 mt-10 w-260 flex-shrink-0 cursor-pointer"
            hover:card-shadow
            title="一级套餐"
            size="small">
            <template #header-extra>
              <n-button ghost type="error" @click="buyAction" :loading="buyBtnLoading">购买</n-button>
            </template>
            <p op-60 style="color: red"><strong>36元/月</strong></p>
            <p op-60>可添加1个UUUTalk账户✅</p>
            <p op-60>群发任务✅</p>
            <p op-60>单群发任务消息数100000000✅</p>
            <!-- <p op-60>自动通过好友申请✅</p> 
            <p op-60>私信自动回复✅</p>
            <p op-60>批量修改账户信息✅</p> -->
          </n-card>
        </div>
      </n-card>

      <n-modal
        v-model:show="showBuyModal"
        preset="dialog"
        title="购买套餐"
        :mask-closable="false"
        :positive-text="'确认购买'"
        :negative-text="'取消'"
        :positive-button-props="{ loading: buyBtnLoading, disabled: Boolean(orderInfo?.payUrl) }"
        @positive-click="confirmBuy">
        <div>
          <div v-if="!orderInfo?.payUrl">
            <p style="margin-bottom: 6px; color: #6b7280;">选择购买数量并生成订单。</p>
            <n-input-number v-model:value="buyQuantity" :min="1" placeholder="请输入数量" style="width: 200px;" />
            <p style="margin-top: 10px; color: #999;">确认后将生成支付二维码，订单有效期30分钟。</p>
          </div>
          <div v-else class="pay-box">
            <p class="pay-tip">请使用支付宝扫码付款，订单有效期30分钟。</p>
            <div class="pay-content">
              <n-qr-code :value="orderInfo.payUrl" :size="200" />
              <div class="pay-meta">
                <p v-if="orderInfo.outId">订单号：{{ orderInfo.outId }}</p>
                <p v-if="orderInfo.payAmount !== undefined">金额：{{ orderInfo.payAmount }}</p>
                <p class="pay-warn">付款后请耐心等待1到3分钟后刷新页面即可生效</p>
              </div>
            </div>
          </div>
        </div>
      </n-modal>
    </div>
  </AppPage>
</template>

<script setup>
import { useUserStore } from '@/store'
import { ref, onMounted } from "vue";
import { useMessage } from 'naive-ui'
import api from './api'

const message = useMessage()
const userStore = useUserStore()
const buyBtnLoading = ref(false)
const statistic = ref({
  taskCount: 0,
  uuuTalkAccountCount: 0,
})
const userPlanList = ref([])
const showBuyModal = ref(false)
const buyQuantity = ref(1)
const orderInfo = ref(null)

onMounted(
	() => {
    loadUserPlanList()
	}
)

const loadUserPlanList = async () => {
  let res = await api.userPlanList()
  userPlanList.value = res.data
}

const buyAction = () => {
  buyQuantity.value = 1
  orderInfo.value = null
  showBuyModal.value = true
}

const confirmBuy = async () => {
  if (!buyQuantity.value || buyQuantity.value < 1) {
    message.warning('请输入有效的购买数量')
    return false
  }
  buyBtnLoading.value = true
  try {
    const result = await api.rechargeCreate({
      count: buyQuantity.value,
    })
    orderInfo.value = result?.data || {}
  } catch (error) {
    message.error(error?.message || '创建订单失败，请稍后重试')
    return false
  } finally {
    buyBtnLoading.value = false
  }
  return false
}

const openAction = () => {
  window.open('https://t.me/feitapp')
}
</script>

<style scoped>
.pay-box {
  padding: 12px 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.pay-tip {
  color: #e6a23c;
  margin-bottom: 12px;
  font-weight: 500;
}

.pay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.pay-meta p {
  margin: 4px 0;
  color: #4b5563;
}

.pay-meta .pay-warn {
  color: #d14343;
  font-weight: 600;
}
</style>
