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
        <div class="text-success">{{ deviceStore.deviceInfo.subnet }}</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <div class="text-white">Gateway IP:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.gateway }}</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <div class="text-white">MAC Address:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.macAddress }}</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <div class="text-white">Signal Strength (RSSI):</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.rssi }} <span class="text-secondary">dBm</span></div>
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
        <div class="text-success">{{ deviceStore.deviceInfo.uptime }}</div>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6">
        <div class="text-white">Heap Size:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.heapSize }} <span class="text-secondary">Bytes</span></div>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6">
        <div class="text-white">Heap Usage:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.heapUsage }} <span class="text-secondary">%</span></div>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6">
        <div class="text-white">Max Free Block Size:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">{{ deviceStore.deviceInfo.maxFreeBlockSize }} <span class="text-secondary">Bytes</span></div>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6">
        <div class="text-white">Time:</div>
      </v-col>
      <v-col cols="6">
        <div class="text-success">
          <div>{{ new Date(deviceStore.deviceInfo.time).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) }}</div>
          <div>{{ new Date(deviceStore.deviceInfo.time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
          }) }}</div>
        </div>
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