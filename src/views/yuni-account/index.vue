<template>
	<AppPage>
		<n-card style="margin-bottom: 16px;">
			<n-button ghost mr-16 @click="showQRCodeDrawer">
				添加Yuni账户
			</n-button>
			<n-button type="info" ghost mr-16 @click="syncGroupSelectedAction">
				更新群组数据
			</n-button>
			<n-button type="info" ghost mr-16 @click="syncFriendSelectedAction">
				更新好友数据
			</n-button>
			<n-button type="warning" ghost mr-16 @click="showSetStickerViewAction">
				大头像设置
			</n-button>
			<n-button type="warning" ghost mr-16 @click="showDefaultViewAction">
				自动回复
			</n-button>
			<n-button type="warning" ghost mr-16 @click="showWelcomeMessageViewAction">
				欢迎语设置
			</n-button>
			<n-button type="error" ghost mr-16 @click="cleanStickerAction">
				删除大头像
			</n-button>
			<n-button type="error" ghost mr-16 @click="cleanWelcomeMessageAction">
				删除欢迎语
			</n-button>
			<n-button type="error" ghost mr-16 @click="deleteSelectedAction">
				删除
			</n-button>
		</n-card>
		<n-data-table 
			:columns="columns" 
			:data="yuniAccountList" 
			:pagination="yuniAccountPagination" 
			:max-height="480"
			:scroll-x="1800" 
			:loading="tableLoading" 
			:row-key="(row) => row"
			v-model:checked-row-keys="selectedYuniAccountList"/>

		<n-drawer v-model:show="showYuniAccountView" :width="720">
			<n-drawer-content closable>
				<template #header>
					账户详情
				</template>
				<template #default>
					<n-descriptions label-placement="top" bordered :column="3">
						<n-descriptions-item label="昵称">
							{{ selectedYuniAccount.nickname || '--' }}
						</n-descriptions-item>
						<n-descriptions-item label="手机号">
							{{ selectedYuniAccount.phone || '--' }}
						</n-descriptions-item>
						<n-descriptions-item label="所在服务器">
							<n-tag size="small" type="info">{{ selectedYuniAccount.serverTag || '--' }}</n-tag>
						</n-descriptions-item>
						<n-descriptions-item label="状态">
							<n-tag v-if="selectedYuniAccount.status" size="small" type="success">已认证</n-tag>
							<n-tag v-else size="small" type="warning">未认证</n-tag>
						</n-descriptions-item>
						<n-descriptions-item label="自动回复文本">
							{{ selectedYuniAccount.defaultReply || '--' }}
						</n-descriptions-item>
						<n-descriptions-item label="自动回复图片">
							<n-image 
								v-if="selectedYuniAccount.defaultReplyImage"
								width="100"
								:src="selectedYuniAccount.defaultReplyImage"/>
							<div v-else>--</div>
						</n-descriptions-item>
						<n-descriptions-item label="欢迎语">
							<div v-if="selectedYuniAccount.welcomeMessage" v-for="(item, index) in JSON.parse(selectedYuniAccount.welcomeMessage)" :key="index">
								<n-tag size="small" type="info" v-if="item.type === 0">
									{{ item.text }}
								</n-tag>
								<n-image 
									v-if="item.type === 1"
									width="100"
									:src="item.image"
								/>
							</div>
							<div v-else>
								--
							</div>
						</n-descriptions-item>
						<n-descriptions-item label="失效原因">
							<n-tag size="small" type="error">{{ selectedYuniAccount.causeDisconnection || '无' }}</n-tag>
						</n-descriptions-item>
					</n-descriptions>

					<n-data-table :remote="true" style="margin-top: 16px;" :columns="yuniChatColumns" :data="yuniChatList"
						:pagination="yuniChatPagination" :max-height="480" :scroll-x="800" :loading="tableLoading"
						:on-update:page="yuniChatTablePageChange" />
				</template>
				<template #footer>
					<n-button mr-16 @click="showYuniAccountView = false">取消</n-button>
				</template>
			</n-drawer-content>
		</n-drawer>

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
		<n-modal
			v-model:show="showDefaultView"
			:mask-closable="false"
			preset="dialog"
			title="设置自动回复"
			positive-text="确认"
			negative-text="取消"
			@positive-click="defaultMessageSelectedAction"
			@negative-click="onNegativeClick">
			<n-input placeholder="请输入自动回复内容" v-model:value="defaultText" type="textarea"></n-input>
			<br/><br/>
			<n-upload
				accept=".jpeg,.jpg,.png"
				directory-dnd
				@finish="uploadFinish"
				:action="uploadUrl"
				:headers="uploadHeaders"
				:max="1">
				<n-upload-dragger>
				<div style="margin-bottom: 12px">
					<TheIcon icon="mdi:cloud-upload" :size="36" />
				</div>
				<n-text style="font-size: 16px">
					点击或者拖动文件到该区域来上传
				</n-text>
				<n-p depth="3" style="margin: 8px 0 0 0">
					只支持PNG、JPG、JPEG三种格式的图片
				</n-p>
				</n-upload-dragger>
			</n-upload>
		</n-modal>

		<n-modal
			v-model:show="showStickerView"
			:mask-closable="false"
			preset="dialog"
			title="设置大头像"
			positive-text="确认"
			negative-text="取消"
			@positive-click="setStickerSelectedAction"
			@negative-click="onNegativeClick">
			<n-upload
				accept=".jpeg,.jpg,.png"
				directory-dnd
				@finish="uploadSetStickerImageFinish"
				:action="uploadUrl"
				:headers="uploadHeaders"
				:max="1">
				<n-upload-dragger>
				<div style="margin-bottom: 12px">
					<TheIcon icon="mdi:cloud-upload" :size="36" />
				</div>
				<n-text style="font-size: 16px">
					点击或者拖动文件到该区域来上传
				</n-text>
				<n-p depth="3" style="margin: 8px 0 0 0">
					只支持PNG、JPG、JPEG三种格式的图片
				</n-p>
				</n-upload-dragger>
			</n-upload>
			<p style="font-size: 14px; color: red">大头像模式下，群发任务不能添加图片任务。</p>
		</n-modal>

		<n-drawer v-model:show="showQRCodeView" :width="520">
			<n-drawer-content closable>
				<template #header>
					扫码添加Yuni账户
				</template>
				<template #default>
					<n-form ref="createFormRef" :model="createTgAccount" label-position="top" label-width="auto">
						<n-form-item label="上号须知">
							<p style="font-size: 14px; color: red">默认情况以下消息服务器均为公共消息服务器，用的人非常多，可能存在禁言风控等风险，如果您Yuni账户比较多建议联系客服购买独立线路。</p>
						</n-form-item>
						<n-form-item label="用户套餐">
							<br />
							<n-radio-group v-model:value="selectedUserPlanIndex">
								<n-radio mt-8 v-for="(item, index) of userPlanList" :key="index" :value="index" :disabled="!item.enable">
									{{ item.title }}:({{ item.yuniAccountCount }}/{{ item.yuniAccountTotal }})
								</n-radio>
							</n-radio-group>
						</n-form-item>
						<n-form-item label="用户消息服务器">
							<br />
							<n-radio-group v-model:value="selectedTransportServerIndex">
								<n-radio mt-8 v-for="(item, index) of transportServerList" :key="index" :value="index" :disabled="!item.enable">
									{{ item.tag }}:当前账户数量 {{ item.yuniAccountCount }}
								</n-radio>
							</n-radio-group>
						</n-form-item>
						<n-button ghost @click="getQRCode">获取二维码</n-button>
						<div class="qrcode-container" style="text-align: center;">
							<n-qr-code
								style="padding: 0px;"
								v-if="qrcodeUrl"
								:value="qrcodeUrl"
								:size="200"
							/>
							<div style="margin-top: 16px;">
								<n-text>请使用Yuni APP扫描二维码登录</n-text>
							</div>
						</div>
					</n-form>
				</template>
			</n-drawer-content>
		</n-drawer>

		<n-drawer v-model:show="showWelcomeMessageView" :width="520">
			<n-drawer-content closable>
				<template #header>
					欢迎语设置
				</template>
				<template #default>
					<n-form ref="createFormRef" label-position="top" label-width="auto">
						<n-card title="话术列表">
                            <n-collapse :trigger-areas="triggerAreas" v-for="(item, index) in welcomeMessageList" :key="index">
                                <n-collapse-item :title="welcomeMessageList[index].title" :name="index">
                                    <template #header-extra>
                                        <n-button mt-2 mb-2 size="small" @click.stop="deleteWelcomeMessage(index)">删除</n-button>
                                    </template>
									<n-radio-group
										v-model:value="welcomeMessageList[index].type"
										name="left-size"
										style="margin-bottom: 12px">
										<n-radio-button :value="0">
											文本
										</n-radio-button>
										<n-radio-button :value="1">
											图片
										</n-radio-button>
									</n-radio-group>
                                    <n-input placeholder="请输入消息内容" v-if="welcomeMessageList[index].type === 0" v-model:value="welcomeMessageList[index].text" type="textarea"></n-input>
                                    <n-upload
										v-if="welcomeMessageList[index].type === 1"
										accept=".jpeg,.jpg,.png"
                                        directory-dnd
                                        @finish="({ file, event}) => uploadWelcomeMessageImageFinish({ file, event, index})"
                                        :action="uploadUrl"
                                        :headers="uploadHeaders"
                                        :max="1">
                                        <n-upload-dragger>
                                            <div style="margin-bottom: 12px">
                                                <TheIcon icon="mdi:cloud-upload" :size="36" />
                                            </div>
                                            <n-text style="font-size: 16px">
                                                点击或者拖动文件到该区域来上传
                                            </n-text>
                                            <n-p depth="3" style="margin: 8px 0 0 0">
                                                只支持PNG、JPG、JPEG三种格式的图片
                                            </n-p>
                                        </n-upload-dragger>
                                    </n-upload>
                                </n-collapse-item>
                            </n-collapse>
                        </n-card>
                        <br />
                        <n-button type="primary" dashed @click="addWelcomeMessage">
                            添加话术
                        </n-button>
					</n-form>
				</template>
				<template #footer>
					<n-button mr-16 @click="showWelcomeMessageView = false">取消</n-button>
					<n-button :loading="submitLoading" type="success" ghost @click="saveWelcomeMessageAction">保存</n-button>
				</template>
			</n-drawer-content>
		</n-drawer>
	</AppPage>
