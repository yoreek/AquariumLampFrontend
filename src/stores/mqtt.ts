import { defineStore } from "pinia";
import type { MqttSettings } from "./models";
import { useResourceLoader } from '@/composables/useResourceLoader'

const initialState = (): MqttSettings => ({
  enabled: false,
  ip: '0.0.0.0',
  port: 0,
  clientId: '',
  username: '',
  password: '',
})

export const useMqttStore = defineStore("mqtt", () => {
  const loader = useResourceLoader<MqttSettings>({
    getUrl: '/api/mqtt',
    postUrl: '/api/mqtt',
    initial: initialState,
  })


  return {
    state: loader.data,
    isDirty: loader.isDirty,
    reset: loader.resetToSnapshot,
    load: loader.load,
    save: loader.save,
  };
});
