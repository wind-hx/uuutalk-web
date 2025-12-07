<template>
	<AppPage>
		<n-card style="margin-bottom: 16px;">
			<n-button ghost mr-16 @click="showCreateView = true">
				创建任务
			</n-button>
			<n-button type="primary" ghost mr-16 @click="startAll">
				一键启动
			</n-button>
			<n-button type="info" ghost mr-16 @click="stopAll">
				一键停止
			</n-button>
      <n-button type="error" ghost mr-16 @click="deleteAll">
				一键删除
			</n-button>
		</n-card>
		<n-data-table 
			:columns="columns" 
			:data="inviteTaskList" 
			:max-height="480"
			:scroll-x="1800" 
			:loading="tableLoading"
			:row-key="(row) => row"
			v-model:checked-row-keys="selectedInviteTaskList" />

		<n-drawer v-model:show="showCreateView" :width="520">
			<n-drawer-content closable>
				<template #header>
					创建任务
				</template>
				<template #default>
					<n-form ref="createFormRef" :model="inviteTask" label-position="top" label-width="auto">
						<n-form-item label="Yuni账户" prop="tgAccountId">
							<n-select placeholder="请选择与你账户" v-model:value="selectedYuniAccountId" :options="yuniAccountList" @update:value="handleUpdateYuniAccount" />
						</n-form-item>
            <n-form-item label="选择群组" prop="id">
              <n-input-group>
								<n-input-number :min="1" placeholder="数量" v-model:value="yuniChatCount" style="width: 160px;" @update:value="updateYuniChatCount" clearable />
								<n-select 
                multiple
                clearable
								placeholder="请选择群组" 
								v-model:value="selectedYuniChat" 
								label-field="title" 
								value-field="id"
                @update:value="updateSelectedYuniChat"
								:options="yuniChatList" />
							</n-input-group>
						</n-form-item>
            <n-form-item label="邀请间隔" prop="timeSpacing" required :validation-status="timeSpacingValidationStatus">
							<n-input-group>
								<n-select style="width: 160px" v-model:value="inviteTask.timeUnit" placeholder="请选择" :options="timeUnitList">
								</n-select>
								<n-input-number style="width: 100%;" :min="1" :max="600" placeholder="请输入消息间隔" v-model:value="timeSpacingStart" clearable @update:value="handleTimeSpacingChange" />
								<span lh-34 pl-12 pr-12>～</span>
								<n-input-number style="width: 100%;" :min="timeSpacingStart" :max="600" placeholder="请输入消息间隔" v-model:value="timeSpacingEnd" clearable />
							</n-input-group>
							<template #feedback>
								{{ timeSpacingFeedback }}
							</template>
						</n-form-item>
						<n-form-item label="每次执行邀请数量" prop="total" required>
							<n-input-number style="width: 100%;" :min="1" :max="3" placeholder="每次执行加群数量" v-model:value="inviteTask.limit" clearable />
						</n-form-item>
            <n-button type="success" ghost @click="showInviteUserViewAction">
							选择目标
						</n-button>
						<br/><br/>
						<n-data-table
							:columns="selectedFriendColumns"
							:data="selectedFriendList"/>
					</n-form>
				</template>
				<template #footer>
					<n-button mr-16 @click="showCreateView = false">取消</n-button>
					<n-button :loading="submitLoading" type="success" ghost @click="saveInviteTaskAction">保存</n-button>
				</template>
			</n-drawer-content>
      <n-drawer v-model:show="showInviteUserView" :width="320">
				<n-drawer-content title="对话框列表">
					<n-data-table
						:columns="friendColumns"
						:data="friendList"
						:row-key="(row) => row"
						@update:checked-row-keys="handleYuniFriendCheck"/>
				</n-drawer-content>
			</n-drawer>
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

		<n-drawer v-model:show="showInviteTaskView" :width="860">
			<n-drawer-content closable>
				<template #header>
					任务详情
				</template>
				<template #default>
					<n-descriptions label-placement="top" bordered :column="2">
						<n-descriptions-item label="间隔时间">
							<n-tag v-if="'s' === selectedInviteTask.timeUnit" size="small" type="info">{{ JSON.parse(selectedInviteTask.timeSpacingList).join('~') + ' 秒' }}</n-tag>
							<n-tag v-if="'m' === selectedInviteTask.timeUnit" size="small" type="info">{{ JSON.parse(selectedInviteTask.timeSpacingList).join('~') + ' 分' }}</n-tag>
							<n-tag v-if="'h' === selectedInviteTask.timeUnit" size="small" type="info">{{ JSON.parse(selectedInviteTask.timeSpacingList).join('~') + ' 时' }}</n-tag>
						</n-descriptions-item>
						<n-descriptions-item label="状态">
							<n-tag v-if="0 === selectedInviteTask.status" size="small" type="warning">未启动</n-tag>
							<n-tag v-if="1 === selectedInviteTask.status" size="small" type="success">运行中</n-tag>
							<n-tag v-if="2 === selectedInviteTask.status" size="small">完成</n-tag>
							<n-tag v-if="3 === selectedInviteTask.status" size="small" type="error">终止</n-tag>
						</n-descriptions-item>
					</n-descriptions>

					<n-data-table :remote="true" style="margin-top: 16px;" :columns="inviteDetailsColumns" :data="selectedInviteTask.details"
						:pagination="inviteDetailsPagination" :max-height="480" :loading="tableLoading"
						:on-update:page="inviteDetailsTablePageChange" />
				</template>
				<template #footer>
					<n-button mr-16 @click="showInviteTaskView = false">取消</n-button>
				</template>
			</n-drawer-content>
		</n-drawer>
	</AppPage>