</template>

<script setup>
import { useUserStore } from '@/store'
import { h, defineComponent, ref, onMounted, reactive, onUnmounted, watch } from "vue";
import { NTag, NButton, NSwitch, NEllipsis } from 'naive-ui'
import api from './api'
import { formatDateTime } from "~/src/utils/common/common";
import { v4 as uuidv4 } from 'uuid'
import { getToken } from '@/utils'

const columns = ref([
	{
		type: "selection",
		fixed: "left"
	},
	{
		title: "昵称",
		key: "nickname",
		width: 160,
	},
	{
		title: "手机号",
		key: "phone",
		width: 120,
	},
	{
		title: "所属套餐",
		key: "userPlanTitle",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'success'
				},
				{ default: () => row.userPlanTitle }
			)
		}
	},
	{
		title: "所在服务器",
		key: "serverTag",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'info'
				},
				{ default: () => row.serverTag }
			)
		}
	},
	{
		title: "是否会员",
		key: "isPremium",
		width: 100,
		render(row) {
			if (row.isPremium) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'success'
					},
					{ default: () => '会员' }
				)
			} else {
				return h(
					NTag,
					{
						size: 'small',
						type: 'warning'
					},
					{ default: () => '非会员' }
				)
			}
		}
	},
	{
		title: "状态",
		key: "status",
		width: 100,
		render(row) {
			if (row.status) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'success'
					},
					{ default: () => '已认证' }
				)
			} else {
				return h(
					NTag,
					{
						size: 'small',
						type: 'warning'
					},
					{ default: () => '未认证' }
				)
			}
		}
	},
	{
		title: "自动通过好友申请",
		key: "approvalFriend",
		width: 130,
		render(row) {
			return h(
					NSwitch,
					{
						size: 'small',
						value: row.approvalFriend,
						onClick: () => approvalFriendAction(row)
					},
			)
		}
	},
	{
		title: "失效原因",
		key: "causeDisconnection",
		width: 120,
		render(row) {
			return h(
				NEllipsis,
				{  },
				{ default: () => '' === row.causeDisconnection ? '无' : row.causeDisconnection }
			)
		}
	},
	{
		title: "IM模式",
		key: "imMode",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'warning'
				},
				{ default: () => row.imMode }
			)
		}
	},
	{
		title: "群组数量",
		key: "groupCount",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'warning'
				},
				{ default: () => row.groupCount }
			)
		}
	},
	{
		title: "用户数量",
		key: "userCount",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'warning'
				},
				{ default: () => row.userCount }
			)
		}
	},
	{
		title: "操作",
		key: "action",
		width: 280,
		fixed: "right",
		render(row) {
			let btnList = []
			if (row.status) {
				btnList.push(
					h(
						NButton,
						{
							style: 'margin-right: 16px',
							size: 'small',
							type: 'success',
							onClick: () => detailsAction(row)
						},
						{ default: () => '详情' }
					),
					h(
						NButton,
						{
							style: 'margin-right: 16px',
							size: 'small',
							type: 'info',
							onClick: () => changeImModeYuniAccount(row)
						},
						{ default: () => '切换IM模式' }
					),
					h(
						NButton,
						{
							style: 'margin-right: 16px',
							size: 'small',
							type: 'warning',
							onClick: () => destroyYuniAccount(row)
						},
						{ default: () => '下线' }
					)
				)
			}
			btnList.push(
				h(
					NButton,
					{
						size: 'small',
						type: 'error',
						onClick: () => deleteYuniAccount(row)
					},
					{ default: () => '删除' }
				),
			)
			return btnList
		}
	}
]);

