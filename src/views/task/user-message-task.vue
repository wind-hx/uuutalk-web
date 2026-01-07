<template>
	<AppPage>
		<n-card style="margin-bottom: 16px;">
			<n-flex>
				<n-button ghost @click="openCreateTaskView">
					添加群发任务
				</n-button>
				<n-button type="primary" ghost @click="startAll">
					一键启动
				</n-button>
				<n-button type="info" ghost @click="stopAll">
					一键停止
				</n-button>
				<n-button type="error" ghost @click="deleteAll">
					删除
				</n-button>
			</n-flex>
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
					{{ taskViewTitle }}
				</template>
				<template #default>
					<n-form ref="createFormRef" :model="task" label-position="top" label-width="auto">
						<n-form-item label="UUUTalk账户" prop="uuuTalkAccountId" required>
							<n-select 
								multiple 
								filterable
								:disabled="taskViewTitle !== '添加群发任务'"
								placeholder="请选择UUUTalk账户" 
								v-model:value="selectedUUUTalkAccountId" 
								:on-blur="changeUUUTalkAccount"
								:options="uuuTalkAccountList" />
							<div style="padding-left: 8px;"></div>
							<n-button :disabled="taskViewTitle !== '添加群发任务'" @click="checkAll">全选</n-button>
						</n-form-item>
						<n-form-item label="消息类型" prop="messageType">
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
						<div v-for="(item, index) in taskTextArray" :key="index">
							<n-form-item :label="`消息内容${index + 1}`" prop="text" v-if="task.messageType == 0">
								<n-input placeholder="请输入任务内容" v-model:value="taskTextArray[index]" type="textarea"></n-input>
							</n-form-item>
						</div>
						<n-button type="info" ghost @click="addTaskTextAction" v-if="task.messageType === 0" mr-16>多条消息</n-button>
						<n-button type="error" ghost @click="deleteTaskTextAction" v-if="task.messageType === 0">删除消息</n-button>
						<br v-if="task.messageType === 0" /><br v-if="task.messageType === 0" />
						<n-form-item label="消息图片" prop="text" v-if="task.messageType == 1">
							<n-upload
								v-if="!task.imageUrl"
								ref="uploadRef"
								accept=".jpeg,.jpg,.png"
								multiple
								directory-dnd
								@finish="uploadFinish"
								@remove="uploadRemove"
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
								<n-select style="width: 160px" v-model:value="task.timeUnit" placeholder="请选择" :options="timeUnitList">
								</n-select>
								<n-input-number style="width: 100%;" :min="1" :max="1000" placeholder="请输入消息间隔" v-model:value="timeSpacingStart" clearable @update:value="handleTimeSpacingChange" />
								<span lh-34 pl-12 pr-12>～</span>
								<n-input-number style="width: 100%;" :min="timeSpacingStart" :max="1000" placeholder="请输入消息间隔" v-model:value="timeSpacingEnd" clearable />
							</n-input-group>
							<template #feedback>
								{{ timeSpacingFeedback }}
							</template>
						</n-form-item>
						<n-form-item label="分配策略" prop="allocationStrategy">
							<n-radio-group
								v-model:value="task.allocationStrategy"
								name="left-size"
								style="margin-bottom: 12px">
								<n-radio-button :value="1">
									一致
								</n-radio-button>
								<n-radio-button :value="2">
									平均
								</n-radio-button>
							</n-radio-group>
						</n-form-item>
						<p style="font-size: 14px;">辅助选项</p>
						<n-checkbox v-model:checked="task.hasTail">
							消息结尾是否携带随机表情
						</n-checkbox>
						<br /><br />
						<span style="color: red; font-size: 14px;">[数据逗号分隔","不用换行]</span>
						<n-input
							v-model:value="targetListText"
							type="textarea"
							placeholder="请输入要发送的用户UID"/>
					</n-form>
				</template>
				<template #footer>
					<n-button mr-16 @click="showCreateView = false">取消</n-button>
					<n-button :loading="submitLoading" type="success" ghost @click="saveTaskAction">保存</n-button>
				</template>
			</n-drawer-content>
		</n-drawer>

		<n-drawer v-model:show="showTaskView" :width="860">
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
							{{ getMessageText(task) }}
						</n-descriptions-item>
					</n-descriptions>

					<n-data-table 
						:remote="true" 
						:columns="sendRecordColumns" 
						:data="sendRecordList" 
						:pagination="sendRecordPagination" 
						:max-height="480" 
						:loading="detailsTableLoading" 
						:on-update:page="sendRecordTablePageChange"
						:row-key="(row) => row" />
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
import { h, ref, onMounted, reactive, computed } from "vue";
import { NTag, NButton, NEllipsis, NInput, NText, NProgress } from 'naive-ui'
import api from './api'
import { timeUnitList } from './data'
import { getToken, calcCompletionPercent } from '@/utils'