</template>
  
<script setup>
import { h, defineComponent, ref, onMounted, reactive } from "vue";
import { NTag, NButton, NEllipsis } from 'naive-ui'
import api from './api'
import { timeUnitList } from './data'

const columns = ref([
  {
    type: "selection",
    fixed: "left"
  },
  {
    title: '昵称',
    key: "nickname",
    width: 160,
  },
  {
    title: '手机号',
    key: "phone",
    width: 160,
  },
  {
    title: '间隔时间',
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
        );
      }
      if ('m' === row.timeUnit) {
        return h(
          NTag,
          {
            size: 'small',
            type: 'info'
          },
          { default: () => JSON.parse(row.timeSpacingList).join('~') + ' 分' }
        );
      }
      if ('h' === row.timeUnit) {
        return h(
          NTag,
          {
            size: 'small',
            type: 'info'
          },
          { default: () => JSON.parse(row.timeSpacingList).join('~') + ' 时' }
        );
      }
    }
  },
  {
    title: '每次执行邀请数量 ',
    key: "status",
    width: 120,
    render(row) {
      if (!row.limit) {
        return h(
          NTag,
          {
            size: 'small',
            type: 'error'
          },
          { default: () => '无' }
        );
      } else {
        return h(
          NTag,
          {
            size: 'small',
            type: 'success'
          },
          { default: () => row.limit }
        );
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
        );
      } 
      if (1 === row.status) {
        return h(
          NTag,
          {
            size: 'small',
            type: 'success'
          },
          { default: () => '运行中' }
        );
      }
      if (2 === row.status) {
        return h(
          NTag,
          {
            size: 'small',
          },
          { default: () => '完成' }
        );
      }
      if (3 === row.status) {
        return h(
          NTag,
          {
            size: 'small',
            type: 'error'
          },
          { default: () => '终止' }
        );
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
        { default: () => row.successTotal }
      );
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
        { default: () => row.failTotal }
      );
    }
  },
  {
    title: '操作',
    key: "action",
    width: 160,
    fixed: "right",
    render(row) {
      let btnList = [];
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
      );
      if (0 === row.status) {
        btnList.push(
          h(
            NButton,
            {
              style: 'margin-right: 16px',
              size: 'small',
              type: 'success',
              onClick: () => startAction(row)
            },
            { default: () => '启动' }
          )
        );
      }
      if (1 === row.status) {
        btnList.push(
          h(
            NButton,
            {
              style: 'margin-right: 16px',
              size: 'small',
              type: 'error',
              onClick: () => stopAction(row)
            },
            { default: () => '停止' }
          )
        );
      }
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
      return btnList;
    }
  }
]);