const yuniChatColumns = ref([
	{
		title: "昵称",
		key: "title",
		width: 120,
	},
	{
		title: "类型",
		key: "type",
		width: 60,
		render(row) {
			if (row.type === 1) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'success'
					},
					{ default: () => '用户' }
				)
			} else if (row.type === 2) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'warning'
					},
					{ default: () => '群组' }
				)
			}
		}
	},
	{
		title: "群号",
		key: "groupNo",
		width: 60,
	},
	{
		title: "群成员数量",
		key: "groupMemCount",
		width: 60,
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
		title: "操作",
		key: "action",
		width: 50,
		fixed: "right",
		render(row) {
			return h(
				NButton,
				{
					size: 'small',
					type: 'error',
					onClick: () => leaveChat(row)
				},
				{ default: () => '删除' }
			)
		}
	}
]);

const userStore = useUserStore()
const yuniAccountList = ref([]);
const yuniChatList = ref([]);
const transportServerList = ref([]);
const userPlanList = ref([]);
const selectedUserPlanIndex = ref(0);
const selectedTransportServerIndex = ref(0);
const showYuniAccountView = ref(false);
const yuniAccountPagination = reactive({ pageSize: 1000, page: 1, itemCount: 0, param: undefined });
const yuniChatPagination = reactive({ pageSize: 20, page: 1, itemCount: 0, param: undefined });
const submitLoading = ref(false);
const tableLoading = ref(false);
const selectedYuniAccount = ref({});
const selectedYuniAccountList = ref([]);
const showProgress = ref(false);
const progress = ref(0)
const uploadUrl = ref(`${import.meta.env.VITE_BASE_API}/v1/upload`)
const uploadHeaders = ref({})
const welcomeMessageList = ref([]);
const showWelcomeMessageView = ref(false)
const showDefaultView = ref(false)
const defaultText = ref('')
const defaultImage = ref('')
const showStickerView = ref(false)
const stickerImage = ref('')
const showQRCodeView = ref(false)
const qrcodeUrl = ref('')
const currentUuid = ref('')
let checkQRCodeTimer = null

