<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-row align="center">
            <v-col cols="auto">
              <v-btn icon @click="$router.push('/')" color="white">
                <!-- Заменили на SVG иконку стрелки назад -->
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                </svg>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <!-- Заменили на SVG иконку лампочки -->
              <v-row align="center" no-gutters class="ml-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFC107">
                  <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"/>
                </svg>
                <span class="text-h5 ml-2 text-white">Aquarium Lamp</span>
                <span class="text-caption ml-2 text-grey-darken-1">v{{ version }}</span>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- WiFi Configuration -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">WiFi Configuration</v-card-title>

          <!-- WiFi Mode -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-select
                  v-model="appStore.appSettings.wifi.mode"
                  :items="wifiModes"
                  label="WiFi Mode"
                  variant="outlined"
                  @update:model-value="updateWifiSettings"
              />
            </v-col>
          </v-row>

          <!-- Access Point Settings -->
          <v-card class="pa-3 mb-4" color="#0f1419" v-if="appStore.appSettings.wifi.mode !== 'client'">
            <v-card-title class="text-white pa-0 mb-3">Access Point Settings</v-card-title>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                    v-model="appStore.appSettings.wifi.ap.ssid"
                    label="SSID"
                    variant="outlined"
                    @update:model-value="updateWifiSettings"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                    v-model="appStore.appSettings.wifi.ap.ip"
                    label="IP Address"
                    variant="outlined"
                    @update:model-value="updateWifiSettings"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                    v-model="appStore.appSettings.wifi.ap.password"
                    label="Password"
                    type="password"
                    variant="outlined"
                    @update:model-value="updateWifiSettings"
                />
              </v-col>
            </v-row>
          </v-card>

          <!-- Client Settings -->
          <v-card class="pa-3 mb-4" color="#0f1419" v-if="appStore.appSettings.wifi.mode !== 'ap'">
            <v-card-title class="text-white pa-0 mb-3">Client Settings</v-card-title>
            <v-row>
              <v-col cols="12" md="8">
                <v-select
                    v-model="appStore.appSettings.wifi.client.selectedNetwork"
                    :items="availableNetworks"
                    item-title="ssid"
                    item-value="ssid"
                    label="Select a network..."
                    variant="outlined"
                    @update:model-value="updateWifiSettings"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #append>
                        <!-- Заменили на SVG иконки WiFi -->
                        <svg width="24" height="24" viewBox="0 0 24 24" :fill="getSignalColor(item.raw.signal)">
                          <path v-if="item.raw.signal > -50" d="M1,9L3,7C6.09,4.5 10.5,4.5 13.59,7L15.59,9L12.76,11.83C11.5,10.57 9.5,10.57 8.24,11.83L1,9M12,2C7.86,2 4.08,3.78 1.34,6.83L3.77,9.26C5.88,7.15 8.8,6 12,6C15.2,6 18.12,7.15 20.23,9.26L22.66,6.83C19.92,3.78 16.14,2 12,2M21,9L18.76,11.83C17.5,10.57 15.5,10.57 14.24,11.83L12,14.07L9.76,11.83C8.5,10.57 6.5,10.57 5.24,11.83L3,9L5,7C8.09,4.5 12.5,4.5 15.59,7L21,9M12,12A3,3 0 0,1 15,15A3,3 0 0,1 12,18A3,3 0 0,1 9,15A3,3 0 0,1 12,12Z"/>
                          <path v-else-if="item.raw.signal > -60" d="M1,9L3,7C6.09,4.5 10.5,4.5 13.59,7L15.59,9L12.76,11.83C11.5,10.57 9.5,10.57 8.24,11.83L1,9M12,2C7.86,2 4.08,3.78 1.34,6.83L3.77,9.26C5.88,7.15 8.8,6 12,6C15.2,6 18.12,7.15 20.23,9.26L22.66,6.83C19.92,3.78 16.14,2 12,2M21,9L18.76,11.83C17.5,10.57 15.5,10.57 14.24,11.83L12,14.07L9.76,11.83C8.5,10.57 6.5,10.57 5.24,11.83L3,9L5,7C8.09,4.5 12.5,4.5 15.59,7L21,9"/>
                          <path v-else-if="item.raw.signal > -70" d="M1,9L3,7C6.09,4.5 10.5,4.5 13.59,7L15.59,9L12.76,11.83C11.5,10.57 9.5,10.57 8.24,11.83L1,9M12,2C7.86,2 4.08,3.78 1.34,6.83L3.77,9.26C5.88,7.15 8.8,6 12,6C15.2,6 18.12,7.15 20.23,9.26L22.66,6.83C19.92,3.78 16.14,2 12,2"/>
                          <path v-else d="M1,9L3,7C6.09,4.5 10.5,4.5 13.59,7L15.59,9"/>
                        </svg>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                    color="primary"
                    variant="outlined"
                    @click="scanNetworks"
                    :loading="scanning"
                    block
                >
                  <!-- Заменили на SVG иконку обновления -->
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="mr-2">
                    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                  </svg>
                  Scan
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field
                    v-model="appStore.appSettings.wifi.client.password"
                    label="Password"
                    type="password"
                    variant="outlined"
                    @update:model-value="updateWifiSettings"
                />
              </v-col>
            </v-row>
          </v-card>

          <v-btn color="success" @click="saveWifiSettings" :loading="saving" block>
            Save WiFi Settings
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Manual Time Setting -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">Manual Time Setting</v-card-title>

          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="manualDate"
                  label="Date"
                  type="date"
                  variant="outlined"
                  :disabled="appStore.appSettings.time.autoSync"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="manualTime"
                  label="Time"
                  type="time"
                  variant="outlined"
                  :disabled="appStore.appSettings.time.autoSync"
              />
            </v-col>
          </v-row>

          <v-btn
              color="primary"
              @click="setManualTime"
              :loading="settingTime"
              :disabled="appStore.appSettings.time.autoSync"
              block
          >
            Set Time
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Time Configuration -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">Time Configuration</v-card-title>

          <v-row class="mb-4">
            <v-col cols="12">
              <v-switch
                  v-model="appStore.appSettings.time.autoSync"
                  label="Auto Time Sync (NTP)"
                  color="success"
                  @update:model-value="updateTimeSettings"
              />
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="appStore.appSettings.time.ntpServer"
                  label="NTP Server"
                  variant="outlined"
                  :disabled="!appStore.appSettings.time.autoSync"
                  @update:model-value="updateTimeSettings"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                  v-model="appStore.appSettings.time.timezone"
                  :items="timezones"
                  item-title="name"
                  item-value="id"
                  label="Timezone"
                  variant="outlined"
                  @update:model-value="updateTimeSettings"
              />
            </v-col>
          </v-row>

          <v-btn color="success" @click="saveTimeConfiguration" :loading="saving" block>
            Save Time Configuration
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Device Information -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">Device Information</v-card-title>

          <v-row>
            <v-col cols="6">
              <div class="text-white">Device IP:</div>
            </v-col>
            <v-col cols="6">
              <div :class="appStore.deviceInfo.connected ? 'text-success' : 'text-error'">
                {{ appStore.deviceInfo.ip || 'Not connected' }}
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6">
              <div class="text-white">Firmware Version:</div>
            </v-col>
            <v-col cols="6">
              <div class="text-success">{{ appStore.deviceInfo.firmware || 'Unknown' }}</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6">
              <div class="text-white">Uptime:</div>
            </v-col>
            <v-col cols="6">
              <div class="text-success">{{ appStore.deviceInfo.uptime || 'Unknown' }}</div>
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col cols="6">
              <div class="text-white">Free Memory:</div>
            </v-col>
            <v-col cols="6">
              <div class="text-success">{{ appStore.deviceInfo.freeMemory || 'Unknown' }}</div>
            </v-col>
          </v-row>

          <v-btn color="info" @click="refreshDeviceInfo" :loading="refreshing" block>
            Refresh Information
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Advanced Settings -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">Advanced</v-card-title>

          <v-row class="mb-4">
            <v-col cols="12">
              <v-text-field
                  v-model="appStore.appSettings.device.updateInterval"
                  label="Update Interval (seconds)"
                  type="number"
                  variant="outlined"
                  @update:model-value="updateDeviceSettings"
              />
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col cols="12">
              <div class="text-white mb-2">Current API Endpoint:</div>
              <div class="text-success">{{ appStore.apiBaseUrl }}</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-btn color="success" @click="saveDeviceSettings" :loading="saving" block>
                Save Advanced Settings
              </v-btn>
            </v-col>
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
import {onMounted, ref} from 'vue'
import {useAppStore} from '../stores/app'
import pkg from '../../package.json'

