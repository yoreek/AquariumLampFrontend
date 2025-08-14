<template>
  <v-card class="pa-2" color="#16213e">
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
            v-model="timeStore.state.date"
            label="Date"
            type="date"
            variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
            v-model="timeStore.state.time"
            label="Time"
            type="time"
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
            @click="onSave"
        >
          Save Time
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTimeStore } from '@/stores/time';

const timeStore = useTimeStore();

const saving = ref(false)

async function onSave() {
  try {
    saving.value = true
    await timeStore.save()
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>

</style>