// 生成无连字符的UUID
const generateUuid = () => uuidv4().replace(/-/g, '')

onMounted(
	() => {
		uploadHeaders.value = {
			Authorization: getToken(),
		}
		loadYuniAccountAction()
		loadUserPlanAction()
		loadTransportServerAction()
	}
)

const loadTransportServerAction = async () => {
	let result = await api.transportServerList()
	transportServerList.value = result.data
	let yuniAccountCount = 999999;
	for (let i = 0; i < transportServerList.value.length; i++) {
		if (transportServerList.value[i].enable) {
			if (transportServerList.value[i].yuniAccountCount < yuniAccountCount) {
				selectedTransportServerIndex.value = i;
				yuniAccountCount = transportServerList.value[i].yuniAccountCount;
			}
		}
	}
}

const loadUserPlanAction = async () => {
	let result = await api.userPlanList()
	userPlanList.value = result.data
	const currentDate = new Date();
	for (let i = 0; i < userPlanList.value.length; i++) {
		const targetDate = new Date(userPlanList.value[i].expire.replace(" ", "T"));
		if (targetDate > currentDate && userPlanList.value[i].yuniAccountCount < userPlanList.value[i].yuniAccountTotal) {
			selectedUserPlanIndex.value = i
			userPlanList.value[i].enable = true
		} else {
			userPlanList.value[i].enable = false
		}

	}
}

