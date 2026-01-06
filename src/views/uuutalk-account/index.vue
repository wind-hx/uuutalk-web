<template>
	<AppPage>
		<n-card style="margin-bottom: 16px;">
			<n-flex>
				<n-dropdown trigger="click" :options="addUUUTalkAccountBtnOptions" @select="addUUUTalkAccountBtnHandleSelect">
					<n-button ghost>添加UUUTalk账户</n-button>
				</n-dropdown>
				<n-button type="info" ghost @click="syncSelectedAction">
					更新账户数据
				</n-button>
				<n-dropdown trigger="click" :options="accountBtnActionOptions" @select="tgAccountBtnActionHandleSelect">
					<n-button type="info" ghost>账户操作</n-button>
				</n-dropdown>
				<n-button type="warning" ghost @click="showDefaultViewAction">
					自动回复
				</n-button>
				<n-button type="error" ghost @click="cleanDefaultMessageAction">
					删除自动回复
				</n-button>
				<n-button type="warning" ghost @click="showWelcomeMessageViewAction">
					欢迎语设置
				</n-button>
				<n-button type="error" ghost @click="cleanWelcomeMessageAction">
					删除欢迎语
				</n-button>
				<n-button type="error" ghost @click="deleteSelectedAction">
					删除
				</n-button>
			</n-flex>
		</n-card>
		<n-data-table 
			:columns="columns" 
			:data="accountList" 
			:pagination="accountPagination" 
			:max-height="480"
			:scroll-x="1800" 
			:loading="tableLoading" 
			:row-key="(row) => row"
			v-model:checked-row-keys="selectedAccountList"/>

		<n-drawer v-model:show="showAccountView" :width="720">
			<n-drawer-content closable>
				<template #header>
					账户详情
				</template>
				<template #default>
					<n-descriptions label-placement="top" bordered :column="3">
						<n-descriptions-item label="昵称">
							{{ selectedAccount.nickname || '--' }}
						</n-descriptions-item>
						<n-descriptions-item label="手机号">
							{{ selectedAccount.phone || '--' }}
						</n-descriptions-item>
						<n-descriptions-item label="所在服务器">
							<n-tag size="small" type="info">{{ selectedAccount.serverTag || '--' }}</n-tag>
						</n-descriptions-item>
						<n-descriptions-item label="状态">
							<n-tag v-if="selectedAccount.status" size="small" type="success">已认证</n-tag>
							<n-tag v-else size="small" type="warning">未认证</n-tag>
						</n-descriptions-item>
						<n-descriptions-item label="自动回复">
							<div v-if="selectedAccount.defaultMessage" v-for="(item, index) in JSON.parse(selectedAccount.defaultMessage)" :key="index">
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
						<n-descriptions-item label="欢迎语">
							<div v-if="selectedAccount.welcomeMessage" v-for="(item, index) in JSON.parse(selectedAccount.welcomeMessage)" :key="index">
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
							<n-tag size="small" type="error">{{ selectedAccount.causeDisconnection || '无' }}</n-tag>
						</n-descriptions-item>
					</n-descriptions>

					<n-data-table :remote="true" style="margin-top: 16px;" :columns="chatColumns" :data="uuuTalkChatList"
						:pagination="uuuTalkChatPagination" :max-height="480" :loading="tableLoading"
						:on-update:page="chatTablePageChange" />
				</template>
				<template #footer>
					<n-button mr-16 @click="showAccountView = false">取消</n-button>
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

		<n-drawer v-model:show="showAddAccountByPhoneView" :width="520">
			<n-drawer-content closable>
				<template #header>
					添加UUUTalk账户
				</template>
				<template #default>
					<n-form ref="createFormRef" :model="createAccount" label-position="top" label-width="auto">
						<n-form-item label="上号须知">
							<p style="font-size: 14px; color: red">默认情况以下消息服务器均为公共消息服务器，用的人非常多，可能存在禁言风控等风险，如果您UUUTalk账户比较多建议联系客服购买独立线路。</p>
						</n-form-item>
						<n-form-item label="用户套餐">
							<n-select placeholder="请选择套餐" v-model:value="selectedUserPlanId" :options="userPlanList" />
						</n-form-item>
						<n-form-item label="用户消息服务器">
							<n-select placeholder="请选择服务器" v-model:value="selectedTransportServerId" :options="transportServerList" />
						</n-form-item>
						<n-form-item label="手机号" prop="phone" required>
							<n-input-group>
								<n-select style="width: 110px" v-model:value="createAccount.region" filterable
									placeholder="请选择" :options="countryList">
								</n-select>
								<n-input placeholder="请输入手机号" v-model:value="createAccount.phone"></n-input>
							</n-input-group>
						</n-form-item>
						<n-form-item label="密码" prop="password" required>
							<n-input
								type="password"
								show-password-on="mousedown"
								placeholder="请输入密码"
								v-model:value="createAccount.password"
								/>
						</n-form-item>
						<n-form-item label="验证吗" prop="code" required>
							<n-input-group>
								<n-input placeholder="请输入验证码" v-model:value="createAccount.code"></n-input>
								<n-button ghost :loading="sendCodeBtnLoading" @click="sendPhoneCodeAction">
									{{ getSmsCodeText }}
								</n-button>
							</n-input-group>
						</n-form-item>
					</n-form>
				</template>
				<template #footer>
					<n-button mr-16 @click="showAddAccountByPhoneView = false">取消</n-button>
					<n-button type="success" :loading="submitLoading" ghost @click="addAccountByPhoneAction">保存</n-button>
				</template>
			</n-drawer-content>
		</n-drawer>

		<n-drawer v-model:show="showAddAccountByMailView" :width="520">
			<n-drawer-content closable>
				<template #header>
					添加UUUTalk账户
				</template>
				<template #default>
					<n-form ref="createFormRef" :model="createAccount" label-position="top" label-width="auto">
						<n-form-item label="上号须知">
							<p style="font-size: 14px; color: red">默认情况以下消息服务器均为公共消息服务器，用的人非常多，可能存在禁言风控等风险，如果您UUUTalk账户比较多建议联系客服购买独立线路。</p>
						</n-form-item>
						<n-form-item label="用户套餐">
							<n-select placeholder="请选择套餐" v-model:value="selectedUserPlanId" :options="userPlanList" />
						</n-form-item>
						<n-form-item label="用户消息服务器">
							<n-select placeholder="请选择服务器" v-model:value="selectedTransportServerId" :options="transportServerList" />
						</n-form-item>
						<n-form-item label="邮箱" prop="mail" required>
							<n-input placeholder="请输入邮箱" v-model:value="createAccount.mail"></n-input>
						</n-form-item>
						<n-form-item label="密码" prop="password" required>
							<n-input
								type="password"
								show-password-on="mousedown"
								placeholder="请输入密码"
								v-model:value="createAccount.password"
								/>
						</n-form-item>
						<n-form-item label="验证吗" prop="code" required>
							<n-input-group>
								<n-input placeholder="请输入验证码" v-model:value="createAccount.code"></n-input>
								<n-button ghost :loading="sendCodeBtnLoading" @click="sendMailCodeAction">
									{{ getSmsCodeText }}
								</n-button>
							</n-input-group>
						</n-form-item>
					</n-form>
				</template>
				<template #footer>
					<n-button mr-16 @click="showAddAccountByMailView = false">取消</n-button>
					<n-button type="success" :loading="submitLoading" ghost @click="addAccountByMailAction">保存</n-button>
				</template>
			</n-drawer-content>
		</n-drawer>

		<n-drawer v-model:show="showQRCodeView" :width="520">
			<n-drawer-content closable>
				<template #header>
					扫码添加UUUTalk账户
				</template>
				<template #default>
					<n-form ref="createFormRef" :model="createTgAccount" label-position="top" label-width="auto">
						<n-form-item label="上号须知">
							<p style="font-size: 14px; color: red">默认情况以下消息服务器均为公共消息服务器，用的人非常多，可能存在禁言风控等风险，如果您UUUTalk账户比较多建议联系客服购买独立线路。</p>
						</n-form-item>
						<n-form-item label="用户套餐">
							<n-select placeholder="请选择套餐" v-model:value="selectedUserPlanId" :options="userPlanList" />
						</n-form-item>
						<n-form-item label="用户消息服务器">
							<n-select placeholder="请选择服务器" v-model:value="selectedTransportServerId" :options="transportServerList" />
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
								<n-text>请使用UUUTalk APP扫描二维码登录</n-text>
							</div>
						</div>
					</n-form>
				</template>
			</n-drawer-content>
		</n-drawer>

		<n-drawer v-model:show="showDefaultView" :width="520">
			<n-drawer-content closable>
				<template #header>
					自动回复设置
				</template>
				<template #default>
					<n-form ref="createFormRef" label-position="top" label-width="auto">
						<n-card title="话术列表">
                            <n-collapse :trigger-areas="triggerAreas" v-for="(item, index) in defaultReplyList" :key="index">
                                <n-collapse-item :title="defaultReplyList[index].title" :name="index">
                                    <template #header-extra>
                                        <n-button mt-2 mb-2 size="small" @click.stop="deleteDefaultReply(index)">删除</n-button>
                                    </template>
									<n-radio-group
										v-model:value="defaultReplyList[index].type"
										name="left-size"
										style="margin-bottom: 12px">
										<n-radio-button :value="0">
											文本
										</n-radio-button>
										<n-radio-button :value="1">
											图片
										</n-radio-button>
									</n-radio-group>
                                    <n-input placeholder="请输入消息内容" v-if="defaultReplyList[index].type === 0" v-model:value="defaultReplyList[index].text" type="textarea"></n-input>
                                    <n-upload
										v-if="defaultReplyList[index].type === 1"
										accept=".jpeg,.jpg,.png"
                                        directory-dnd
                                        @finish="({ file, event}) => uploadDefaultReplyImageFinish({ file, event, index})"
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
                        <n-button type="primary" dashed @click="addDefaultReply">
                            添加话术
                        </n-button>
					</n-form>
				</template>
				<template #footer>
					<n-button mr-16 @click="showDefaultView = false">取消</n-button>
					<n-button :loading="submitLoading" type="success" ghost @click="defaultMessageSelectedAction">保存</n-button>
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
		render(row) {
			return row.phone === '' ? '--' : row.phone;
		}
	},
	{
		title: "邮箱",
		key: "mail",
		width: 120,
		render(row) {
			return row.mail === '' ? '--' : row.mail;
		}
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
		width: 180,
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
							type: 'warning',
							onClick: () => destroyAccount(row)
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
						onClick: () => deleteAccount(row)
					},
					{ default: () => '删除' }
				),
			)
			return btnList
		}
	}
]);

