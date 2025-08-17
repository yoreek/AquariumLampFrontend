<script setup lang="ts">
import { useDeviceStore } from '@/stores/device';
import { onMounted, ref } from "vue";

const deviceStore = useDeviceStore();
const refreshing = ref(false)

const refreshDeviceInfo = async () => {
  refreshing.value = true
  try {
    await deviceStore.getDeviceInfo()
  } catch (error) {
    console.error('Failed to refresh device info:', error)
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  try {
    await refreshDeviceInfo()
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
})
</script>

<template>
  <v-card class="pa-2" color="#16213e">
    <v-row>
      <v-col cols="6">
        <div class="text-white">Device IP:</div>
      </v-col>
      <v-col cols="6">
        <div :class="deviceStore.deviceInfo.connected ? 'text-success' : 'text-error'">
          {{ deviceStore.deviceInfo.ip || 'Not connected' }}
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <div class="text-white">Subnet Mask:</div>
      </v-col>
      <v-col cols="6">
        <div>{{ deviceStore.deviceInfo.subnet }}</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <div class="text-white">Gateway IP:</div>
      </v-col>
      <v-col cols="6">
        <div>{{ deviceStore.deviceInfo.gateway }}</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <div class="text-white">MAC Address:</div>
      </v-col>
      <v-col cols="6">
        <div>{{ deviceStore.deviceInfo.macAddress }}</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <div class="text-white">RSSI:</div>
      </v-col>
      <v-col cols="6">
        <div>{{ deviceStore.deviceInfo.rssi }}</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <div class="text-white">Firmware Version:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.firmware || 'Unknown' }}</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <div class="text-white">ReefDuino Version:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.reefduino || 'Unknown' }}</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <div class="text-white">Uptime:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.uptime || 'Unknown' }}</div>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6">
        <div class="text-white">Heap Size:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.heapSize }}</div>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6">
        <div class="text-white">Heap Usage:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.heapUsage }} %</div>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6">
        <div class="text-white">Max Free Block Size:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.maxFreeBlockSize }}</div>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6">
        <div class="text-white">Time:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.time }}</div>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6">
        <div class="text-white">Time Zone:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.timezone }}</div>
      </v-col>
    </v-row>

    <v-btn color="info" @click="refreshDeviceInfo" :loading="refreshing" block>
      Refresh Information
    </v-btn>
  </v-card>
</template>

<style scoped>

</style>