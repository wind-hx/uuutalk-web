<template>
	<AppPage>
		<n-card style="margin-bottom: 16px;">
			<n-button ghost mr-16 @click="showCreateViewAction">
				添加群发任务
			</n-button>
			<n-button type="primary" ghost mr-16 @click="startAll">
				一键启动
			</n-button>
			<n-button type="info" ghost mr-16 @click="stopAll">
				一键停止
			</n-button>
			<n-button type="error" ghost mr-16 @click="deleteAll">
				删除
			</n-button>
		</n-card>
		<n-data-table 
			:remote="true" 
			:columns="columns" 
			:data="taskList" 
			:pagination="taskPagination" 
			:max-height="480" 
			:scroll-x="1800" 
			:loading="tableLoading" 
			:on-update:page="taskTablePageChange"
			:row-key="(row) => row"
			v-model:checked-row-keys="selectedTaskList" />

		<n-drawer v-model:show="showCreateView" :width="520">
			<n-drawer-content closable>
				<template #header>
					{{task.id ? '修改任务' : '添加任务'}}
				</template>
				<template #default>
					<n-form ref="createFormRef" :model="task" label-position="top" label-width="auto">
						<n-form-item label="UUUTalk账户" prop="uuuTalkAccountId">
							<n-select 
								multiple 
								placeholder="请选择UUUTalk账户" 
								v-model:value="selectedUUUTalkAccountId" 
								:on-blur="changeUUUTalkAccount"
								:options="accountList" />
							<div style="padding-left: 8px;"></div>
							<n-button @click="checkAll">全选</n-button>
						</n-form-item>
						<n-form-item label="任务类型" prop="messageType">
							<n-radio-group
								v-model:value="task.messageType"
								name="left-size"
								style="margin-bottom: 12px">
								<n-radio-button :value="0">
									文本
								</n-radio-button>
								<n-radio-button :value="1">
									图片
								</n-radio-button>
							</n-radio-group>
						</n-form-item>
						<n-form-item label="任务名称" prop="title">
							<n-input placeholder="请输入任务名称" v-model:value="task.title"></n-input>
						</n-form-item>
						<span style="color: red; font-size: 14px;" v-if="task.messageType == 0">[多条消息随机发送]</span>
						<div v-for="(item, index) in taskTextArray">
							<n-form-item :label="`消息内容${index + 1}`" prop="text" v-if="task.messageType == 0" >
								<n-input placeholder="请输入任务内容" v-model:value="taskTextArray[index]" type="textarea"></n-input>
							</n-form-item>
						</div>
						<n-button type="info" ghost @click="addTaskTextAction" v-if="task.messageType === 0" mr-16>多条消息</n-button>
						<n-button type="error" ghost @click="deleteTaskTextAction" v-if="task.messageType === 0">删除消息</n-button>
						<br v-if="task.messageType === 0" /><br v-if="task.messageType === 0" />
						<n-form-item label="消息图片" prop="text" v-if="task.messageType == 1 || task.messageType == 2">
							<n-upload
								v-if="!task.imageUrl"
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
							<div>
								<n-image
									v-if="task.imageUrl"
									width="100"
									:src="task.imageUrl"
								/>
								<br/>
								<n-button v-if="task.imageUrl" type="error" @click="task.imageUrl = ''" dashed>
									删除图片
								</n-button>
							</div>
						</n-form-item>
						<n-form-item label="任务执行时间" prop="taskExecutionTime" required>
							<n-space>
								<n-time-picker :default-formatted-value="taskExecutionTimeStart" :on-update:value="taskExecutionTimeStartConfirm" />
								<n-time-picker :default-formatted-value="taskExecutionTimeEnd" :on-update:value="taskExecutionTimeEndConfirm" />
							</n-space>
						</n-form-item>
						<n-form-item label="发送消息间隔" prop="timeSpacing" required :validation-status="timeSpacingValidationStatus">
							<n-input-group>
								<n-select style="width: 200px" v-model:value="task.timeUnit" placeholder="请选择" :options="timeUnitList">
								</n-select>
								<n-input-number style="width: 100%;" :min="1" :max="600" placeholder="请输入消息间隔" v-model:value="timeSpacingStart" clearable @update:value="handleTimeSpacingChange" />
								<span lh-34 pl-12 pr-12>～</span>
								<n-input-number style="width: 100%;" :min="timeSpacingStart" :max="600" placeholder="请输入消息间隔" v-model:value="timeSpacingEnd" clearable />
							</n-input-group>
							<template #feedback>
								{{ timeSpacingFeedback }}
							</template>
						</n-form-item>
						<n-form-item label="等待消息间隔" prop="waitTimeSpacing" required :validation-status="waitTimeSpacingValidationStatus">
							<n-input-group>
								<n-select style="width: 200px" v-model:value="task.waitTimeUnit" placeholder="请选择" :options="timeUnitList">
								</n-select>
								<n-input-number style="width: 100%;" :min="1" :max="600" placeholder="请输入消息间隔" v-model:value="waitTimeSpacingStart" clearable @update:value="handleWaitTimeSpacingChange" />
								<span lh-34 pl-12 pr-12>～</span>
								<n-input-number style="width: 100%;" :min="waitTimeSpacingStart" :max="600" placeholder="请输入消息间隔" v-model:value="waitTimeSpacingEnd" clearable />
							</n-input-group>
							<template #feedback>
								{{ waitTimeSpacingFeedback }}
							</template>
						</n-form-item>
						<n-form-item label="消息总数" prop="total" required>
							<n-input-number style="width: 100%;" :min="1" :max="10000000" placeholder="请输入消息总数" v-model:value="task.total" clearable />
						</n-form-item>
						<n-form-item label="辅助选项">
							<n-checkbox v-model:checked="task.hasTail">
								消息结尾是否携带随机表情
							</n-checkbox>
							<n-checkbox v-model:checked="task.autoRemoveNoPermissionChat">
								自动删除无权限群组
							</n-checkbox>
						</n-form-item>
						<n-form-item label="目标类型" prop="limit">
							<n-radio-group
								v-model:value="task.type"
								name="left-size"
								style="margin-bottom: 12px">
								<n-radio-button :value="0">
									群组
								</n-radio-button>
								<n-radio-button :value="1">
									用户
								</n-radio-button>
							</n-radio-group>
						</n-form-item>
						<n-button type="success" ghost @click="selectChatAction" v-if="selectedUUUTalkAccountId.length === 1">
							选择目标
						</n-button>
						<br/><br/>
						<n-data-table
							v-if="selectedUUUTalkAccountId.length === 1"
							:columns="selectedTgChatColumns"
							:data="selectedUUUTalkChatList"/>
					</n-form>
				</template>
				<template #footer>
					<n-button mr-16 @click="showCreateView = false">取消</n-button>
					<n-button :loading="submitLoading" type="success" ghost @click="saveTaskAction">保存</n-button>
				</template>
			</n-drawer-content>
			<n-drawer v-model:show="showTgChatList" :width="320">
				<n-drawer-content title="对话框列表">
					<n-data-table
						:columns="tgChatColumns"
						:data="tgChatList"
						:row-key="(row) => row"
						@update:checked-row-keys="handleTgChatCheck"/>
				</n-drawer-content>
			</n-drawer>
		</n-drawer>

		<n-drawer v-model:show="showTaskView" :width="720">
			<n-drawer-content closable>
				<template #header>
					任务详情
				</template>
				<template #default>
					<n-descriptions label-placement="top" bordered :column="3">
						<n-descriptions-item label="标题">
							{{ task.title || '--' }}
						</n-descriptions-item>
						<n-descriptions-item label="时间间隔">
							<n-tag v-if="'ms' === task.timeUnit" size="small" type="info">{{ JSON.parse(task.timeSpacingList).join('~') + ' 毫秒' }}</n-tag>
							<n-tag v-if="'s' === task.timeUnit" size="small" type="info">{{ JSON.parse(task.timeSpacingList).join('~') + ' 秒' }}</n-tag>
							<n-tag v-if="'m' === task.timeUnit" size="small" type="info">{{ JSON.parse(task.timeSpacingList).join('~') + ' 分' }}</n-tag>
							<n-tag v-if="'h' === task.timeUnit" size="small" type="info">{{ JSON.parse(task.timeSpacingList).join('~') + ' 时' }}</n-tag>
						</n-descriptions-item>
						<n-descriptions-item label="状态">
							<n-tag v-if="0 === task.status" size="small" type="warning">未启动</n-tag>
							<n-tag v-if="1 === task.status" size="small" type="success">运行中</n-tag>
							<n-tag v-if="2 === task.status" size="small">完成</n-tag>
							<n-tag v-if="3 === task.status" size="small" type="error">终止</n-tag>
						</n-descriptions-item>
						<n-descriptions-item label="任务内容">
							{{ task.text || '--' }}
						</n-descriptions-item>
					</n-descriptions>

					<n-data-table :remote="true" style="margin-top: 16px;" :columns="sendRecordColumns" :data="sendRecordList"
						:pagination="sendRecordPagination" :max-height="480" :loading="tableLoading"
						:on-update:page="sendRecordTablePageChange" />
				</template>
				<template #footer>
					<n-button mr-16 @click="showTaskView = false">取消</n-button>
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
	</AppPage>