const syncGroupSelectedAction = async () => {
	if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedYuniAccountList.value) {
		await syncGroupAction(item, false)
		i++
		progress.value = parseInt((i / selectedYuniAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedYuniAccountList.value = []
	loadYuniAccountAction();
}

const syncFriendSelectedAction = async () => {
	if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedYuniAccountList.value) {
		await syncFriendAction(item, false)
		i++
		progress.value = parseInt((i / selectedYuniAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedYuniAccountList.value = []
	loadYuniAccountAction();
}

const syncSelectedAction = async () => {
	if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedYuniAccountList.value) {
		await syncAction(item, false)
		i++
		progress.value = parseInt((i / selectedYuniAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedYuniAccountList.value = []
	loadYuniAccountAction();
}

const showDefaultViewAction = () => {
	if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	defaultText.value = ''
	defaultImage.value = ''
	showDefaultView.value = true
}

const showSetStickerViewAction = () => {
	if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	stickerImage.value = ''
	showStickerView.value = true
}

const showWelcomeMessageViewAction = () => {
	if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	welcomeMessageList.value = []
	showWelcomeMessageView.value = true
}

const uploadFinish = ({ file, event}) => {
	if (event && event.target && event.target.response) {
		let resp = JSON.parse(event.target.response)
		defaultImage.value = resp.data
	}
    return file;
};

const uploadWelcomeMessageImageFinish = ({ file, event, index}) => {
	if (event && event.target && event.target.response) {
		let resp = JSON.parse(event.target.response)
        welcomeMessageList.value[index].image = resp.data
	}
    return file;
};

const uploadSetStickerImageFinish = ({ file, event, index}) => {
	if (event && event.target && event.target.response) {
		let resp = JSON.parse(event.target.response)
        stickerImage.value = resp.data
	}
    return file;
};

const defaultMessageSelectedAction = async () => {
	if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedYuniAccountList.value) {
		try {
			await api.defaultMessage({
				yuniAccountId: item.id,
				text: defaultText.value,
				image: defaultImage.value
			})
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedYuniAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedYuniAccountList.value = []
	loadYuniAccountAction();
}

const setStickerSelectedAction = async () => {
	if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedYuniAccountList.value) {
		try {
			await api.setSticker({
				yuniAccountId: item.id,
				imageUrl: stickerImage.value
			})
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedYuniAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedYuniAccountList.value = []
	loadYuniAccountAction();
}

const loadYuniAccountAction = async () => {
	tableLoading.value = true
	let result = await api.list()
	tableLoading.value = false
	yuniAccountList.value = result.data ?? []
}

const syncGroupAction = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.syncGroup(row.id)
		tableLoading.value = false
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadYuniAccountAction();
	}
}

const syncFriendAction = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.syncFriend(row.id)
		tableLoading.value = false
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadYuniAccountAction();
	}
}

const syncAction = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.sync(row.id)
		tableLoading.value = false
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadYuniAccountAction();
	}
}

const approvalFriendAction = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.approvalFriendAction(row.id)
		tableLoading.value = false
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadYuniAccountAction();
	}
}

