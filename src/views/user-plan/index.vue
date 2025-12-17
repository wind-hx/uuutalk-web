<template>
	<AppPage>
		<div class="c_card">
			<n-card style="margin-bottom: 16px; display: flex;">
				<n-button type="primary" ghost @click="openRenewModal">
					续费套餐
				</n-button>
			</n-card>
		</div>
		
		<n-data-table 
			:remote="true" 
			:columns="columns" 
			:data="userPlanList" 
			:max-height="480" 
			:row-key="(row) => row"
			:loading="tableLoading" />

		<n-modal
			v-model:show="showProgress"
			:mask-closable="false"
			preset="dialog"
			@positive-click="onPositiveClick"
			@negative-click="onNegativeClick">
			<n-progress
				type="line"
				:percentage="progress"
				:indicator-placement="'inside'"
				processing/>
		</n-modal>

		<n-drawer v-model:show="showInviteUserView" :width="420">
			<n-drawer-content closable>
				<template #header>
					选择邀请的好友
				</template>
				<template #default>
					
				</template>
				<template #footer>
					<n-button mr-16 @click="showInviteUserView = false">取消</n-button>
					<n-button :loading="submitLoading" type="success" ghost @click="inviteUserAction">保存</n-button>
				</template>
			</n-drawer-content>
		</n-drawer>

		<n-modal
			v-model:show="showRenewModal"
			preset="dialog"
			title="续费套餐"
			:mask-closable="false"
			:positive-text="'确认续费'"
			:negative-text="'取消'"
			:positive-button-props="{ loading: renewBtnLoading, disabled: Boolean(renewOrderInfo?.payUrl) }"
			@positive-click="confirmRenew">
			<div>
				<div v-if="!renewOrderInfo?.payUrl">
					<p style="margin-bottom: 6px; color: #6b7280;">确认后将生成续费订单。</p>
					<p style="margin-top: 10px; color: #999;">订单生成后会展示支付二维码，订单有效期30分钟。</p>
				</div>
				<div v-else class="pay-box">
					<p class="pay-tip">请使用支付宝扫码付款，订单有效期30分钟。</p>
					<div class="pay-content">
						<n-qr-code :value="renewOrderInfo.payUrl" :size="200" />
						<div class="pay-meta">
							<p v-if="renewOrderInfo.outId">订单号：{{ renewOrderInfo.outId }}</p>
							<p v-if="renewOrderInfo.payAmount !== undefined">金额：{{ renewOrderInfo.payAmount }}</p>
							<p class="pay-warn">付款后请耐心等待1到3分钟后刷新页面即可生效</p>
						</div>
					</div>
				</div>
			</div>
		</n-modal>

	</AppPage>
</template>

<script setup>
import { h, ref, onMounted } from "vue";
import { NTag, NButton, useMessage } from 'naive-ui'
import api from './api'
import UUUTalkAccountApi from '../uuutalk-account/api'

const message = useMessage()
const columns = ref([
	{
		type: "selection",
		fixed: "left"
	},
	{
		title: '套餐标题',
		key: "title",
		width: 160,
	},
	{
		title: 'UUUTalk账户数量',
		key: "count",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'success'
				},
				{ default: () => `${row.uuuTalkAccountCount}/${row.uuuTalkAccountTotal}` }
			)
		}
	},
	{
		title: '套餐过期时间',
		key: "expire",
		width: 100,
	},
	{
		title: "操作",
		key: "action",
		width: 80,
		fixed: "right",
		render(row) {
			let btnList = [
				h(
					NButton,
					{
						size: 'small',
						type: 'error',
						onClick: () => renewalAccount(row)
					},
					{ default: () => '续费' }
				)
			]
			return btnList
		}
	}
]);

const showInviteUserView = ref(false);
const showProgress = ref(false);
const progress = ref(false);
const submitLoading = ref(false);
const tableLoading = ref(false);
const userPlanList = ref([]);
const showRenewModal = ref(false)
const renewOrderInfo = ref(null)
const renewBtnLoading = ref(false)
const selectedPlan = ref(null)

onMounted(
	() => {
		loadUserPlanListAction()
	}
)

const loadUserPlanListAction = async () => {
	let result = await api.list()
	userPlanList.value = result.data ?? []
}

const openRenewModal = (plan = null) => {
	selectedPlan.value = plan
	renewOrderInfo.value = null
	showRenewModal.value = true
}

const confirmRenew = async () => {
	if (!selectedPlan.value?.id) {
		message.warning('请选择要续费的套餐')
		return false
	}
	renewBtnLoading.value = true
	try {
		const result = await UUUTalkAccountApi.rechargeCreate({
			userPlanId: selectedPlan.value.id,
		})
		renewOrderInfo.value = result?.data || {}
	} catch (error) {
		message.error(error?.message || '创建订单失败，请稍后重试')
		return false
	} finally {
		renewBtnLoading.value = false
	}
	return false
}

const renewalAccount = (row) => {
	openRenewModal(row)
}

</script>

<style>

.c_card .n-card__content{
	display: flex !important;
}

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