</template>
  
<script setup>
import { h, defineComponent, ref, onMounted, reactive } from "vue";
import { NTag, NButton, NEllipsis } from 'naive-ui'
import api from './api'
import { timeUnitList } from './data'
import { getToken } from '@/utils'

const columns = ref([
	{
		type: "selection",
		fixed: "left"
	},
	{
		title: "所属账户",
		key: "nickname",
		width: 160,
	},
	{
		title: "任务名称",
		key: "title",
		width: 100,
	},
	{
		title: "任务内容",
		key: "text",
		width: 120,
		render(row) {
			return h(
				NEllipsis,
				{  },
				{ default: () => '' === row.text ? '--' : row.text ?? '--' }
			)
		}
	},
	{
		title: "时间间隔",
		key: "timeSpacing",
		width: 120,
		render(row) {
			if ('ms' === row.timeUnit) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'info'
					},
					{ default: () => JSON.parse(row.timeSpacingList).join('~') + ' 毫秒' }
				)
			}
			if ('s' === row.timeUnit) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'info'
					},
					{ default: () => JSON.parse(row.timeSpacingList).join('~') + ' 秒' }
				)
			}
			if ('m' === row.timeUnit) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'info'
					},
					{ default: () => JSON.parse(row.timeSpacingList).join('~') + ' 分' }
				)
			}
			if ('h' === row.timeUnit) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'info'
					},
					{ default: () => JSON.parse(row.timeSpacingList).join('~') + ' 时' }
				)
			}
		}
	},
	{
		title: '等待间隔',
		key: "waitTimeSpacing",
		width: 120,
		render(row) {
			if ('ms' === row.waitTimeUnit) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'warning'
					},
					{ default: () => JSON.parse(row.waitTimeSpacingList).join('~') + ' 毫秒' }
				)
			}
			if ('s' === row.waitTimeUnit) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'warning'
					},
					{ default: () => JSON.parse(row.waitTimeSpacingList).join('~') + ' 秒' }
				)
			}
			if ('m' === row.waitTimeUnit) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'warning'
					},
					{ default: () => JSON.parse(row.waitTimeSpacingList).join('~') + ' 分' }
				)
			}
			if ('h' === row.waitTimeUnit) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'warning'
					},
					{ default: () => JSON.parse(row.waitTimeSpacingList).join('~') + ' 时' }
				)
			}
		}
	},
	{
		title: "状态",
		key: "status",
		width: 100,
		render(row) {
			if (0 === row.status) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'warning'
					},
					{ default: () => '未启动' }
				)
			} 
			if (1 === row.status) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'success'
					},
					{ default: () => '运行中' }
				)
			}
			if (2 === row.status) {
				return h(
					NTag,
					{
						size: 'small',
					},
					{ default: () => '完成' }
				)
			}
			if (3 === row.status) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'error'
					},
					{ default: () => '终止' }
				)
			}
		}
	},
	{
		title: "成功数量",
		key: "successTotal",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'success'
				},
				{ default: () => row.successTotal }
			)
		}
	},
	{
		title: "失败数量",
		key: "failTotal",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'error'
				},
				{ default: () => row.failTotal }
			)
		}
	},
	{
		title: "添加时间",
		key: "gmtCreated",
		width: 120,
	},
	{
		title: "操作",
		key: "action",
		width: 200,
		fixed: "right",
		render(row) {
			let btnList = []
			if (0 === row.status) {
				btnList.push(
					h(
						NButton,
						{
							style: 'margin-right: 16px',
							size: 'small',
							type: 'success',
							onClick: () => startTask(row)
						},
						{ default: () => '启动' }
					)
				)
				btnList.push(
					h(
						NButton,
						{
							style: 'margin-right: 16px',
							size: 'small',
							onClick: () => showEditView(row)
						},
						{ default: () => '编辑' }
					)
				)
			}
			if (1 === row.status) {
				btnList.push(
					h(
						NButton,
						{
							style: 'margin-right: 16px',
							size: 'small',
							type: 'warning',
							onClick: () => stopTask(row)
						},
						{ default: () => '停止' }
					)
				)
			}
			if (3 == row.status) {
				btnList.push(
					h(
						NButton,
						{
							style: 'margin-right: 16px',
							size: 'small',
							onClick: () => showEditView(row)
						},
						{ default: () => '编辑' }
					)
				)
			}
			btnList.push(
				h(
					NButton,
					{
						style: 'margin-right: 16px',
						size: 'small',
						type: 'info',
						onClick: () => detailsAction(row)
					},
					{ default: () => '详情' }
				)
			)
			btnList.push(
				h(
					NButton,
					{
						size: 'small',
						type: 'error',
						onClick: () => deleteTask(row)
					},
					{ default: () => '删除' }
				),
			)
			return btnList
		}
	}
]);