const detailsAction = async (row) => {
	try {
		selectedYuniAccount.value = row
		loadTgChatAction(row.id)
	} catch (error) {
		console.error(error)
	}
}

const loadTgChatAction = async (yuniAccountId) => {
	try {
		tableLoading.value = true
		let res = await api.yuniChatList({
			yuniAccountId: yuniAccountId || yuniChatPagination.param,
			pageIndex: yuniChatPagination.page,
			pageSize: yuniChatPagination.pageSize,
		})
		tableLoading.value = false
		yuniChatList.value = res.data
		yuniChatPagination.pageSize = 20
		yuniChatPagination.page = res.pageIndex
		yuniChatPagination.itemCount = res.totalRecords
		yuniChatPagination.param = yuniAccountId || yuniChatPagination.param
		showYuniAccountView.value = true
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
}

const yuniChatTablePageChange = async (page) => {
	yuniChatPagination.page = page
	loadTgChatAction(undefined)
}

const changeImModeYuniAccount = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.changeImMode({
			yuniAccountId: row.id,
			imMode: row.imMode === 'web' ? 'app' : 'web'
		})
		tableLoading.value = false
		yuniChatPagination.pageSize = 20
		yuniChatPagination.page = 1
		yuniChatPagination.itemCount = 0
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadYuniAccountAction();
	}
}

const destroyYuniAccount = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.destroy(row.id)
		tableLoading.value = false
		yuniChatPagination.pageSize = 20
		yuniChatPagination.page = 1
		yuniChatPagination.itemCount = 0
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadYuniAccountAction();
	}
}

const deleteYuniAccount = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.delete(row.id)
		tableLoading.value = false
		yuniChatPagination.pageSize = 20
		yuniChatPagination.page = 1
		yuniChatPagination.itemCount = 0
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadUserPlanAction()
		loadYuniAccountAction();
	}
}

const leaveChat = async (row) => {
	if (row.type != 1) {
		$message.success('只支持删除用户')
		return
	}
	try {
		tableLoading.value = true
		let res = await api.leaveChat({
			yuniAccountId: row.yuniAccountId,
			friendUid: row.targetId,
		})
		tableLoading.value = false
		$message.success('操作成功')
		loadTgChatAction(row.yuniAccountId)
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
}

const addWelcomeMessage = () => {
    welcomeMessageList.value.push({
        title: '话术',
        type: 0,
        text: '',
        image: '',
    })
}

const saveWelcomeMessageAction = async () => {
    if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	if (!welcomeMessageList || 0 === welcomeMessageList.value.length) {
		$message.error('请先添加话术')
		return
	}
	for (let item of welcomeMessageList.value) {
        if ('' === item.text && '' === item.image) {
            $message.error('请输入话术内容或上传图片')
            return
        }
    }
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedYuniAccountList.value) {
		try {
			await api.welcomeMessage({
				yuniAccountId: item.id,
				messageList: welcomeMessageList.value,
			})
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedYuniAccountList.value.length) * 100)
	}
	showWelcomeMessageView.value = false
	showProgress.value = false
	selectedYuniAccountList.value = []
	loadYuniAccountAction();
}

