<template>
  <div>
    <v-mask-input
      v-model="inner"
      :label="label"
      variant="outlined"
      :mask="mask"
      :rules="allRules"
      :hide-details="hideDetails"
      return-masked-value
    >
      <template v-slot:append>
        <v-btn class="v-btn" @click="openDialog" color="primary">
          Select
        </v-btn>
      </template>
    </v-mask-input>

    <v-dialog v-model="dialogVisible" max-width="500px">
      <v-card>
        <v-card-title style="font-weight: bold;">Device Selector</v-card-title>
        <v-card-text>
          <div v-if="scanning">Scanning for devices...</div>
          <div v-else-if="devices.length === 0">No devices found.</div>
          <v-list v-else>
            <v-list-item
              v-for="device in devices"
              :key="device"
              @click="selectDevice(device)"
            >
              <v-list-item-title>{{ device }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="closeDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useOneWireDeviceScanner } from '@/composables/useOneWireDeviceScanner';
import type { PropType } from 'vue';

const props = defineProps({
  modelValue: String,
  label: String,
  hideDetails: Boolean,
});
const emit = defineEmits(['update:modelValue']);

const { devices, scanning, startScan } = useOneWireDeviceScanner();
const inner = ref(props.modelValue || '');
const dialogVisible = ref(false);

const openDialog = () => {
  dialogVisible.value = true;
  startScan();
};

const closeDialog = () => {
  dialogVisible.value = false;
};

const selectDevice = (device: string) => {
  inner.value = device;
  closeDialog();
};

watch(() => props.modelValue, v => {
  if (v !== inner.value) inner.value = v || '';
});
watch(inner, v => emit('update:modelValue', v));

const mask = {
  mask: 'HH:HH:HH:HH:HH:HH:HH:HH',
  tokens: {
    'H': {
      pattern: /[0-9a-fA-F]/,
      convert: (v: string) => v.toUpperCase()
    }
  }
}

const allRules = computed<((value: string) => true | string)[]>(() => [
  ...(props.rules || []),
  (v: string) => v && v.length === 23 || 'Address must be fully filled',
  (v: string) => /^([0-9A-F]{2}:){7}[0-9A-F]{2}$/.test(v) || 'Invalid address format'
])
</script>

<style scoped>
.v-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 36px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
}
</style>