const tgChatColumns = ref([
	{
		type: "selection",
		fixed: "left"
	},
	{
		title: "标题",
		key: "title",
		width: 160,
	},
]);

const selectedTgChatColumns = ref([
	{
		title: "任务目标群组",
		key: "title",
		width: 160,
	},
]);

const sendRecordColumns = ref([
	{
		title: "目标群组标题",
		key: "title",
		width: 160,
	},
	{
		title: "状态",
		key: "status",
		width: 120,
		render(row) {
			if (1 === row.status) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'success'
					},
					{ default: () => '成功' }
				)
			} else {
				return h(
					NTag,
					{
						size: 'small',
						type: 'error'
					},
					{ default: () => '失败' }
				)
			}
		}
	},
	{
		title: "失败原因",
		key: "result",
		width: 120,
		render(row) {
			return h(
				NEllipsis,
				{  },
				{ default: () => row.result }
			)
		}
	},
	{
		title: "发送时间",
		key: "gmtCreated",
		width: 160,
	},
]);

const accountList = ref([]);

const defaultTask = ref({
	id: null,
	uuuTalkAccountId: null,
	title: '',
	text: null,
	imageUrl: null,
	total: 10000000,
	messageType: 0,
	timeUnit: 's',
	waitTimeUnit: 's',
	limit: 0,
	hasTail: false,
	autoRemoveNoPermissionChat: true,
	isSafeMode: true,
	type: 0,
})
const task = ref(JSON.parse(JSON.stringify(defaultTask.value)));
const taskTextArray = ref([
	'',
]);
const selectedUUUTalkAccountId = ref([]);
const taskList = ref([]);
const taskPagination = reactive({ pageSize: 20, page: 1, itemCount: 0 });
const sendRecordList = ref([]);
const sendRecordPagination = reactive({ pageSize: 20, page: 1, itemCount: 0 });
const tgChatList = ref([]);
const selectedUUUTalkChatList = ref([]);
const selectedTaskList = ref([]);
const showCreateView = ref(false);
const showTgChatList = ref(false);
const showTaskView = ref(false);
const showProgress = ref(false);
const submitLoading = ref(false);
const tableLoading = ref(false);
const uploadUrl = ref(`${import.meta.env.VITE_BASE_API}/v1/upload`)
const uploadHeaders = ref({})
const progress = ref(0)
const timeSpacingFeedback = ref('')
const timeSpacingStart = ref(3)
const timeSpacingEnd = ref(5)
const waitTimeSpacingFeedback = ref('')
const waitTimeSpacingStart = ref(10)
const waitTimeSpacingEnd = ref(10)
const taskExecutionTimeStart = ref('00:00:00')
const taskExecutionTimeEnd = ref('23:59:59')

