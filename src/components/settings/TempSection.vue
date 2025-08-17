<template>
  <v-form v-model="valid" ref="form" validate-on="input">
    <v-row class="mb-4">
      <v-col cols="12">
        <OneWireDeviceInput v-model="tempStore.state.address" label="Address" />
<!--        <OneWireDeviceSelector v-model="tempStore.state.address" />-->
<!--        <Ds18b20Input v-model="tempStore.state.address" />-->
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12">
        <v-text-field
            type="number"
            v-model="tempStore.state.exp_filter_wight"
            label="Exponential Filter Weight"
            variant="outlined"
        />
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12">
        <v-text-field
            type="number"
            v-model="tempStore.state.approx_factor"
            label="Approximation Factor"
            variant="outlined"
        />
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12">
        <v-text-field
            type="number"
            v-model="tempStore.state.approx_offset"
            label="Approximation Offset"
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
            :disabled="!valid || !tempStore.isDirty"
            @click="onSave"
        >
          Save Temperature Sensor Configuration
        </v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn
            color="default"
            block
            :disabled="!tempStore.isDirty"
            @click="tempStore.reset()"
        >
          Reset
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTempStore } from '@/stores/temp';
import Ds18b20Input from '@/components/Ds18b20Input.vue'
import OneWireDeviceSelector from "@/components/OneWireDeviceSelector.vue";
import OneWireDeviceInput from "@/components/OneWireDeviceInput.vue";

const tempStore = useTempStore();

const saving = ref(false)
const form = ref()
const valid = ref(false)

async function onSave() {
  const res = await form.value?.validate()
  if (!res?.valid) return
  try {
    saving.value = true
    await tempStore.save()
    form.value?.resetValidation() // по желанию
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  tempStore.load()
})
</script>

<style scoped>

</style>
