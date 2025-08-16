<template>
  <v-form v-model="valid" ref="form" validate-on="input">
    <!-- Access Point Settings -->
    <v-card class="pa-3 mb-4" color="#0f1419">
      <v-card-title class="text-white pa-0 mb-3">Access Point Settings</v-card-title>
      <v-row>
        <v-col cols="12">
          <v-switch
              v-model="wifiStore.state.ap.enabled"
              :label="wifiStore.state.ap.enabled ? 'Enabled' : 'Disabled'"
              color="success"
              hide-details
          />
        </v-col>
      </v-row>
      <v-row v-if="wifiStore.state.ap.enabled">
        <v-col cols="12" md="4">
          <v-text-field
              v-model="wifiStore.state.ap.ssid"
              label="SSID"
              variant="outlined"
              :rules="[rules.required, rules.max(32)]"
          />
        </v-col>
        <v-col cols="12" md="4">
          <PasswordField v-model="wifiStore.state.ap.password" label="Password" variant="outlined" />
        </v-col>
        <v-col cols="12" md="4">
          <IpInput v-model="wifiStore.state.ap.ip" label="IP Address" />
        </v-col>
        <v-col cols="12" md="4">
          <IpInput v-model="wifiStore.state.ap.gateway" label="Gateway" />
        </v-col>
        <v-col cols="12" md="4">
          <IpInput v-model="wifiStore.state.ap.subnet" label="Subnet Mask" />
        </v-col>
      </v-row>
    </v-card>

    <!-- Client Settings -->
    <v-card class="pa-3 mb-4" color="#0f1419" v-for="(sta, index) in wifiStore.state.sta" :key="index">
      <v-card-title class="text-white pa-0 mb-3">Client Settings {{ index + 1 }}</v-card-title>
      <v-row>
        <v-col cols="12">
          <v-switch
              v-model="sta.enabled"
              :label="sta.enabled ? 'Enabled' : 'Disabled'"
              color="success"
              hide-details
          />
        </v-col>
      </v-row>
      <v-row v-if="sta.enabled">
        <v-col cols="12" md="4">
          <v-text-field
              v-model="sta.ssid"
              label="SSID"
              variant="outlined"
              :rules="[rules.max(32)]"
          />
        </v-col>
        <v-col cols="12" md="4">
          <PasswordField v-model="sta.password" label="Password" variant="outlined" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="sta.hostname" label="Hostname" variant="outlined" />
        </v-col>
        <v-col cols="12" md="4">
          <v-switch
              v-model="sta.dhcp"
              label="Auto IP (DHCP)"
              color="primary"
              hide-details
          />
        </v-col>
        <v-col cols="12" md="4" v-if="!sta.dhcp">
          <IpInput v-model="sta.ip" label="IP Address" />
        </v-col>
        <v-col cols="12" md="4" v-if="!sta.dhcp">
          <IpInput v-model="sta.gateway" label="Gateway" />
        </v-col>
        <v-col cols="12" md="4" v-if="!sta.dhcp">
          <IpInput v-model="sta.subnet" label="Subnet Mask" />
        </v-col>
        <v-col cols="12" md="4">
          <v-switch
              v-model="sta.autoDns"
              label="Auto DNS"
              color="primary"
              hide-details
          />
        </v-col>
        <v-col cols="12" md="4" v-if="!sta.autoDns">
          <IpInput v-model="sta.dns1" label="DNS 1" />
        </v-col>
        <v-col cols="12" md="4" v-if="!sta.autoDns">
          <IpInput v-model="sta.dns2" label="DNS 2" />
        </v-col>
      </v-row>
    </v-card>

    <!-- Client Settings -->
    <!--          <v-card class="pa-3 mb-4" color="#0f1419">-->
    <!--            <v-card-title class="text-white pa-0 mb-3">Client Settings</v-card-title>-->
    <!--            <v-row>-->
    <!--              <v-col cols="12" md="8">-->
    <!--                <v-select-->
    <!--                    v-model="wifiStore.wifiSettings.client.selectedNetwork"-->
    <!--                    :items="availableNetworks"-->
    <!--                    item-title="ssid"-->
    <!--                    item-value="ssid"-->
    <!--                    label="Select a network..."-->
    <!--                    variant="outlined"-->
    <!--                    @update:model-value="updateWifiSettings"-->
    <!--                >-->
    <!--                  <template #item="{ props, item }">-->
    <!--                    <v-list-item v-bind="props">-->
    <!--                      <template #append>-->
    <!--                        &lt;!&ndash; Заменили на SVG иконки WiFi &ndash;&gt;-->
    <!--                        <svg width="24" height="24" viewBox="0 0 24 24" :fill="getSignalColor(item.raw.signal)">-->
    <!--                          <path v-if="item.raw.signal > -50" d="M1,9L3,7C6.09,4.5 10.5,4.5 13.59,7L15.59,9L12.76,11.83C11.5,10.57 9.5,10.57 8.24,11.83L1,9M12,2C7.86,2 4.08,3.78 1.34,6.83L3.77,9.26C5.88,7.15 8.8,6 12,6C15.2,6 18.12,7.15 20.23,9.26L22.66,6.83C19.92,3.78 16.14,2 12,2M21,9L18.76,11.83C17.5,10.57 15.5,10.57 14.24,11.83L12,14.07L9.76,11.83C8.5,10.57 6.5,10.57 5.24,11.83L3,9L5,7C8.09,4.5 12.5,4.5 15.59,7L21,9M12,12A3,3 0 0,1 15,15A3,3 0 0,1 12,18A3,3 0 0,1 9,15A3,3 0 0,1 12,12Z"/>-->
    <!--                          <path v-else-if="item.raw.signal > -60" d="M1,9L3,7C6.09,4.5 10.5,4.5 13.59,7L15.59,9L12.76,11.83C11.5,10.57 9.5,10.57 8.24,11.83L1,9M12,2C7.86,2 4.08,3.78 1.34,6.83L3.77,9.26C5.88,7.15 8.8,6 12,6C15.2,6 18.12,7.15 20.23,9.26L22.66,6.83C19.92,3.78 16.14,2 12,2M21,9L18.76,11.83C17.5,10.57 15.5,10.57 14.24,11.83L12,14.07L9.76,11.83C8.5,10.57 6.5,10.57 5.24,11.83L3,9L5,7C8.09,4.5 12.5,4.5 15.59,7L21,9"/>-->
    <!--                          <path v-else-if="item.raw.signal > -70" d="M1,9L3,7C6.09,4.5 10.5,4.5 13.59,7L15.59,9L12.76,11.83C11.5,10.57 9.5,10.57 8.24,11.83L1,9M12,2C7.86,2 4.08,3.78 1.34,6.83L3.77,9.26C5.88,7.15 8.8,6 12,6C15.2,6 18.12,7.15 20.23,9.26L22.66,6.83C19.92,3.78 16.14,2 12,2"/>-->
    <!--                          <path v-else d="M1,9L3,7C6.09,4.5 10.5,4.5 13.59,7L15.59,9"/>-->
    <!--                        </svg>-->
    <!--                      </template>-->
    <!--                    </v-list-item>-->
    <!--                  </template>-->
    <!--                </v-select>-->
    <!--              </v-col>-->
    <!--              <v-col cols="12" md="4">-->
    <!--                <v-btn-->
    <!--                    color="primary"-->
    <!--                    variant="outlined"-->
    <!--                    @click="scanNetworks"-->
    <!--                    :loading="scanning"-->
    <!--                    block-->
    <!--                >-->
    <!--                  &lt;!&ndash; Заменили на SVG иконку обновления &ndash;&gt;-->
    <!--                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="mr-2">-->
    <!--                    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>-->
    <!--                  </svg>-->
    <!--                  Scan-->
    <!--                </v-btn>-->
    <!--              </v-col>-->
    <!--            </v-row>-->
    <!--          </v-card>-->

    <v-row class="mt-4" align="center">
      <v-col cols="12" md="6">
        <v-btn
            color="success"
            block
            :loading="saving"
            :disabled="!valid || !wifiStore.isDirty"
            @click="onSave"
        >
          Save WiFi Settings
        </v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn
            color="default"
            block
            :disabled="!wifiStore.isDirty"
            @click="wifiStore.reset()"
        >
          Reset
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ref } from 'vue'
import { useWifiStore } from '@/stores/wifi';
import IpInput from '@/components/IpInput.vue'
import PasswordField   from "@/components/PasswordField.vue";

const wifiStore = useWifiStore();

const saving = ref(false)
const form = ref()
const valid = ref(false)
// const scanning = ref(false)

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

const ipRe =
    /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/
const hostnameRe =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)?$/i // один label (без точек), 0..63, RFC-952/1123 light
const rules = {
  required: (v: any) => (v !== null && v !== undefined && String(v).trim() !== '') || 'Required',
  max: (n: number) => (v: string) => (!v || v.length <= n) || `Max ${n} chars`,
  ip: (v: string) => ipRe.test(v || '') || 'Invalid IPv4',
  hostnameOptional: (v: string) => (!v || hostnameRe.test(v)) || 'a–z, 0–9, dash, 1–63 chars',
  wifiPass: (v: string) => (!!v && v.length >= 8 && v.length <= 63) || 'Min 8, max 63 chars',
  wifiPassOptional: (v: string) => (!v || (v.length >= 8 && v.length <= 63)) || 'Min 8, max 63 chars'
}

async function onSave() {
  const res = await form.value?.validate()
  if (!res?.valid) return
  try {
    saving.value = true
    await wifiStore.save()
    form.value?.resetValidation() // по желанию
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  wifiStore.load()
})
</script>

<style scoped>

</style>