onMounted(
	() => {
		uploadHeaders.value = {
			Authorization: getToken(),
		}
		loadUUUTalkAccountAction()
		loadTaskAction()
	}
)

const checkAll = async () => {
	selectedUUUTalkAccountId.value = [];
	for (let item of accountList.value) {
		selectedUUUTalkAccountId.value.push(item.id)
	}
}

const loadUUUTalkAccountAction = async () => {
	let result = await api.accountList()
	let temp = []
	for (let item of result.data) {
		item.label = item.nickname
		item.value = item.id
		item.disabled = null != item.taskId && 0 != item.taskId
		temp.push(item)
	}
	accountList.value = temp
}

const getUUUTalkAccountById = (id) => {
	for (let item of accountList.value) {
		if (item.id === id) {
			return item
		}
	}
	return null;
}

const loadTaskAction = async () => {
	tableLoading.value = true
	let result = await api.taskList({
		pageIndex: taskPagination.page,
		pageSize: taskPagination.pageSize,
	})
	tableLoading.value = false
	taskList.value = result.data ?? []
	taskPagination.pageSize = 20
	taskPagination.page = result.pageIndex
	taskPagination.itemCount = result.totalRecords
}

const showCreateViewAction = async () => {
	showCreateView.value = true;
	task.value = JSON.parse(JSON.stringify(defaultTask.value))
	selectedUUUTalkAccountId.value = []
	selectedUUUTalkChatList.value = []
	taskTextArray.value = ['']
}

