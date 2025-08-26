<template>
  <v-form v-model="valid" ref="form" validate-on="input">
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="text-white mb-2">Mode</div>
        <v-btn-toggle
            v-model="fanStateStore.state.mode"
            color="primary"
            mandatory
            @update:model-value="updateFanMode"
        >
          <v-btn value="auto" size="small">Auto</v-btn>
          <v-btn value="on" size="small">On</v-btn>
          <v-btn value="off" size="small">Off</v-btn>
          <v-btn value="pause" size="small">Pause</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12"  md="6">
        <v-text-field
            type="number"
            v-model="coolingManagerStore.state.temperature"
            label="Temperature"
            variant="outlined"
            suffix="°C"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
            type="number"
            v-model="coolingManagerStore.state.hysteresis"
            label="Hysteresis"
            variant="outlined"
            suffix="°C"
        />
      </v-col>
    </v-row>

    <v-row class="mt-4" align="center">
      <v-col cols="12" md="6">
        <v-btn
            color="success"
            block
            :loading="saving"
            :disabled="!valid || !coolingManagerStore.isDirty"
            @click="onSave"
        >
          Save Cooling Manager Configuration
        </v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn
            color="default"
            block
            :disabled="!coolingManagerStore.isDirty"
            @click="coolingManagerStore.reset()"
        >
          Reset
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCoolingManagerStore } from '@/stores/cooling_manager';
import { useFanStateStore} from "@/stores/fan_state.ts";

const coolingManagerStore = useCoolingManagerStore();
const fanStateStore = useFanStateStore();

const saving = ref(false)
const form = ref()
const valid = ref(false)

async function onSave() {
  const res = await form.value?.validate()
  if (!res?.valid) return
  try {
    saving.value = true
    await coolingManagerStore.save()
    form.value?.resetValidation()
  } finally {
    saving.value = false
  }
}

const updateFanMode = async () => {
  try {
    await fanStateStore.save()
  } catch (error) {
    console.error('Failed to update fan mode:', error)
  }
}

onMounted(() => {
  coolingManagerStore.load()
  fanStateStore.load()
})
</script>

<style scoped>

</style>