const deleteWelcomeMessage = (index) => {
    welcomeMessageList.value.splice(index, 1)
}

const deleteSelectedAction = async () => {
    if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedYuniAccountList.value) {
		try {
			await api.delete(item.id)
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedYuniAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedYuniAccountList.value = []
	loadUserPlanAction()
	loadYuniAccountAction();
}

const cleanStickerAction = async () => {
    if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedYuniAccountList.value) {
		try {
			await api.cleanSticker(item.id)
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedYuniAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedYuniAccountList.value = []
	loadYuniAccountAction();
}

const cleanWelcomeMessageAction = async () => {
    if (!selectedYuniAccountList || 0 === selectedYuniAccountList.value.length) {
		$message.error('请先选择Yuni账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedYuniAccountList.value) {
		try {
			await api.cleanWelcomeMessage(item.id)
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedYuniAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedYuniAccountList.value = []
	loadYuniAccountAction();
}

const showQRCodeDrawer = async () => {
	showQRCodeView.value = true
}

const getQRCode = async () => {
	currentUuid.value = generateUuid()
	try {
		const res = await api.getQRCode({
			userPlanId: userPlanList.value[selectedUserPlanIndex.value].id,
			userPlanTitle: userPlanList.value[selectedUserPlanIndex.value].title,
			uuid: currentUuid.value,
			serverHost: transportServerList.value[selectedTransportServerIndex.value].host,
			serverPort: transportServerList.value[selectedTransportServerIndex.value].port,
			serverTag: transportServerList.value[selectedTransportServerIndex.value].tag,
		})
		if (res.code === 200) {
			qrcodeUrl.value = res.data
			startCheckQRCodeStatus()
		} else {
			$message.error('获取二维码失败')
		}
	} catch (error) {
		console.error(error)
		$message.error('获取二维码失败')
	}
}

const startCheckQRCodeStatus = () => {
	// 清除可能存在的旧定时器
	if (checkQRCodeTimer) {
		clearInterval(checkQRCodeTimer)
	}
	
	const check = async () => {
		try {
			const res = await api.checkQRCodeStatus({
				userPlanId: userPlanList.value[selectedUserPlanIndex.value].id,
				userPlanTitle: userPlanList.value[selectedUserPlanIndex.value].title,
				uuid: currentUuid.value,
				serverHost: transportServerList.value[selectedTransportServerIndex.value].host,
				serverPort: transportServerList.value[selectedTransportServerIndex.value].port,
				serverTag: transportServerList.value[selectedTransportServerIndex.value].tag,
			})
			if (res.code === 200 && res.data !== '') {
				clearInterval(checkQRCodeTimer)
				checkQRCodeTimer = null
				showQRCodeView.value = false
				$message.success('扫码成功')
				loadUserPlanAction()
				loadYuniAccountAction()
				return
			}
			// 如果抽屉已关闭，不再继续检查
			if (!showQRCodeView.value) {
				return
			}
			
			// 设置下一次检查
			checkQRCodeTimer = setTimeout(check, 1000)
		} catch (error) {
			console.error(error)
			// 发生错误时也继续检查
			if (showQRCodeView.value) {
				checkQRCodeTimer = setTimeout(check, 1000)
			}
		}
	}
	
	// 开始第一次检查
	check()
}

watch(showQRCodeView, (newVal) => {
	if (!newVal && checkQRCodeTimer) {
		clearTimeout(checkQRCodeTimer)
		checkQRCodeTimer = null
		// 关闭抽屉时清空二维码URL
		qrcodeUrl.value = ''
	}
})

onUnmounted(() => {
	if (checkQRCodeTimer) {
		clearTimeout(checkQRCodeTimer)
		checkQRCodeTimer = null
	}
})

</script>
