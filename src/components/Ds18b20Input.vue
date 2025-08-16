<template>
  <v-mask-input
    v-model="inner"
    :label="label"
    variant="outlined"
    :mask="mask"
    :rules="allRules"
    :hide-details="hideDetails"
    return-masked-value
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String,
  rules: Array as PropType<((value: string) => true | string)[]>,
  hideDetails: Boolean
})
const emit = defineEmits(['update:modelValue'])

const inner = ref(props.modelValue || '')

watch(() => props.modelValue, v => {
  if (v !== inner.value) inner.value = v || ''
})
watch(inner, v => emit('update:modelValue', v))

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