const addTaskTextAction = async () => {
	if (taskTextArray.value.length >= 10) {
		$message.error('最多10条消息内容')
		return
	}
	taskTextArray.value.push('')
}

const deleteTaskTextAction = async () => {
	if (taskTextArray.value.length === 1) {
		$message.error('至少保留一条消息')
		return
	}
	taskTextArray.value = taskTextArray.value.slice(0, -1)
}

const taskTablePageChange = async (page) => {
	taskPagination.page = page
	loadTaskAction()
}

const sendRecordTablePageChange = async (page) => {
	sendRecordPagination.page = page
	loadSendRecordAction()
}

const selectChatAction = async () => {
	if (0 === selectedUUUTalkAccountId.value.length) {
		$message.error('请选择UUUTalk账户')
		return
	}
	let result = []
	if (task.value.type === 0) {
		result = await api.tgChatQuerySelfGroup({
			uuuTalkAccountId: selectedUUUTalkAccountId.value[0],
		})
	} else if (task.value.type === 1) {
		result = await api.tgChatQuerySelfFriend({
			uuuTalkAccountId: selectedUUUTalkAccountId.value[0],
		})
	}
	tgChatList.value = result.data
	showTgChatList.value = true
}

const handleTgChatCheck = async(rowKeys) => {
	selectedUUUTalkChatList.value = rowKeys
}

const handleTimeSpacingChange = (number) => {
	if (timeSpacingEnd.value < number) {
		timeSpacingEnd.value = number;
	}
}

const handleWaitTimeSpacingChange = (number) => {
	if (waitTimeSpacingEnd.value < number) {
		waitTimeSpacingEnd.value = number;
	}
}

const uploadFinish = ({ file, event}) => {
	if (event && event.target && event.target.response) {
		let resp = JSON.parse(event.target.response)
		task.value.imageUrl = resp.data
	}
    return file;
};

const timeSpacingValidationStatus = computed(() => {
	timeSpacingFeedback.value = ''
	if (task.value.timeUnit === 's' && timeSpacingStart.value > 0) {
		timeSpacingFeedback.value = '每隔 ' + timeSpacingStart.value + ' ~ ' + timeSpacingEnd.value + ' 秒发送一条消息'
	}
	if (task.value.timeUnit === 'm' && timeSpacingStart.value > 0) {
		timeSpacingFeedback.value = '每隔 ' + timeSpacingStart.value + ' ~ ' + timeSpacingEnd.value + ' 分发送所有消息'
	}
	if (task.value.timeUnit === 'h' && timeSpacingStart.value > 0) {
		timeSpacingFeedback.value = '每隔 ' + timeSpacingStart.value + ' ~ ' + timeSpacingEnd.value + ' 时发送所有消息'
	}
    return undefined
});

