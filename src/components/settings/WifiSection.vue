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
          <SsidSelector
            v-model="sta.ssid"
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
import SsidSelector from '@/components/SsidSelector.vue';

const wifiStore = useWifiStore();

const saving = ref(false)
const form = ref()
const valid = ref(false)

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
