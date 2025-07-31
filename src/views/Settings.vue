<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-row align="center">
            <v-col cols="auto">
              <v-btn icon @click="$router.push('/')" color="white">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-icon color="yellow" size="32">mdi-lightbulb</v-icon>
              <span class="text-h5 ml-2 text-white">Aquarium Lamp</span>
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
            <v-card-subtitle class="text-white">Access Point Settings</v-card-subtitle>
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
            <v-card-subtitle class="text-white">Client Settings</v-card-subtitle>
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
                        <v-icon :color="getSignalColor(item.raw.signal)">
                          {{ getSignalIcon(item.raw.signal) }}
                        </v-icon>
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
                  <v-icon left>mdi-wifi-refresh</v-icon>
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

    <!-- Time & Synchronization -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">Time & Synchronization</v-card-title>

          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="appStore.appSettings.time.date"
                  label="Date"
                  type="date"
                  variant="outlined"
                  :disabled="appStore.appSettings.time.autoSync"
                  @update:model-value="updateTimeSettings"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="appStore.appSettings.time.time"
                  label="Time"
                  type="time"
                  variant="outlined"
                  :disabled="appStore.appSettings.time.autoSync"
                  @update:model-value="updateTimeSettings"
              />
            </v-col>
          </v-row>

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

          <v-row class="mb-4">
            <v-col cols="12">
              <div class="text-white mb-2">Time Format (Current: {{ appStore.timeFormat }}H)</div>
              <v-btn-toggle
                  v-model="currentTimeFormat"
                  color="primary"
                  mandatory
                  @update:model-value="handleTimeFormatChange"
              >
                <v-btn value="12">12 Hour</v-btn>
                <v-btn value="24">24 Hour</v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>

          <v-btn color="success" @click="saveTimeSettings" :loading="saving" block>
            Save Time Settings
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
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const saving = ref(false)
const scanning = ref(false)
const refreshing = ref(false)
const rebooting = ref(false)
const currentTimeFormat = ref(appStore.timeFormat)

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
  if (signal > -50) return 'success'
  if (signal > -70) return 'warning'
  return 'error'
}

const getSignalIcon = (signal: number) => {
  if (signal > -50) return 'mdi-wifi-strength-4'
  if (signal > -60) return 'mdi-wifi-strength-3'
  if (signal > -70) return 'mdi-wifi-strength-2'
  return 'mdi-wifi-strength-1'
}

const scanNetworks = async () => {
  scanning.value = true
  try {
    const networks = await appStore.scanWifiNetworks()
    availableNetworks.value = networks
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

const updateTimeSettings = () => {
  // Settings are automatically updated in store
}

const saveTimeSettings = async () => {
  saving.value = true
  try {
    await appStore.updateTimeSettings(appStore.appSettings.time)
  } catch (error) {
    console.error('Failed to save time settings:', error)
  } finally {
    saving.value = false
  }
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

const handleTimeFormatChange = (newFormat: "12" | "24") => {
  console.log('Changing time format to:', newFormat)
  currentTimeFormat.value = newFormat
  appStore.setTimeFormat(newFormat)
}

onMounted(async () => {
  try {
    await refreshDeviceInfo()
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
})
</script>
