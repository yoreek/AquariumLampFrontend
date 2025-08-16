<template>
  <v-text-field
    v-model="inner"
    :label="label"
    variant="outlined"
    :rules="allRules"
    :hide-details="hideDetails"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    spellcheck="false"
    @blur="onBlur"
    full-width
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const ipv4 = (v: string) =>
    /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(v || '')

const props = defineProps<{
  modelValue: string
  label?: string
  /** Разрешить пустое значение (для DHCP); если false — пустое станет '0.0.0.0' */
  allowEmpty?: boolean
  /** Дополнительные правила для v-form */
  rules?: Array<(v: string) => true | string>
  hideDetails?: boolean | 'auto'
}>()

const emit = defineEmits<{ 'update:modelValue':[string] }>()
const inner = ref(props.modelValue ?? '0.0.0.0')

watch(() => props.modelValue, v => {
  if (v !== inner.value) inner.value = v ?? (props.allowEmpty ? '' : '0.0.0.0')
})
watch(inner, v => emit('update:modelValue', v))

const allRules = computed(() => {
  const builtins: Array<(v: string) => true|string> = []
  if (!props.allowEmpty) {
    builtins.push((v: string) => (v && v.trim() !== '') || 'Required')
    builtins.push((v: string) => ipv4(v) || 'Invalid IPv4 address')
  } else {
    builtins.push((v: string) => (!v || ipv4(v)) || 'Invalid IPv4 address')
  }
  return [...builtins, ...(props.rules || [])]
})

function onBlur() {
  if (!props.allowEmpty && !ipv4(inner.value)) {
    inner.value = '0.0.0.0'
  }
}
</script>