const inviteDetailsColumns = ref([
  {
    title: '群组标题',
    key: "yuniGroupTitle",
    width: 160,
  },
  {
    title: '邀请状态',
    key: "status",
    width: 90,
    render(row) {
      if (0 === row.status) {
        return h(
          NTag,
          {
            size: 'small',
            type: 'warning'
          },
          { default: () => '未执行' } // 未执行
        )
      }
      if (1 === row.status) {
        return h(
          NTag,
          {
            size: 'small',
            type: 'success'
          },
          { default: () => '成功' } // 成功
        )
      }
      if (2 === row.status) {
        return h(
          NTag,
          {
            size: 'small',
            type: 'error'
          },
          { default: () => '失败' } // 失败
        )
      }
    }
  },
  {
    title: '用户名称',
    key: "title",
    width: 160,
  },
  {
    title: '失败原因',
    key: "result",
    width: 180,
    render(row) {
      return h(
        NEllipsis,
        {},
        { default: () => row.result === '' ? '--' : row.result }
      )
    }
  },
  {
    title: '邀请时间',
    key: "inviteTime",
    width: 120,
  },
]);

const selectedFriendColumns = ref([
	{
		title: '用户昵称',
		key: "title",
		width: 160,
	},
]);

const friendColumns = ref([
	{
		type: "selection",
		fixed: "left"
	},
	{
		title: "用户昵称",
		key: "title",
		width: 160,
	},
]);

const selectedYuniAccountId = ref([]);
const selectedYuniChat = ref([]);
const selectedFriendList = ref([]);
const friendList = ref([]);
const inviteTaskList = ref([]);
const yuniAccountList = ref([]);
const selectedInviteTaskList = ref([])
const yuniChatCount = ref(null)
const yuniChatList = ref([]);
const showInviteUserView = ref(false);
const showCreateView = ref(false);
const inviteDetailsPagination = reactive({ pageSize: 20, page: 1, itemCount: 0, param: null });
const submitLoading = ref(false);
const tableLoading = ref(false);
const showProgress = ref(false);
const showInviteTaskView = ref(false);
const progress = ref(0)
const timeSpacingFeedback = ref('')
const timeSpacingStart = ref(1)
const timeSpacingEnd = ref(1)
const targetUsernameList = ref('')
const inviteTask = ref({
	timeUnit: 'm',
	limit: 3,
})
const selectedInviteTask = ref({
	details: [],
})

onMounted(
	() => {
    loadYuniAccountAction()
		loadInviteTaskAction()
	}
)

const loadYuniAccountAction = async () => {
	let result = await api.yuniAccountList()
	let temp = []
	for (let item of result.data) {
		if (item.remark && '' != item.remark) {
			item.label = `${item.nickname} (${item.remark})`
		} else {
			item.label = `${item.nickname}`
		}
		item.value = item.id
		item.disabled = null != item.taskId && 0 != item.taskId
		temp.push(item)
	}
	yuniAccountList.value = temp
}

const handleTimeSpacingChange = (number) => {
	if (timeSpacingEnd.value < number) {
		timeSpacingEnd.value = number;
	}
}

const loadInviteTaskAction = async () => {
	tableLoading.value = true
	let result = await api.inviteTaskList({})
	result.data = result.data ?? []
	tableLoading.value = false
	inviteTaskList.value = result.data
}

const handleUpdateYuniAccount = async (value, option) => {
  yuniChatList.value = []
  selectedYuniChat.value = null
  let result = await api.tgChatQuerySelfGroup({
		yuniAccountId: value,
	})
	yuniChatList.value = result.data
}

const updateYuniChatCount = async (value, option) => {
  if (value > 0 && yuniChatList.value.length > 0) {
    if (value > yuniChatList.value.length) {
      value = yuniChatList.value.length
      yuniChatCount.value = yuniChatList.value.length
    }
    selectedYuniChat.value = []
    for (let i = 0; i < value; i++) {
      selectedYuniChat.value.push(yuniChatList.value[i].id)
    }
  } else {
    selectedYuniChat.value = []
  }
}

const updateSelectedYuniChat = async (value, option) => {
  yuniChatCount.value = value.length
}

const getSelectedYuniGroup = () => {
  return yuniChatList.value.filter(item => selectedYuniChat.value.includes(item.id));
}

const showInviteUserViewAction = async () => {
	if (null == selectedYuniAccountId.value || 0 === selectedYuniAccountId.value.length) {
		$message.error('请选择账户')
		return
	}
	friendList.value = []
	const res = await api.tgChatQuerySelfFriend({
		yuniAccountId: selectedYuniAccountId.value,
	})
	friendList.value = res.data
	showInviteUserView.value = true
}

