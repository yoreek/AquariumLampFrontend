<template>
  <v-form v-model="valid" ref="form" validate-on="input">
    <v-card class="pa-3 mb-4" color="#0f1419">
      <v-card-title class="text-white pa-0 mb-3">MQTT Settings</v-card-title>
      <v-row>
        <v-col cols="12">
          <v-switch
              v-model="mqttStore.state.enabled"
              :label="mqttStore.state.enabled ? 'Enabled' : 'Disabled'"
              color="success"
              hide-details
          />
        </v-col>
      </v-row>
      <v-row v-if="mqttStore.state.enabled">
        <v-col cols="12" md="4">
          <IpInput v-model="mqttStore.state.ip" label="IP Address" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
              v-model="mqttStore.state.port"
              label="Port"
              type="number"
              variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
              v-model="mqttStore.state.clientId"
              label="Client ID"
              variant="outlined"
              :rules="[rules.required, rules.max(32)]"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
              v-model="mqttStore.state.username"
              label="Username"
              variant="outlined"
              :rules="[rules.required, rules.max(32)]"
          />
        </v-col>
        <v-col cols="12" md="4">
          <PasswordField v-model="mqttStore.state.password" label="Password" variant="outlined" />
        </v-col>
      </v-row>
    </v-card>

    <v-row class="mt-4" align="center">
      <v-col cols="12" md="6">
        <v-btn
            color="success"
            block
            :loading="saving"
            :disabled="!valid || !mqttStore.isDirty"
            @click="onSave"
        >
          Save MQTT Settings
        </v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn
            color="default"
            block
            :disabled="!mqttStore.isDirty"
            @click="mqttStore.reset()"
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
import { useMqttStore } from '@/stores/mqtt';
import IpInput from '@/components/IpInput.vue'
import PasswordField   from "@/components/PasswordField.vue";

const mqttStore = useMqttStore();

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
    await mqttStore.save()
    form.value?.resetValidation() // по желанию
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  mqttStore.load()
})
</script>

<style scoped>

</style>