const columns = ref([
	{
		type: "selection",
		fixed: "left"
	},
	{
		title: '所属账户',
		key: "nickname",
		width: 140,
	},
	{
		title: '任务名称',
		key: "title",
		width: 120,
	},
	{
		title: '进度',
		key: "progress",
		width: 100,
		render(row) {
			return h(
				NProgress,
				{
					type: 'line',
					'indicator-placement': 'inside',
    				processing: row.status === 1,
					status: 'info',
					percentage: calcCompletionPercent(row)
				},
			)
		}
	},
	{
		title: '任务内容',
		key: "text",
		width: 120,
		render(row) {
			return h(
				NEllipsis,
				{  },
				{ default: () => getMessageText(row) }
			)
		}
	},
	{
		title: '时间间隔',
		key: "timeSpacing",
		width: 120,
		render(row) {
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
		title: '状态',
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
		title: '成功数量',
		key: "successTotal",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'success'
				},
				{ default: () => row.successTotal + '-' + row.daySuccessTotal }
			)
		}
	},
	{
		title: '失败数量',
		key: "failTotal",
		width: 100,
		render(row) {
			return h(
				NTag,
				{
					size: 'small',
					type: 'error'
				},
				{ default: () => row.failTotal + '-' + row.dayFailTotal }
			)
		}
	},
	{
		title: '添加时间',
		key: "gmtCreated",
		width: 120,
	},
	{
		title: '操作',
		key: "action",
		width: 220,
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
			if (3 === row.status) {
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

const sendRecordColumns = ref([
	{
		title: '执行人',
		key: "title",
		width: 160,
		render(row) {
			if (row.senderLastName) {
				return row.senderFirstName + '-' + row.senderLastName;
			} else {
				return row.senderFirstName;
			}
		}
	},
	{
		title: '发送目标',
		key: "target",
		width: 160,
	},
	{
		title: '状态',
		key: "status",
		width: 90,
		render(row) {
			if (row.status === 0) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'warning'
					},
					{ default: () => '未执行' }
				)
			}
			if (row.status === 1) {
				return h(
					NTag,
					{
						size: 'small',
						type: 'success'
					},
					{ default: () => '成功' }
				)
			}
			if (row.status === 2) {
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
		title: '失败原因',
		key: "result",
		width: 180,
		render(row) {
			return h(
				NEllipsis,
				{  },
				{ default: row.result }
			)
		}
	},
	{
		title: '发送时间',
		key: "sendTime",
		width: 120,
		render(row) {
			if (row.sendTime === '0001-01-01 00:00:00') {
				return '未执行';
			}
			return row.sendTime;
		}
	},
]);

const uuuTalkAccountList = ref([]);

const task = ref({
	id: null,
	uuuTalkAccountId: null,
	title: '',
	text: null,
	imageUrl: null,
	total: null,
	messageType: 0,
	timeUnit: 's',
	limit: 0,
	hasTail: false,

	allocationStrategy: 1 // 1、一致 2、平均
});
const taskTextArray = ref([
	'',
]);
const selectedUUUTalkAccountId = ref([]);
const taskList = ref([]);
const taskPagination = reactive({ pageSize: 20, page: 1, itemCount: 0 });
const sendRecordList = ref([]);
const sendRecordPagination = reactive({ pageSize: 20, page: 1, itemCount: 0 });
const targetListText = ref('');
const selectedTgChatList = ref([]);
const selectedTaskList = ref([]);
const showCreateView = ref(false);
const showTaskView = ref(false);
const showProgress = ref(false);
const submitLoading = ref(false);
const tableLoading = ref(false);
const detailsTableLoading = ref(false);
const uploadUrl = ref(`${import.meta.env.VITE_BASE_API}/v1/upload`)
const uploadHeaders = ref({})
const uploadRef = ref(null)
const progress = ref(0)
const timeSpacingFeedback = ref('')
const timeSpacingStart = ref(1)
const timeSpacingEnd = ref(1)
const taskExecutionTimeStart = ref('00:00:00')
const taskExecutionTimeEnd = ref('23:59:59')
const taskViewTitle = ref('添加群发任务')

onMounted(
	() => {
		uploadHeaders.value = {
			Authorization: getToken(),
		}
		loadUUUTalkAccountAction()
		loadTaskAction()
	}
)

const openCreateTaskView = () => {
	taskViewTitle.value = '添加群发任务'
	uploadRef.value?.clear();
	showCreateView.value = true; 
	selectedTgChatList.value = [];
	task.value.id = undefined;
	task.value.title = undefined;
	task.value.text = undefined,
	task.value.imageUrl = undefined;
	task.value.total = 10000000;
	task.value.messageType = 0;
	task.value.timeUnit = 's';
	task.value.limit = 0;
	task.value.hasTail = false;
	task.value.targetList = '[]';
	task.value.allocationStrategy = 1;
	targetListText.value = '';
	taskTextArray.value = [''];
	selectedUUUTalkAccountId.value = [];
	taskExecutionTimeStart.value = '00:00:00'
	taskExecutionTimeEnd.value = '23:59:59'
}

const checkAll = async () => {
	selectedUUUTalkAccountId.value = [];
	for (let item of uuuTalkAccountList.value) {
		if (item.status) {
			selectedUUUTalkAccountId.value.push(item.id)
		}
	}
}

const loadUUUTalkAccountAction = async () => {
	let result = await api.accountList()
	result.data = result.data ?? []
	let temp = []
	for (let item of result.data) {
		item.label = item.nickname
		item.value = item.id
		item.disabled = null != item.taskId && 0 != item.taskId
		temp.push(item)
	}
	uuuTalkAccountList.value = temp
}

const getUUUTalkAccountById = (id) => {
	for (let item of uuuTalkAccountList.value) {
		if (item.id === id) {
			return item
		}
	}
	return null;
}

const getMessageText = (row) => {
	if (row.messageType === 0) {
		return row.text;
	}
	if (row.messageType === 1) {
		return row.imageUrl;
	}
	return '--';
}

const loadTaskAction = async () => {
	tableLoading.value = true
	let result = await api.userMessageTaskList({
		pageIndex: taskPagination.page,
		pageSize: taskPagination.pageSize,
	})
	tableLoading.value = false
	taskList.value = result.data ?? []
	taskPagination.pageSize = 20
	taskPagination.page = result.pageIndex
	taskPagination.itemCount = result.totalRecords
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

const uploadFinish = ({ file, event}) => {
	if (event && event.target && event.target.response) {
		let resp = JSON.parse(event.target.response)
		task.value.imageUrl = resp.data
	}
    return file;
};

const uploadRemove = (file, fileList, index) => {
	task.value.imageUrl = ''
	return true;
};

const handleTimeSpacingChange = (number) => {
	if (timeSpacingEnd.value < number) {
		timeSpacingEnd.value = number;
	}
}

const taskExecutionTimeStartConfirm = (value, formattedValue) => {
	taskExecutionTimeStart.value = formattedValue
}

const taskExecutionTimeEndConfirm = (value, formattedValue) => {
	taskExecutionTimeEnd.value = formattedValue
}

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

const parseTargetList = (input) => {
  return input
    // 替换中文逗号为英文逗号
    .replace(/，/g, ',')
    // 统一分隔符为英文逗号（支持 \n、\r\n、空格、Tab）
    .replace(/[\s,]+/g, ',')
    // 分割成数组
    .split(',')
    // 去掉空格和 @
    .map(s => s.trim().replace(/^@/, ''))
    // 过滤非法用户名（仅允许字母、数字、下划线）
    .filter(s => s && /^[a-zA-Z0-9_]+$/.test(s))
    // 映射成对象
    .map(s => ({
      ext: '{}',
      target: s,
    }));
}

const extractUsernameOrPhone = (data) => {
  return data
    .map(item => item.target)
    .filter(Boolean)
    .join(',');
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
		let newTextList = [];
		for (let item of taskTextArray.value) {
			if (item) {
				newTextList.push(item)
			}
		}
		task.value.text = JSON.stringify(newTextList)
    }
	if (1 === task.value.messageType && !task.value.imageUrl) {
        $message.error('请上传图片')
		return
    }
	if (task.value.total <= 0) {
		$message.error('请输入有效的消息总数')
		return
    }
	if ('' === targetListText.value) {
		$message.error('请输入要发送的UID')
		return
	}
	if (1 == selectedUUUTalkAccountId.value.length) {
		task.value.uuuTalkAccountId = selectedUUUTalkAccountId.value[0]
		task.value.timeSpacingList = JSON.stringify([parseInt(timeSpacingStart.value), parseInt(timeSpacingEnd.value)])
		task.value.executionTimeRange = JSON.stringify([taskExecutionTimeStart.value, taskExecutionTimeEnd.value])
		let targetList = parseTargetList(targetListText.value)
		task.value.targetList = JSON.stringify(targetList)
		task.value.total = targetList.length

		try {
			if (task.value.id) {
				await api.userMessageTaskUpdate(task.value)
			} else {
				await api.userMessageTaskSave(task.value)
			}
			$message.success('操作成功')
		} catch (error) {}
		showCreateView.value = false
		loadTaskAction()
	} else {
		let allUsernameList = parseTargetList(targetListText.value)
		let usernameMap = {}
		for (let i = 0; i < allUsernameList.length; i++) {
			if (!usernameMap[i % allUsernameList.length]) {
				usernameMap[i % allUsernameList.length] = []
			}
			usernameMap[i % selectedUUUTalkAccountId.value.length].push(allUsernameList[i])
		}
		progress.value = 0
		showProgress.value = true
		let i = 0
		for (let [index, item] of selectedUUUTalkAccountId.value.entries()) {
			let result = []
			task.value.title = `批量创建任务: ${getUUUTalkAccountById(item).phone}`
			task.value.uuuTalkAccountId = item
			task.value.timeSpacingList = JSON.stringify([parseInt(timeSpacingStart.value), parseInt(timeSpacingEnd.value)])
			task.value.executionTimeRange = JSON.stringify([taskExecutionTimeStart.value, taskExecutionTimeEnd.value])
			if (task.value.allocationStrategy === 1) {
				task.value.targetList = JSON.stringify(allUsernameList)
				task.value.total = allUsernameList.length
			}
			if (task.value.allocationStrategy === 2) {
				task.value.targetList = JSON.stringify(usernameMap[index])
				task.value.total = usernameMap[index].length
			}
			try {
				await api.userMessageTaskSave(task.value)
				$message.success('操作成功')	
			} catch (error) {}
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
		let res = await api.userMessageTaskStart(row.id)
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
		let res = await api.userMessageTaskStop(row.id)
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
		let res = await api.userMessageTaskDelete(row.id)
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
		taskViewTitle.value = '修改群发任务'
		tableLoading.value = true
		selectedUUUTalkAccountId.value = []
		let res = await api.userMessageTaskGet(row.id)
		tableLoading.value = false
		task.value = res.data
		if (task.value.text) {
			taskTextArray.value = eval(`(${task.value.text})`)
		} else {
			taskTextArray.value = []
		}
		selectedUUUTalkAccountId.value.push(task.value.uuuTalkAccountId)
		showCreateView.value = true
		if (task.value.targetList !== ''&& task.value.targetList !== '[]') {
			targetListText.value = extractUsernameOrPhone(eval(`(${task.value.targetList})`))
		}
		if (task.value.text !== ''&& task.value.text !== '[]') {
			taskTextArray.value = eval(`(${task.value.text})`)
		} else {
			taskTextArray.value = ['']
		}
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
}

const detailsAction = async (row) => {
	try {
		sendRecordPagination.page = 1
		tableLoading.value = true
		let res = await api.userMessageTaskGet(row.id)
		task.value = res.data
		loadSendRecordAction()
		tableLoading.value = false
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
}

const loadSendRecordAction = async () => {
	detailsTableLoading.value = true
	let res = await api.userMessageTaskSendRecordQuery({
		taskId: task.value.id,
		pageIndex: sendRecordPagination.page,
		pageSize: sendRecordPagination.pageSize,
	})
	detailsTableLoading.value = false
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
  