const chatColumns = ref([
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
]);

const addUUUTalkAccountBtnOptions = [
	{
		label: '手机登录',
		key: 'loginByPhone'
	},
	{
		label: '邮箱登录',
		key: 'loginByMail'
	},
	{
		label: '扫码登录',
		key: 'loginByQRCode'
	},
]

const accountBtnActionOptions = [
	{
		label: '自动回复',
		key: 'setDefaultMessage'
	},
	{
		label: '删除自动回复',
		key: 'deleteDefaultMessage'
	},
	{
		label: '欢迎语设置',
		key: 'setWelcomeMessage'
	},
	{
		label: '删除欢迎语',
		key: 'deleteWelcomeMessage'
	},
]

const countryList = ref();
const countryCodeList = ref(["+86"]);
const createAccount = ref({
	uuid: uuidv4(),
	region: '0086',
	phone: '',
	password: '',
	code: '',
});
const getSmsCodeText = ref("点击发送验证码");
const timeCount = ref(20);

const accountList = ref([]);
const uuuTalkChatList = ref([]);
const transportServerList = ref([]);
const userPlanList = ref([]);
const selectedUserPlanId = ref(null);
const selectedTransportServerId = ref(null);
const showAccountView = ref(false);
const accountPagination = reactive({ pageSize: 1000, page: 1, itemCount: 0, param: undefined });
const uuuTalkChatPagination = reactive({ pageSize: 20, page: 1, itemCount: 0, param: undefined });
const submitLoading = ref(false);
const sendCodeBtnLoading = ref(false);
const tableLoading = ref(false);
const selectedAccount = ref({});
const selectedAccountList = ref([]);
const showProgress = ref(false);
const progress = ref(0)
const uploadUrl = ref(`${import.meta.env.VITE_BASE_API}/v1/upload`)
const uploadHeaders = ref({})
const defaultReplyList = ref([]);
const welcomeMessageList = ref([]);
const showWelcomeMessageView = ref(false)
const showDefaultView = ref(false)
const showAddAccountByPhoneView = ref(false)
const showAddAccountByMailView = ref(false)
const showQRCodeView = ref(false)
const qrcodeUrl = ref('')
const currentUuid = ref('')
const currentQRCodeUuid = ref('')
let interval = null;
let checkQRCodeTimer = null

