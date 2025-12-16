<template>
	<AppPage>
		<!-- <n-grid x-gap="12" :cols="2">
			<n-gi>
				<n-card title="第一步:添加UUUTalk账户">
					<template #cover>
						<iframe width="560" height="315" src="https://www.youtube.com/embed/W0LkLJ-fNJw?si=x0lTMZO3A_sc03gp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
					</template>
					该视频教程演示了如何添加UUUTalk账户
				</n-card>
			</n-gi>
			<n-gi>
				<n-card title="第二步:创建加群任务">
					<template #cover>
						<iframe width="560" height="315" src="https://www.youtube.com/embed/6nA_UHcfnbs?si=SU3jghpL_dz7zpHu" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
					</template>
					该视频教程演示了如何创建加群任务
				</n-card>
			</n-gi>
		</n-grid>
		<br/>
		<n-grid x-gap="12" :cols="2">
			<n-gi>
				<n-card title="第三步:创建群发任务">
					<template #cover>
						<iframe width="560" height="315" src="https://www.youtube.com/embed/6DlrTRJ8tGs?si=a0p4tjMCga79d0rX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
					</template>
					该视频教程演示了如何创建群发任务
				</n-card>
			</n-gi>
		</n-grid> -->
	</AppPage>
</template>

<style scoped>
.n-card {
  max-width: 560px;
}
</style>

<script setup>
import { h, defineComponent, ref, onMounted, reactive } from "vue";
import { NTag, NButton } from 'naive-ui'
import { utils, writeFile } from 'xlsx'

onMounted(
	() => {}
)

</script>
