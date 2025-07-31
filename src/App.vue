<template>
  <v-app theme="dark">
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'

const appStore = useAppStore()

onMounted(() => {
  appStore.initializeApp()
})
</script>

<style>
.v-application {
  background: #1a1a2e !important;
}
</style>
