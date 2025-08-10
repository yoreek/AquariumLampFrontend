<template>
  <v-text-field
      :label="label"
      :placeholder="placeholder"
      :variant="variant"
      :density="density"
      :disabled="disabled"
      :readonly="readonly"
      :autofocus="autofocus"
      :autocapitalize="autocapitalize"
      :autocomplete="autocomplete"
      :spellcheck="false"
      :model-value="modelValue"
      :type="show ? 'text' : 'password'"
      :error="error"
      :error-messages="errorMessages"
      @update:model-value="onUpdate"
  >
    <!-- Кнопка показать/скрыть внутри поля -->
    <template #append-inner>
      <button
          type="button"
          class="pf-eye"
          :aria-label="show ? 'Hide password' : 'Show password'"
          @click="show = !show"
      >
        <!-- Минимальные inline-SVG, без зависимостей -->
        <svg v-if="!show" viewBox="0 0 24 24" width="20" height="20">
          <!-- eye -->
          <path fill="currentColor"
                d="M12 5C7 5 2.7 8.1 1 12c1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20">
          <!-- eye-off (упрощённый) -->
          <path fill="currentColor"
                d="M2 4.27 3.28 3 21 20.72 19.73 22l-3.2-3.2A12.3 12.3 0 0 1 12 19C7 19 2.7 15.9 1 12a12.9 12.9 0 0 1 4.28-5.44L2 4.27ZM7.11 8.38A9.9 9.9 0 0 0 3.35 12c1.5 3.04 5 5.5 8.65 5.5 1.48 0 2.9-.32 4.15-.9l-2.2-2.2A4.98 4.98 0 0 1 12 16a5 5 0 0 1-4.9-6.1Zm5.94-.84A5 5 0 0 1 17 12c0 .47-.07.93-.2 1.36l-1.63-1.63A2.99 2.99 0 0 0 13.05 7.54ZM12 5c2 0 3.9.5 5.55 1.44 1.6.92 2.98 2.2 3.95 3.73-.63 1.03-1.46 1.98-2.45 2.82l-1.42-1.42c.78-.63 1.45-1.35 2-2.15C18.2 7.27 15.25 6 12 6c-.7 0-1.38.06-2.03.18L8.64 4.85C9.72 4.6 10.85 5 12 5Z"/>
        </svg>
      </button>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  variant?: 'outlined' | 'filled' | 'plain' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled'
  density?: 'default' | 'comfortable' | 'compact'
  disabled?: boolean
  readonly?: boolean
  autofocus?: boolean
  autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'
  autocomplete?: string
  error?: boolean
  errorMessages?: string | string[]
}>()

const emit = defineEmits<{ 'update:modelValue':[string] }>()

const show = ref(false)

function onUpdate(v: string) {
  emit('update:modelValue', v)
}
</script>

<style scoped>
.pf-eye {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  padding: 0;
  background: transparent;
  color: currentColor; /* подстраивается под тему */
  cursor: pointer;
}
.pf-eye:focus { outline: none; }
</style>
