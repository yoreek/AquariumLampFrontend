<template>
  <v-text-field
      :label="label"
      variant="outlined"
      :model-value="inner"
      :rules="allRules"
      :hide-details="hideDetails"
      @update:model-value="v => inner = v"
  >
    <!-- Vuetify типов не знает про #control у VTextField, подавим TS -->
    <!-- @ts-expect-error: VTextField exposes #control at runtime -->
    <template #control="{ props }">
      <input-facade
          v-bind="props"
          v-model="inner"
          :mask="'###.###.###.###'"
          class="v-field__input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          spellcheck="false"
          @blur="onBlur"
      />
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { InputFacade } from 'vue-input-facade'

/** валидатор IPv4 */
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

/** соберём правила: required? + ipv4 (если не allowEmpty) + пользовательские */
const allRules = computed(() => {
  const builtins: Array<(v: string) => true|string> = []
  if (!props.allowEmpty) {
    builtins.push(v => (v && v.trim() !== '') || 'Required')
    builtins.push(v => ipv4(v) || 'Invalid IPv4 address')
  } else {
    builtins.push(v => (!v || ipv4(v)) || 'Invalid IPv4 address')
  }
  return props.rules ? [...builtins, ...props.rules] : builtins
})

function onBlur() {
  if (!props.allowEmpty && !ipv4(inner.value)) {
    inner.value = '0.0.0.0'
  }
}
</script>

<script lang="ts">
export default {
  components: { InputFacade }
}
</script>

<style scoped>
.v-field__input {
  background: transparent;
  border: 0;
  outline: none;
  width: 100%;
}
</style>