const version = pkg.version

const appStore = useAppStore()

const saving = ref(false)
const scanning = ref(false)
const refreshing = ref(false)
const rebooting = ref(false)

const settingTime = ref(false)
const manualDate = ref(new Date().toISOString().split("T")[0])
const manualTime = ref(new Date().toTimeString().split(" ")[0].substring(0, 5))

const wifiModes = [
  { title: 'Access Point', value: 'ap' },
  { title: 'Client', value: 'client' },
  { title: 'Auto', value: 'auto' }
]

const availableNetworks = ref([
  { ssid: 'HomeNetwork', signal: -45 },
  { ssid: 'OfficeWiFi', signal: -60 },
  { ssid: 'GuestNetwork', signal: -75 }
])

const timezones = ref([
  { id: 'UTC', name: 'UTC (GMT+0)' },
  { id: 'America/New_York', name: 'Eastern Time (GMT-5)' },
  { id: 'America/Chicago', name: 'Central Time (GMT-6)' },
  { id: 'America/Denver', name: 'Mountain Time (GMT-7)' },
  { id: 'America/Los_Angeles', name: 'Pacific Time (GMT-8)' },
  { id: 'Europe/London', name: 'London (GMT+0)' },
  { id: 'Europe/Berlin', name: 'Berlin (GMT+1)' },
  { id: 'Asia/Tokyo', name: 'Tokyo (GMT+9)' }
])