const waitTimeSpacingValidationStatus = computed(() => {
	waitTimeSpacingFeedback.value = ''
	if (task.value.waitTimeUnit === 's' && waitTimeSpacingStart.value > 0) {
		waitTimeSpacingFeedback.value = '全部发完等待 ' + waitTimeSpacingStart.value + ' ~ ' + waitTimeSpacingEnd.value + ' 秒后再开始执行任务'
	}
	if (task.value.waitTimeUnit === 'm' && waitTimeSpacingStart.value > 0) {
		waitTimeSpacingFeedback.value = '全部发完等待 ' + waitTimeSpacingStart.value + ' ~ ' + waitTimeSpacingEnd.value + ' 分后再开始执行任务'
	}
	if (task.value.waitTimeUnit === 'h' && waitTimeSpacingStart.value > 0) {
		waitTimeSpacingFeedback.value = '全部发完等待 ' + waitTimeSpacingStart.value + ' ~ ' + waitTimeSpacingEnd.value + ' 时后再开始执行任务'
	}
    return undefined
});

const compareTime = (time1, time2) => {
	const date1 = new Date(`1970-01-01T${time1}Z`); // ISO 8601 格式
	const date2 = new Date(`1970-01-01T${time2}Z`);

	if (date1 >= date2) {
		return true;
	} else {
		return false;
	}
}

const saveTaskAction = async () => {
	if (0 === selectedUUUTalkAccountId.value.length) {
		$message.error('请选择UUUTalk账户')
		return
	}
	if (!task.value.title) {
		$message.error('请输入任务标题')
		return
	}
	if (0 === task.value.messageType) {
		if (0 === taskTextArray.value.length) {
			$message.error('请输入任务内容')
			return
		}
		if ('' === taskTextArray.value[0]) {
			$message.error('请输入任务内容')
			return
		}
		task.value.text = JSON.stringify(taskTextArray.value)
    }
	if (1 === task.value.messageType && !task.value.imageUrl) {
        $message.error('请上传图片')
		return
    }
	if (2 === task.value.messageType) {
		if (0 === taskTextArray.value.length) {
			$message.error('请输入任务内容')
			return
		}
		if ('' === taskTextArray.value[0]) {
			$message.error('请输入任务内容')
			return
		}
		task.value.text = JSON.stringify(taskTextArray.value)
		if (!task.value.imageUrl) {
			$message.error('请上传图片')
			return
		}
    }
	if (compareTime(taskExecutionTimeStart.value, taskExecutionTimeEnd.value)) {
		$message.error('执行时间配置错误')
		return
	}
	if (task.value.total <= 0) {
		$message.error('请输入有效的消息总数')
		return
    }
	if (1 == selectedUUUTalkAccountId.value.length) {
		task.value.uuuTalkAccountId = selectedUUUTalkAccountId.value[0]
		if (0 === selectedUUUTalkChatList.value.length) {
			$message.error('请选择目标群组')
			return
		}
		task.value.timeSpacingList = JSON.stringify([parseInt(timeSpacingStart.value), parseInt(timeSpacingEnd.value)])
		task.value.waitTimeSpacingList = JSON.stringify([parseInt(waitTimeSpacingStart.value), parseInt(waitTimeSpacingEnd.value)])
		task.value.executionTimeRange = JSON.stringify([taskExecutionTimeStart.value, taskExecutionTimeEnd.value])
		if (task.value.type === 0) {
			task.value.targetGroupList = JSON.stringify(selectedUUUTalkChatList.value)
			task.value.targetUserList = '[]'
		} else if (task.value.type === 1) {
			task.value.targetGroupList = '[]'
			task.value.targetUserList = JSON.stringify(selectedUUUTalkChatList.value)
		}

		if (task.value.id) {
			await api.taskUpdate(task.value)
		} else {
			await api.taskSave(task.value)
		}
		$message.success('操作成功')
		showCreateView.value = false
		loadTaskAction()
	} else {
		progress.value = 0
		showProgress.value = true
		let i = 0
		for (let item of selectedUUUTalkAccountId.value) {
			let result = []
			if (task.value.type === 0) {
				result = await api.tgChatQuerySelfGroup({
					uuuTalkAccountId: item,
				})
			} else if (task.value.type === 1) {
				result = await api.tgChatQuerySelfFriend({
					uuuTalkAccountId: item,
				})
			}
			task.value.title = '批量创建任务: ' + getUUUTalkAccountById(item).phone
			task.value.uuuTalkAccountId = item
			if (!result.data || 0 === result.data.length) {
				$message.error('请选择目标群组')
				continue
			}
			task.value.timeSpacingList = JSON.stringify([parseInt(timeSpacingStart.value), parseInt(timeSpacingEnd.value)])
			task.value.waitTimeSpacingList = JSON.stringify([parseInt(waitTimeSpacingStart.value), parseInt(waitTimeSpacingEnd.value)])
			task.value.executionTimeRange = JSON.stringify([taskExecutionTimeStart.value, taskExecutionTimeEnd.value])
			task.value.targetGroupList = JSON.stringify(result.data)
			await api.taskSave(task.value)
			$message.success('操作成功')
			i++
			progress.value = parseInt((i / selectedUUUTalkAccountId.value.length) * 100)
		}
		showProgress.value = false
		showCreateView.value = false
		loadTaskAction()
	}
	
}

