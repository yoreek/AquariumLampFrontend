<template>
  <v-autocomplete
    v-model="selectedSsid"
    :items="formattedNetworks"
    :loading="scanning"
    label="SSID"
    variant="outlined"
    :rules="rules"
  >
    <template v-slot:append>
      <v-btn class="v-btn" @click="startScan" :disabled="scanning" color="primary">
        <span v-if="!scanning">Scan</span>
        <span v-else>Loading...</span>
      </v-btn>
    </template>
  </v-autocomplete>
  <div class="mt-2">
    {{ scanStatus }}
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useWifiScanner } from '@/composables/useWifiScanner';

export default {
  props: {
    modelValue: String,
    rules: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { scanning, networks, scanStatus, startScan } = useWifiScanner();
    const selectedSsid = ref(props.modelValue);

    const formattedNetworks = computed(() => {
      return networks.value.map(network => network.ssid);
    });

    watch(() => props.modelValue, (newValue) => {
      selectedSsid.value = newValue;
    });

    watch(selectedSsid, (newValue) => {
      emit('update:modelValue', newValue);
    });

    return {
      scanning,
      formattedNetworks,
      scanStatus,
      selectedSsid,
      startScan
    };
  }
};
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