const handleYuniFriendCheck = async(rowKeys) => {
	selectedFriendList.value = rowKeys
}

const saveInviteTaskAction = async () => {
	if (null == selectedYuniAccountId.value || 0 === selectedYuniAccountId.value.length) {
		$message.error('请选择账户')
		return
	}
	if (null === selectedYuniChat.value || 0 === selectedYuniChat.value.length) {
		$message.error('请选择群组')
		return
	}
  if (null === selectedFriendList.value || 0 === selectedFriendList.value.length ) {
    $message.error('请选择目标用户')
		return
  }
  let timeSpacingList = JSON.stringify([parseInt(timeSpacingStart.value), parseInt(timeSpacingEnd.value)])
	submitLoading.value = true
  let selectedGroup = getSelectedYuniGroup()
	try {
    await api.inviteTaskSave({
      yuniAccountId: selectedYuniAccountId.value,
      yuniGroupList: JSON.stringify(selectedGroup),
      targetList: JSON.stringify(selectedFriendList.value),
      timeUnit: inviteTask.value.timeUnit,
      timeSpacingList: timeSpacingList,
      limit: inviteTask.value.limit,
    })
  } catch (error) {}
  submitLoading.value = false
  showCreateView.value = false
	loadInviteTaskAction()
  $message.success('操作成功')
}

const startAction = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		await api.inviteTaskStart(row.id)
		tableLoading.value = false
    $message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadInviteTaskAction()
	}
}

const stopAction = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		await api.inviteTaskStop(row.id)
		tableLoading.value = false
    $message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadInviteTaskAction()
	}
}

const deleteTask = async (row, refresh = true) => {
	try {
		tableLoading.value = true
		await api.inviteTaskDelete(row.id)
		tableLoading.value = false
    $message.success('操作成功')
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
	if (refresh) {
		loadInviteTaskAction()
	}
}

const detailsAction = async (row) => {
	selectedInviteTask.value = row
	try {
		tableLoading.value = true
		let res = await api.inviteTaskDetails({
			id: row.id,
			pageIndex: inviteDetailsPagination.page,
			pageSize: inviteDetailsPagination.pageSize
		})
		tableLoading.value = false
		selectedInviteTask.value.details = res.data ?? []
		inviteDetailsPagination.page = res.pageIndex
		inviteDetailsPagination.pageSize = res.pageSize
		inviteDetailsPagination.itemCount = res.totalRecords
		inviteDetailsPagination.param = row
		showInviteTaskView.value = true
	} catch (error) {
		tableLoading.value = false
		console.error(error)
	}
}

const inviteDetailsTablePageChange = async (page) => {
	inviteDetailsPagination.page = page
	detailsAction(inviteDetailsPagination.param)
}


const startAll = async () => {
	if (!selectedInviteTaskList || 0 === selectedInviteTaskList.value.length) {
		$message.error('请选择任务')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedInviteTaskList.value) {
		await startAction(item, false)
		i++
		progress.value = parseInt((i / selectedInviteTaskList.value.length) * 100)
	}
	showProgress.value = false
	selectedInviteTaskList.value = ref([])
	loadInviteTaskAction();
}

const stopAll = async () => {
	if (!selectedInviteTaskList || 0 === selectedInviteTaskList.value.length) {
		$message.error('请选择任务')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedInviteTaskList.value) {
		await stopAction(item, false)
		i++
		progress.value = parseInt((i / selectedInviteTaskList.value.length) * 100)
	}
	showProgress.value = false
	selectedInviteTaskList.value = ref([])
	loadInviteTaskAction();
}

const deleteAll = async () => {
	if (!selectedInviteTaskList || 0 === selectedInviteTaskList.value.length) {
		$message.error('请选择任务')
		return
	}
	progress.value = 0
	showProgress.value = true
	let i = 0
	for (let item of selectedInviteTaskList.value) {
		await deleteTask(item, false)
		i++
		progress.value = parseInt((i / selectedInviteTaskList.value.length) * 100)
	}
	showProgress.value = false
	selectedInviteTaskList.value = ref([])
	loadInviteTaskAction();
}


</script>
  