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
            <n-statistic label="UUUTalk账户" ml-80 w-100 :value="statistic.yuniAccountCount"></n-statistic>
            <n-statistic label="群发任务" ml-80 w-100 :value="statistic.taskCount"></n-statistic>
          </div>
        </div>
      </n-card>

      <n-card title="当前套餐" size="small" :segmented="true" mt-15 rounded-10>
        <div flex flex-wrap justify-between>
          <n-card
            v-for="(item, index) in userPlanList"
            :key="index"
            class="mb-10 mt-10 w-260 flex-shrink-0 cursor-pointer"
            hover:card-shadow
            :title="item.title"
            size="small">
            <p op-60 style="color: red; font-size: 12px;"><strong>[过期时间: {{ item.expire }}]</strong></p>
            <p op-60>可添加{{ item.yuniAccountTotal }}个Yuni账户✅</p>
            <p op-60>群发任务✅</p>
            <p op-60>单群发任务消息数{{ item.taskSendMessageTotal }}✅</p>
            <p op-60>自动通过好友申请✅</p>
            <p op-60>私信自动回复✅</p>
            <p op-60>批量修改账户信息✅</p>
          </n-card>
        </div>
      </n-card>

      <n-card title="套餐列表（联系客服购买套餐）" size="small" :segmented="true" mt-15 rounded-10>
        <div flex flex-wrap justify-between>
          <n-card
            class="mb-10 mt-10 w-260 flex-shrink-0 cursor-pointer"
            hover:card-shadow
            title="一级套餐"
            size="small">
            <p op-60 style="color: red"><strong>60元/月</strong></p>
            <p op-60>可添加1个UUUTalk账户✅</p>
            <p op-60>群发任务✅</p>
            <p op-60>单群发任务消息数100000✅</p>
            <p op-60>自动通过好友申请✅</p> 
            <p op-60>私信自动回复✅</p>
            <p op-60>批量修改账户信息✅</p>
          </n-card>
        </div>
      </n-card>
    </div>
  </AppPage>
</template>

<script setup>
import { useUserStore } from '@/store'
import { h, defineComponent, ref, onMounted, reactive } from "vue";
import { useDialog } from 'naive-ui'
import api from './api'

const dialog = useDialog()
const userStore = useUserStore()
const statistic = ref({
  taskCount: 0,
  yuniAccountCount: 0,
})
const userPlanList = ref([])

onMounted(
	() => {
    loadUserPlanList()
		loadStatistic()
    loadUserInfo()
	}
)

const loadUserInfo = async () => {
  let expireDate = new Date(userStore.expire);
  let currentDate = new Date();
  let threeDaysAhead = new Date(currentDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 加上3天的毫秒数

  if (expireDate <= threeDaysAhead) {
    dialog.warning({
      title: '提示',
      content: `您的套餐将在${userStore.expire}过期，是否续费？在使用期间有任何问题也可以联系我。`,
      positiveText: '确定',
      onPositiveClick: () => {
        window.open('https://t.me/feitapp');
      },
    })
  }
}

const loadUserPlanList = async () => {
  let res = await api.userPlanList()
  userPlanList.value = res.data
}

const openAction = () => {
  window.open('https://t.me/feitapp')
}
</script>
