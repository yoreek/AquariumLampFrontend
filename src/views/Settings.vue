<template>
  <v-container fluid class="pa-0">
    <!-- Header -->
    <v-row class="mb-1">
      <v-col cols="12">
        <v-card class="pa-2" color="#16213e">
          <v-row align="center">
            <v-col cols="auto">
              <v-btn icon @click="router.push('/')" color="white" density="compact">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                </svg>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <!-- Заменили на SVG иконку лампочки -->
              <v-row align="center" no-gutters class="ml-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFC107">
                  <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"/>
                </svg>
                <span class="text-h6 ml-2 text-white">Aquarium Lamp</span>
                <span class="text-caption ml-2 text-grey-darken-1">v{{ version }}</span>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <WifiSection />
    <TimeSection />
    <NtpSection />
    <DeviceInfoSection />

    <v-row class="ma-1">
      <v-col cols="12" class="pa-0">
        <v-card class="pa-2" color="#16213e">
          <v-card-title class="text-white">Advanced</v-card-title>

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
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDeviceStore } from '../stores/device';
import pkg from '../../package.json'
import { useRouter } from 'vue-router'
import { apiBaseUrl } from '@/utils/api';
import WifiSection from '@/components/settings/WifiSection.vue'
import TimeSection from '@/components/settings/TimeSection.vue'
import NtpSection from '@/components/settings/NtpSection.vue'
import DeviceInfoSection from '@/components/settings/DeviceInfoSection.vue'

const router = useRouter()
const version = pkg.version
const deviceStore = useDeviceStore();
// const scanning = ref(false)
const rebooting = ref(false)

// const availableNetworks = ref([
//   { ssid: 'HomeNetwork', signal: -45 },
//   { ssid: 'OfficeWiFi', signal: -60 },
//   { ssid: 'GuestNetwork', signal: -75 }
// ])

// const getSignalColor = (signal: number) => {
//   if (signal > -50) return '#4CAF50'
//   if (signal > -70) return '#FF9800'
//   return '#F44336'
// }
//
// const scanNetworks = async () => {
//   scanning.value = true
//   try {
//     availableNetworks.value = await wifiStore.scanWifiNetworks()
//   } catch (error) {
//     console.error('Failed to scan networks:', error)
//   } finally {
//     scanning.value = false
//   }
// }


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
</script>
