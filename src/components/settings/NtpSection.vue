<template>
  <!-- NTP Configuration -->
  <v-row class="mb-1">
    <v-col cols="12">
      <v-form v-model="valid" ref="form" validate-on="input">
        <v-card class="pa-2" color="#16213e">
          <v-card-title class="text-white">NTP Configuration</v-card-title>

          <v-row class="mb-4">
            <v-col cols="12">
              <v-text-field v-model="ntpStore.ntpSettings.server" label="NTP Server" variant="outlined" />
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col cols="12">
              <v-text-field
                  type="number"
                  v-model="ntpStore.ntpSettings.syncInterval"
                  label="Sync Interval"
                  variant="outlined"
              />
            </v-col>
          </v-row>
          <v-row class="mb-4">
            <v-col cols="12">
              <v-select
                  v-model="ntpStore.ntpSettings.timeZoneId"
                  :items="timezones"
                  item-title="name"
                  item-value="id"
                  label="Timezone"
                  variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row class="mt-4" align="center">
            <v-col cols="12" md="6">
              <v-btn
                  color="success"
                  block
                  :loading="saving"
                  :disabled="!valid || !ntpStore.isDirty"
                  @click="onSave"
              >
                Save NTP Configuration
              </v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn
                  color="default"
                  block
                  :disabled="!ntpStore.isDirty"
                  @click="ntpStore.reset()"
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
import { useNtpStore } from '@/stores/ntp';
import timezones from "@/data/timezones.json";

const ntpStore = useNtpStore();

const saving = ref(false)
const form = ref()
const valid = ref(false)

async function onSave() {
  const res = await form.value?.validate()
  if (!res?.valid) return
  try {
    saving.value = true
    await ntpStore.save()
    form.value?.resetValidation() // по желанию
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>

</style>
