<template>
  <AppProvider>
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
    <n-watermark
      content="云控群发"
      cross
      fullscreen
      :font-size="22"
      :line-height="22"
      :width="384"
      :height="384"
      :x-offset="12"
      :y-offset="60"
      :rotate="-15"
    />
  </AppProvider>
</template>

<script setup>
import AppProvider from '@/components/common/AppProvider.vue'
import { onMounted } from "vue";
import { useRouter } from 'vue-router'

onMounted(
	() => {
		loadInviteCode()
	}
)

const getQueryVariable = (variable) => {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

const loadInviteCode = async () => {
  let inviteCode = getQueryVariable('inviteCode')
  if (inviteCode) {
    localStorage.setItem('inviteCode', inviteCode)
  }
}
</script>
