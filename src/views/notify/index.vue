<template>
	<AppPage>
		<div class="c_card">
			<n-card style="margin-bottom: 16px; display: flex;">
				<n-button type="primary" ghost mr-16 @click="showBindWxPushViewAction">
					绑定微信通知
				</n-button>
				<n-button type="error" ghost mr-16 @click="cleanWxPushTokenAction">
					解除微信绑定
				</n-button>
			</n-card>
		</div>

		<n-data-table 
			:remote="true" 
			:columns="columns" 
			:data="notifyList" 
			:pagination="tablePagination" 
			:max-height="480" 
			:row-key="(row) => row"
			:loading="tableLoading"
			:on-update:page="tableTablePageChange" />

		<n-drawer v-model:show="showBindWxPushView" :width="420">
			<n-drawer-content closable>
				<template #header>
					绑定微信通知
				</template>
				<template #default>
					<div v-if="!wxPushToken">微信推送需要您的微信扫码关注应用</div>
					<n-image
						v-if="!wxPushToken"
						width="160"
						:src="wxPushQrCodeUrl"/>
					<p v-if="!wxPushToken" style="font-size: 14px; color: red">必须微信关注该二维码应用才可以使用本功能</p>
					<n-input v-if="wxPushToken" placeholder="请输入WX推送Token" v-model:value="wxPushToken" :disabled="true"></n-input>
				</template>
				<template #footer>
					<n-button mr-16 @click="showBindWxPushView = false">取消</n-button>
					<n-button :loading="submitLoading" type="success" ghost @click="showBindWxPushAction">保存</n-button>
				</template>
			</n-drawer-content>
		</n-drawer>
	</AppPage>
</template>

<script setup>
import { useUserStore } from '@/store'
import { NTag, NEllipsis } from 'naive-ui'
import { h, defineComponent, ref, onMounted, reactive } from "vue";
import api from './api'

const columns = ref([
	{
		title: '通知类型',
		key: "tag",
		width: 80,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'success'
				},
				{ default: () => row.tag }
			)
		}
	},
	{
		title: 'Yuni账户号码',
		key: "yuniAccountPhone",
		width: 100,
		render(row) {
			return h(
				NEllipsis,
				{  },
				{ default: () => '' === row.yuniAccountPhone ? '--' : row.yuniAccountPhone ?? '--' }
			)
		}
	},
	{
		title: 'Yuni账户昵称',
		key: "yuniAccountNickname",
		width: 100,
		render(row) {
			return h(
				NEllipsis,
				{  },
				{ default: () => '' === row.yuniAccountNickname ? '--' : row.yuniAccountNickname ?? '--' }
			)
		}
	},
	{
		title: '任务名称',
		key: "taskTitle",
		width: 100,
		render(row) {
			return h(
				NEllipsis,
				{  },
				{ default: () => '' === row.taskTitle ? '--' : row.taskTitle ?? '--' }
			)
		}
	},
	{
		title: '通知内容',
		key: "text",
		width: 160,
		render(row) {
			return h(
				NEllipsis,
				{  },
				{ default: () => '' === row.text ? '--' : row.text ?? '--' }
			)
		}
	},	
]);

const tableLoading = ref(false)
const tablePagination = reactive({ pageSize: 20, page: 1, itemCount: 0 })
const notifyList = ref([])
const showBindWxPushView = ref(false)
const wxPushToken = ref('')
const wxPushQrCodeUrl = ref('')
let checkWxPushQRCodeTimer = null

onMounted(
	() => {
		loadNotifyList()
    	loadUserInfo()
	}
)

const loadNotifyList = async () => {
	tableLoading.value = true
	const result = await api.notifyList({
		pageIndex: tablePagination.page,
		pageSize: tablePagination.pageSize,
	})
	tableLoading.value = false
	notifyList.value = result.data ?? []
	tablePagination.pageSize = 20
	tablePagination.page = result.pageIndex
	tablePagination.itemCount = result.totalRecords
}

const loadUserInfo = async () => {
	const res = await api.getUser()
	wxPushToken.value = res.data.wxPushToken
}

const tableTablePageChange = async (page) => {
	tablePagination.page = page
	loadNotifyList()
}

const showBindWxPushViewAction = async () => {
	if (wxPushToken.value) {
		$message.success('已经绑定过微信推送了')
		return
	}
	showBindWxPushView.value = true
	try {
		let res = await api.getWxPushQRCode()
		let qrcodeUrl = URL.createObjectURL(res);
		wxPushQrCodeUrl.value = qrcodeUrl
		startCheckWxPushQRCodeStatus()
	} catch (error) {
		console.error(error)
		$message.error('获取二维码失败')
	}
}

const cleanWxPushTokenAction = async () => {
	try {
		await api.cleanWxPushToken()
		await loadUserInfo()
		$message.success('操作成功')
	} catch (error) {
		console.error(error)
	}
}

const startCheckWxPushQRCodeStatus = () => {
	// 清除可能存在的旧定时器
	if (checkWxPushQRCodeTimer) {
		clearInterval(checkWxPushQRCodeTimer)
	}
	const check = async () => {
		try {
			const res = await api.checkWxPushQRCode()
			if (res.code === 200 && res.data !== '') {
				clearInterval(checkWxPushQRCodeTimer)
				checkWxPushQRCodeTimer = null
				showBindWxPushView.value = false
				$message.success('扫码成功')
				loadUserInfo()
				return
			}
			// 如果抽屉已关闭，不再继续检查
			if (!showBindWxPushView.value) {
				return
			}
			
			// 设置下一次检查
			checkWxPushQRCodeTimer = setTimeout(check, 1000)
		} catch (error) {
			console.error(error)
			// 发生错误时也继续检查
			if (showBindWxPushView.value) {
				checkWxPushQRCodeTimer = setTimeout(check, 1000)
			}
		}
	}
	
	// 开始第一次检查
	check()
}

</script>
