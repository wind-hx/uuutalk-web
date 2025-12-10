<template>
	<AppPage>
		<div class="c_card">
			<n-card style="margin-bottom: 16px; display: flex;">
				<n-button type="primary" ghost @click="showBuyView">
					购买套餐
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

	</AppPage>
</template>

<script setup>
import { h, defineComponent, ref, onMounted, reactive } from "vue";
import { NTag, NButton } from 'naive-ui'
import api from './api'
import YuniAccountApi from '../uuutalk-account/api'

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
		key: "groupMemCount",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'success'
				},
				{ default: () => row.groupMemCount }
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
						onClick: () => deleteAccount(row)
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

onMounted(
	() => {
		loadUserPlanListAction()
	}
)

const loadUserPlanListAction = async () => {
	let result = await api.yuniAccountList()
	let temp = []
	for (let item of result.data) {
		item.label = item.nickname
		item.value = item.id
		item.disabled = null != item.taskId && 0 != item.taskId
		temp.push(item)
	}
	yuniAccountList.value = temp
}

</script>

<style>

.c_card .n-card__content{
	display: flex !important;
}

</style>