// 生成无连字符的UUID
const generateUuid = () => uuidv4().replace(/-/g, '')

onMounted(
	() => {
		uploadHeaders.value = {
			Authorization: getToken(),
		}
		loadAccountAction()
		loadCountryList()
		loadUserPlanAction()
		loadTransportServerAction()
	}
)

onUnmounted(() => {
	if (interval) {
		clearInterval(interval)
		interval = null
	}
	if (checkQRCodeTimer) {
		clearTimeout(checkQRCodeTimer)
		checkQRCodeTimer = null
	}
});

const convertPhoneCode = (str) => {
  if (str.startsWith('+')) {
    return str.replace('+', '00');
  }
  return str;
}

const loadCountryList = () => {
	let temp = []
	for (let item of countryCodeList.value) {
		temp.push({
			label: item,
			value: convertPhoneCode(item),
		})
	}
	countryList.value = temp
}

const addUUUTalkAccountBtnHandleSelect = (key) => {
	if ('loginByPhone' === key) {
		showAddAccountByPhoneView.value = true
	}
	if ('loginByMail' === key) {
		showAddAccountByMailView.value = true
	}
	if ('loginByQRCode' === key) {
		showQRCodeView.value = true
	}
}

const getUserPlanById = (val) => {
	for (let item of userPlanList.value) {
		if (item.id == val) {
			return item;
		}
	}
	return null
}