const startTask = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.taskStart(row.id)
		tableLoading.value = false
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadTaskAction();
	}
}

const stopTask = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.taskStop(row.id)
		tableLoading.value = false
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadTaskAction();
	}
}

const deleteTask = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		let res = await api.taskDelete(row.id)
		tableLoading.value = false
		$message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadTaskAction();
	}
}

const showEditView = async (row) => {
	try {
		tableLoading.value = true
		selectedUUUTalkAccountId.value = []
		let res = await api.taskGet(row.id)
		tableLoading.value = false
		task.value = res.data
		selectedUUUTalkAccountId.value.push(task.value.uuuTalkAccountId)
		showCreateView.value = true
		if (task.value.targetGroupList !== '' && task.value.targetGroupList !== '[]') {
			selectedUUUTalkChatList.value = eval(`(${task.value.targetGroupList})`)
			task.value.type = 0
		}
		if (task.value.targetUserList !== ''&& task.value.targetUserList !== '[]') {
			selectedUUUTalkChatList.value = eval(`(${task.value.targetUserList})`)
			task.value.type = 1
		}
		if (task.value.text !== ''&& task.value.text !== '[]') {
			taskTextArray.value = eval(`(${task.value.text})`)
		}
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
}

const detailsAction = async (row) => {
	try {
		tableLoading.value = true
		let res = await api.taskGet(row.id)
		task.value = res.data
		loadSendRecordAction()
		tableLoading.value = false
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
}

const loadSendRecordAction = async () => {
	let res = await api.sendRecordQuery({
		taskId: task.value.id,
		pageIndex: sendRecordPagination.page,
		pageSize: sendRecordPagination.pageSize,
	})
	sendRecordList.value = res.data ?? []
	sendRecordPagination.page = res.pageIndex
	sendRecordPagination.pageSize = res.pageSize
	sendRecordPagination.itemCount = res.totalRecords
	showTaskView.value = true
}

const startAll = async () => {
	if (!selectedTaskList || 0 === selectedTaskList.value.length) {
		$message.error('请选择任务')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedTaskList.value) {
		await startTask(item, false)
		i++
		progress.value = parseInt((i / selectedTaskList.value.length) * 100)
	}
	showProgress.value = false
	selectedTaskList.value = ref([])
	loadTaskAction();
}

const stopAll = async () => {
	if (!selectedTaskList || 0 === selectedTaskList.value.length) {
		$message.error('请选择任务')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedTaskList.value) {
		await stopTask(item, false)
		i++
		progress.value = parseInt((i / selectedTaskList.value.length) * 100)
	}
	showProgress.value = false
	selectedTaskList.value = ref([])
	loadTaskAction();
}

const deleteAll = async () => {
	if (!selectedTaskList || 0 === selectedTaskList.value.length) {
		$message.error('请选择任务')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedTaskList.value) {
		await deleteTask(item, false)
		i++
		progress.value = parseInt((i / selectedTaskList.value.length) * 100)
	}
	showProgress.value = false
	selectedTaskList.value = ref([])
	loadTaskAction();
}
</script>
  