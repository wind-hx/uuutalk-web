<template>
  <n-select
      mr-24
      v-model:value="selectedValue"
      filterable
      placeholder="请选择账户"
      :options="tgAccountList"
  />
  <n-icon mr20 size="20" cursor-pointer @click="refresh">
    <icon-mdi:refresh />
  </n-icon>
</template>

<script setup>
import { useUserStore } from '@/store'
import { h, defineComponent, ref, onMounted, reactive, onUnmounted } from "vue";
import api from '../../../../views/yuni-account/api'

const tgAccountList = ref([]);
const selectedValue = ref();

onMounted(
	() => {
		loadTgAccountAction()
	}
)

const refresh = async () => {
  loadTgAccountAction();
  $message.success('操作成功')
}

const loadTgAccountAction = async () => {
	let result = await api.list()
  result.data = result.data ?? []
  let temp = []
	for (let item of result.data) {
		item.label = item.firstName
		item.value = item.id
		item.disabled = !item.status
		temp.push(item)
	}
	tgAccountList.value = temp
}

</script>
