<script setup lang="ts">
import { ref } from 'vue'
import { useDeviceStore } from '@/stores/device';
import { apiBaseUrl } from '@/utils/api';

const deviceStore = useDeviceStore();
const rebooting = ref(false)
const resetting = ref(false)
const showFactoryResetConfirmDialog = ref(false)

const rebootDevice = async () => {
  rebooting.value = true
  try {
    await deviceStore.rebootDevice()
  } catch (error) {
    console.error('Failed to reboot device:', error)
  } finally {
    rebooting.value = false
  }
}

const factoryReset = async () => {
  resetting.value = true
  try {
    await deviceStore.factoryReset()
  } catch (error) {
    console.error('Failed to reset device:', error)
  } finally {
    resetting.value = false
  }
}

const confirmFactoryReset = async () => {
  showFactoryResetConfirmDialog.value = false
  resetting.value = true
  try {
    await factoryReset()
  } catch (error) {
    console.error('Failed to reset device:', error)
  } finally {
    resetting.value = false
  }
}
</script>

<template>
  <v-card class="pa-2" color="#16213e">
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="text-white mb-2">Current API Endpoint:</div>
        <div class="text-success">{{ apiBaseUrl }}</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-btn color="warning" @click="rebootDevice" :loading="rebooting" block>
          Reboot Device
        </v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn color="warning" @click="showFactoryResetConfirmDialog = true" :loading="resetting" block>
          Factory Reset
        </v-btn>
      </v-col>
    </v-row>
    <v-dialog v-model="showFactoryResetConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Factory Reset</v-card-title>
        <v-card-text>
          <p>Are you sure you want to reset the device to factory settings?</p>
          <p>This action cannot be undone.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showFactoryResetConfirmDialog = false">Cancel</v-btn>
          <v-btn color="warning" @click="confirmFactoryReset">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>

</style>