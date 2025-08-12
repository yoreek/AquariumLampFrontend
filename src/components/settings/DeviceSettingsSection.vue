<template>
  <v-row class="mb-1">
    <v-col cols="12">
      <v-form v-model="valid" ref="form" validate-on="input">
        <v-card class="pa-2" color="#16213e">
          <v-card-title class="text-white">Device Settings</v-card-title>

          <v-row class="mb-4">
            <v-text-field
                v-model="deviceSettings.state.updateInterval"
                label="Update Interval (seconds)"
                type="number"
                variant="outlined"
            />
          </v-row>

          <v-row class="mt-4" align="center">
            <v-col cols="12" md="6">
              <v-btn
                  color="success"
                  block
                  :loading="saving"
                  :disabled="!valid || !deviceSettings.isDirty"
                  @click="onSave"
              >
                Save Device Settings
              </v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn
                  color="default"
                  block
                  :disabled="!deviceSettings.isDirty"
                  @click="deviceSettings.reset()"
              >
                Reset
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-form>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDeviceSettings } from '@/stores/device_settings';

const deviceSettings = useDeviceSettings();

const saving = ref(false)
const form = ref()
const valid = ref(false)

async function onSave() {
  const res = await form.value?.validate()
  if (!res?.valid) return
  try {
    saving.value = true
    await deviceSettings.save()
    form.value?.resetValidation() // по желанию
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>

</style>
