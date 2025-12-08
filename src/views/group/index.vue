<template>
	<AppPage>
		<div class="c_card">
			<n-card style="margin-bottom: 16px; display: flex;">
				<n-select
					style="width: 260px;"
					mr-16
					v-model:value="selectedValue"
					filterable
					placeholder="请选择Yuni账户"
					:options="yuniAccountList"/>
				<n-button type="primary" ghost mr-16 @click="loadGroupAction">
					获取群组
				</n-button>
				<n-button type="info" ghost mr-16 @click="showInviteUserViewAction">
                    邀请用户
                </n-button>
			</n-card>
		</div>
		
		<n-data-table 
			:remote="true" 
			:columns="columns" 
			:data="groupList" 
			:max-height="480" 
			:row-key="(row) => row"
			v-model:checked-row-keys="selectedGroupList"
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
					<n-data-table 
						:remote="true" 
						:columns="friendColumns" 
						:data="friendList" 
						:max-height="480" 
						:row-key="(row) => row"
						v-model:checked-row-keys="selectedFriendList"
						:loading="tableLoading" />
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
		title: '群组标题',
		key: "title",
		width: 160,
	},
	{
		title: '群组号码',
		key: "groupNo",
		width: 100,
	},
	{
		title: '群成员数量',
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
		title: '邀请好友验证',
		key: "inviteVerify",
		width: 100,
		render(row) {
			if (row.inviteVerify) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'error'
					},
					{ default: () => '有验证' }
				)
			} else {
				return h(
					NTag,
					{
						size: 'small',
						type: 'success'
					},
					{ default: () => '无验证' }
				)
			}
		}
	},
]);

const friendColumns = ref([
	{
		type: "selection",
		fixed: "left"
	},
	{
		title: '用户名称',
		key: "title",
		width: 160,
	},
]);

const showInviteUserView = ref(false);
const showProgress = ref(false);
const progress = ref(false);
const submitLoading = ref(false);
const tableLoading = ref(false);
const yuniAccountList = ref([]);
const selectedValue = ref();
const groupList = ref([]);
const selectedGroupList = ref([]);
const selectedFriendList = ref([]);
const friendList = ref([]);

onMounted(
	() => {
		loadYuniAccountAction()
	}
)

const loadYuniAccountAction = async () => {
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

const loadGroupAction = async () => {
    if (!selectedValue.value) {
        $message.error('请选择Yuni账户')
        return;
    }
    submitLoading.value = true
	let res
	try {
		tableLoading.value = true
		res = await YuniAccountApi.yuniGroupList({
			yuniAccountId: selectedValue.value,
		})
		tableLoading.value = false
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
    submitLoading.value = false
	tableLoading.value = false
	groupList.value = res.data
}

const showInviteUserViewAction = async () => {
	if (!selectedValue.value) {
        $message.error('请选择Yuni账户')
        return;
    }
	if (groupList.value.length === 0) {
		$message.error('请先获取群组')
		return
	}
	if (selectedGroupList.value.length === 0) {
		$message.error('请先选择群组')
		return
	}
	friendList.value = []
	const res = await YuniAccountApi.yuniFriendList({
		yuniAccountId: selectedValue.value,
	})
	friendList.value = res.data
	showInviteUserView.value = true
}

const inviteUserAction = async () => {
	if (!selectedValue.value) {
        $message.error('请选择Yuni账户')
        return;
    }
	if (groupList.value.length === 0) {
		$message.error('请先获取群组')
		return
	}
	if (selectedGroupList.value.length === 0) {
		$message.error('请先选择群组')
		return
	}
	if (selectedFriendList.value.length === 0) {
		$message.error('请先选择好友')
		return
	}
	let friendUid = []
	for (let item of selectedFriendList.value) {
		friendUid.push(item.targetId)
	}
	submitLoading.value = true
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedGroupList.value) {
		try {
			let res = await YuniAccountApi.groupInvite({
				yuniAccountId: selectedValue.value,
				groupId: item.targetId,
				friendUid: friendUid,
			})
			$message.success('操作成功')
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedGroupList.value.length) * 100)
	}
	showInviteUserView.value = false
	showProgress.value = false
	selectedGroupList.value = []
	selectedFriendList.value = []
	submitLoading.value = false
}

</script>

<style>

.c_card .n-card__content{
	display: flex !important;
}

</style>