const getSignalColor = (signal: number) => {
  if (signal > -50) return '#4CAF50'
  if (signal > -70) return '#FF9800'
  return '#F44336'
}

const scanNetworks = async () => {
  scanning.value = true
  try {
    availableNetworks.value = await appStore.scanWifiNetworks()
  } catch (error) {
    console.error('Failed to scan networks:', error)
  } finally {
    scanning.value = false
  }
}

const updateWifiSettings = () => {
  // Settings are automatically updated in store
}

const saveWifiSettings = async () => {
  saving.value = true
  try {
    await appStore.updateWifiSettings(appStore.appSettings.wifi)
  } catch (error) {
    console.error('Failed to save WiFi settings:', error)
  } finally {
    saving.value = false
  }
}

const setManualTime = async () => {
  settingTime.value = true
  try {
    await appStore.setManualTime({
      date: manualDate.value,
      time: manualTime.value
    })
  } catch (error) {
    console.error('Failed to set manual time:', error)
  } finally {
    settingTime.value = false
  }
}

const saveTimeConfiguration = async () => {
  saving.value = true
  try {
    await appStore.updateTimeConfiguration({
      autoSync: appStore.appSettings.time.autoSync,
      ntpServer: appStore.appSettings.time.ntpServer,
      timezone: appStore.appSettings.time.timezone
    })
  } catch (error) {
    console.error('Failed to save time configuration:', error)
  } finally {
    saving.value = false
  }
}

const updateTimeSettings = () => {
  // Settings are automatically updated in store
}

const updateDeviceSettings = () => {
  // Settings are automatically updated in store
}

const saveDeviceSettings = async () => {
  saving.value = true
  try {
    await appStore.updateDeviceSettings(appStore.appSettings.device)
  } catch (error) {
    console.error('Failed to save device settings:', error)
  } finally {
    saving.value = false
  }
}

const refreshDeviceInfo = async () => {
  refreshing.value = true
  try {
    await appStore.getDeviceInfo()
  } catch (error) {
    console.error('Failed to refresh device info:', error)
  } finally {
    refreshing.value = false
  }
}

const rebootDevice = async () => {
  rebooting.value = true
  try {
    await appStore.rebootDevice()
  } catch (error) {
    console.error('Failed to reboot device:', error)
  } finally {
    rebooting.value = false
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