const getTransportServerById = (val) => {
	for (let item of transportServerList.value) {
		if (item.id == val) {
			return item;
		}
	}
	return null
}

const loadTransportServerAction = async () => {
	let result = await api.transportServerList()
	transportServerList.value = result.data
	let uuuTalkAccountCount = 999999;
	for (let i = 0; i < transportServerList.value.length; i++) {
		transportServerList.value[i].label = transportServerList.value[i].tag + '-用户数量:' + transportServerList.value[i].uuuTalkAccountCount
		transportServerList.value[i].value = transportServerList.value[i].id
		transportServerList.value[i].disabled = !transportServerList.value[i].enable
		if (transportServerList.value[i].enable) {
			if (transportServerList.value[i].uuuTalkAccountCount < uuuTalkAccountCount) {
				selectedTransportServerId.value = transportServerList.value[i].id;
				uuuTalkAccountCount = transportServerList.value[i].uuuTalkAccountCount;
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
		if (targetDate > currentDate && userPlanList.value[i].uuuTalkAccountCount < userPlanList.value[i].uuuTalkAccountTotal) {
			selectedUserPlanId.value = userPlanList.value[i].id
			userPlanList.value[i].enable = true
		} else {
			userPlanList.value[i].enable = false
		}
		userPlanList.value[i].label = userPlanList.value[i].title + `-(${userPlanList.value[i].uuuTalkAccountCount}/${userPlanList.value[i].uuuTalkAccountTotal})`
		userPlanList.value[i].value = userPlanList.value[i].id
		if (selectedUserPlanId.value === null) {
			selectedUserPlanId.value = userPlanList.value[i].id
		}
	}
}

const addAccountByPhoneAction = async () => {
	if (createAccount.value.phone === '') {
		$message.error('请输入手机号')
		return
	}
	if (createAccount.value.password === '') {
		$message.error('请输入密码')
		return
	}
	if (createAccount.value.code === '') {
		$message.error('请输入验证码')
		return
	}
	submitLoading.value = true
	try {
		const resp = await api.login({
			userPlanId: getUserPlanById(selectedUserPlanId.value).id,
			userPlanTitle: getUserPlanById(selectedUserPlanId.value).title,
			uuid: createAccount.value.uuid,
			region: createAccount.value.region, 
			phone: createAccount.value.phone,
			username: createAccount.value.region + createAccount.value.phone,
			code: createAccount.value.code,
			password: createAccount.value.password,
			source: 1,
			serverHost: getTransportServerById(selectedTransportServerId.value).host,
			serverPort: getTransportServerById(selectedTransportServerId.value).port,
			serverTag: getTransportServerById(selectedTransportServerId.value).tag,
		})
		createAccount.value.uuid = uuidv4()
		$message.success('操作成功')
	} catch (error) {
		console.error(error)
	}
	submitLoading.value = false
}

const addAccountByMailAction = async () => {
	if (createAccount.value.mail === '') {
		$message.error('请输入邮箱')
		return
	}
	if (createAccount.value.password === '') {
		$message.error('请输入密码')
		return
	}
	if (createAccount.value.code === '') {
		$message.error('请输入验证码')
		return
	}
	submitLoading.value = true
	try {
		const resp = await api.login({
			userPlanId: getUserPlanById(selectedUserPlanId.value).id,
			userPlanTitle: getUserPlanById(selectedUserPlanId.value).title,
			uuid: createAccount.value.uuid,
			mail: createAccount.value.mail,
			username: createAccount.value.mail,
			code: createAccount.value.code,
			password: createAccount.value.password,
			source: 2,
			serverHost: getTransportServerById(selectedTransportServerId.value).host,
			serverPort: getTransportServerById(selectedTransportServerId.value).port,
			serverTag: getTransportServerById(selectedTransportServerId.value).tag,
		})
		createAccount.value.uuid = uuidv4()
		$message.success('操作成功')
	} catch (error) {
		console.error(error)
	}
	submitLoading.value = false
}

const sendMailCodeAction = async () => {
	if (createAccount.value.mail === '') {
		$message.error('请输入邮箱')
		return
	}
	if (createAccount.value.password === '') {
		$message.error('请输入密码')
		return
	}
	if (sendCodeBtnLoading.value || getSmsCodeText.value !== '点击发送验证码') {
		return;
	}
	sendCodeBtnLoading.value = true
	try {
		const resp = await api.sendMailVerifiedSms({
			userPlanId: getUserPlanById(selectedUserPlanId.value).id,
			userPlanTitle: getUserPlanById(selectedUserPlanId.value).title,
			uuid: createAccount.value.uuid,
			mail: createAccount.value.mail,
			password: createAccount.value.password,
			serverHost: getTransportServerById(selectedTransportServerId.value).host,
			serverPort: getTransportServerById(selectedTransportServerId.value).port,
			serverTag: getTransportServerById(selectedTransportServerId.value).tag,
		})
		$message.success('发送成功')
		sendCodeBtnLoading.value = false
		let time = 0;
		interval = setInterval(() => {
			time++;
			if (time >= timeCount.value) {
				clearInterval(interval);
				interval = null;
				getSmsCodeText.value = '点击发送验证码'
				return;
			}
			getSmsCodeText.value = timeCount.value - time + 's';
		}, 1000)
	} catch (error) {
		console.error(error)
	}
	sendCodeBtnLoading.value = false
}

const sendPhoneCodeAction = async () => {
	if (createAccount.value.phone === '') {
		$message.error('请输入手机号')
		return
	}
	if (createAccount.value.password === '') {
		$message.error('请输入密码')
		return
	}
	if (sendCodeBtnLoading.value || getSmsCodeText.value !== '点击发送验证码') {
		return;
	}
	sendCodeBtnLoading.value = true
	try {
		const resp = await api.sendPhoneVerifiedSms({
			userPlanId: getUserPlanById(selectedUserPlanId.value).id,
			userPlanTitle: getUserPlanById(selectedUserPlanId.value).title,
			uuid: createAccount.value.uuid,
			phone: createAccount.value.phone,
			region: createAccount.value.region,
			password: createAccount.value.password,
			serverHost: getTransportServerById(selectedTransportServerId.value).host,
			serverPort: getTransportServerById(selectedTransportServerId.value).port,
			serverTag: getTransportServerById(selectedTransportServerId.value).tag,
		})
		$message.success('发送成功')
		sendCodeBtnLoading.value = false
		let time = 0;
		interval = setInterval(() => {
			time++;
			if (time >= timeCount.value) {
				clearInterval(interval);
				interval = null;
				getSmsCodeText.value = '点击发送验证码'
				return;
			}
			getSmsCodeText.value = timeCount.value - time + 's';
		}, 1000)
	} catch (error) {
		console.error(error)
	}
	sendCodeBtnLoading.value = false
}

const syncSelectedAction = async () => {
	if (!selectedAccountList || 0 === selectedAccountList.value.length) {
		$message.error('请先选择UUUTalk账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedAccountList.value) {
		await syncAction(item, false)
		i++
		progress.value = parseInt((i / selectedAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedAccountList.value = []
	loadAccountAction();
}

const showDefaultViewAction = () => {
	if (!selectedAccountList || 0 === selectedAccountList.value.length) {
		$message.error('请先选择UUUTalk账户')
		return
	}
	defaultReplyList.value = []
	showDefaultView.value = true
}

const showWelcomeMessageViewAction = () => {
	if (!selectedAccountList || 0 === selectedAccountList.value.length) {
		$message.error('请先选择UUUTalk账户')
		return
	}
	welcomeMessageList.value = []
	showWelcomeMessageView.value = true
}

const uploadDefaultReplyImageFinish = ({ file, event, index}) => {
	if (event && event.target && event.target.response) {
		let resp = JSON.parse(event.target.response)
        defaultReplyList.value[index].image = resp.data
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

const defaultMessageSelectedAction = async () => {
	if (!selectedAccountList || 0 === selectedAccountList.value.length) {
		$message.error('请先选择UUUTalk账户')
		return
	}
	if (!defaultReplyList || 0 === defaultReplyList.value.length) {
		$message.error('请先添加话术')
		return
	}
	for (let item of defaultReplyList.value) {
        if ('' === item.text && '' === item.image) {
            $message.error('请输入话术内容或上传图片')
            return
        }
    }
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedAccountList.value) {
		try {
			await api.defaultMessage({
				uuuTalkAccountId: item.id,
				messageList: defaultReplyList.value
			})
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedAccountList.value.length) * 100)
	}
	showDefaultView.value = false
	showProgress.value = false
	selectedAccountList.value = []
	loadAccountAction();
}

const loadAccountAction = async () => {
	tableLoading.value = true
	let result = await api.list()
	tableLoading.value = false
	accountList.value = result.data ?? []
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
		loadAccountAction();
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
		loadAccountAction();
	}
}

const detailsAction = async (row) => {
	try {
		selectedAccount.value = row
		loadChatAction(row.id)
	} catch (error) {
		console.error(error)
	}
}

const loadChatAction = async (uuuTalkAccountId) => {
	try {
		tableLoading.value = true
		let res = await api.uuuTalkChatList({
			uuuTalkAccountId: uuuTalkAccountId || uuuTalkChatPagination.param,
			pageIndex: uuuTalkChatPagination.page,
			pageSize: uuuTalkChatPagination.pageSize,
		})
		tableLoading.value = false
		uuuTalkChatList.value = res.data
		uuuTalkChatPagination.pageSize = 20
		uuuTalkChatPagination.page = res.pageIndex
		uuuTalkChatPagination.itemCount = res.totalRecords
		uuuTalkChatPagination.param = uuuTalkAccountId || uuuTalkChatPagination.param
		showAccountView.value = true
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
}

const chatTablePageChange = async (page) => {
	uuuTalkChatPagination.page = page
	loadChatAction(undefined)
}

const destroyAccount = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.destroy(row.id)
		tableLoading.value = false
		uuuTalkChatPagination.pageSize = 20
		uuuTalkChatPagination.page = 1
		uuuTalkChatPagination.itemCount = 0
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadAccountAction();
	}
}

const deleteAccount = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.delete(row.id)
		tableLoading.value = false
		uuuTalkChatPagination.pageSize = 20
		uuuTalkChatPagination.page = 1
		uuuTalkChatPagination.itemCount = 0
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadUserPlanAction()
		loadAccountAction();
	}
}

const addDefaultReply = () => {
    defaultReplyList.value.push({
        title: '话术',
        type: 0,
        text: '',
        image: '',
    })
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
    if (!selectedAccountList || 0 === selectedAccountList.value.length) {
		$message.error('请先选择UUUTalk账户')
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
	for (let item of selectedAccountList.value) {
		try {
			await api.welcomeMessage({
				uuuTalkAccountId: item.id,
				messageList: welcomeMessageList.value,
			})
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedAccountList.value.length) * 100)
	}
	showWelcomeMessageView.value = false
	showProgress.value = false
	selectedAccountList.value = []
	loadAccountAction();
}

const deleteDefaultReply = (index) => {
    defaultReplyList.value.splice(index, 1)
}

const deleteWelcomeMessage = (index) => {
    welcomeMessageList.value.splice(index, 1)
}

const deleteSelectedAction = async () => {
    if (!selectedAccountList || 0 === selectedAccountList.value.length) {
		$message.error('请先选择UUUTalk账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedAccountList.value) {
		try {
			await api.delete(item.id)
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedAccountList.value = []
	loadUserPlanAction()
	loadAccountAction();
}

const cleanDefaultMessageAction = async () => {
    if (!selectedAccountList || 0 === selectedAccountList.value.length) {
		$message.error('请先选择UUUTalk账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedAccountList.value) {
		try {
			await api.cleanDefaultMessage(item.id)
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedAccountList.value = []
	loadAccountAction();
}

const cleanWelcomeMessageAction = async () => {
    if (!selectedAccountList || 0 === selectedAccountList.value.length) {
		$message.error('请先选择UUUTalk账户')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedAccountList.value) {
		try {
			await api.cleanWelcomeMessage(item.id)
		} catch (error) {
			console.error(error)
		}
		i++
		progress.value = parseInt((i / selectedAccountList.value.length) * 100)
	}
	showProgress.value = false
	selectedAccountList.value = []
	loadAccountAction();
}

const getQRCode = async () => {
	currentUuid.value = generateUuid()
	try {
		const res = await api.getLoginQRCode({
			userPlanId: getUserPlanById(selectedUserPlanId.value).id,
			userPlanTitle: getUserPlanById(selectedUserPlanId.value).title,
			uuid: currentUuid.value,
			serverHost: getTransportServerById(selectedTransportServerId.value).host,
			serverPort: getTransportServerById(selectedTransportServerId.value).port,
			serverTag: getTransportServerById(selectedTransportServerId.value).tag,
		})
		if (res.code === 200) {
			qrcodeUrl.value = res.data.qrcode
			currentQRCodeUuid.value = res.data.uuid
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
			const res = await api.checkLoginQRCode({
				userPlanId: getUserPlanById(selectedUserPlanId.value).id,
				userPlanTitle: getUserPlanById(selectedUserPlanId.value).title,
				uuid: currentUuid.value,
				qrCodeUUID: currentQRCodeUuid.value,
				serverHost: getTransportServerById(selectedTransportServerId.value).host,
				serverPort: getTransportServerById(selectedTransportServerId.value).port,
				serverTag: getTransportServerById(selectedTransportServerId.value).tag,
			})
			if (res.code === 200 && res.data !== '') {
				if (res.data.status === 'authed') {
					createAccount.value.uuid = uuidv4()
					clearInterval(checkQRCodeTimer)
					checkQRCodeTimer = null
					showQRCodeView.value = false
					$message.success('扫码成功')
					loadUserPlanAction()
					loadAccountAction()
					return
				}
				if (res.data.status === "expired") {
					$message.success('二维码过期')
					getQRCode()
					return
				}
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

</script>
