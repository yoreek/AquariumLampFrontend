import { defineStore } from "pinia";
import { useResourceLoader } from '@/composables/useResourceLoader'
import { DeviceSettings } from "./models";

const initialState = (): DeviceSettings => ({
    updateInterval: 5000,
})

export const useDeviceSettings = defineStore("device_settings", () => {
    const loader = useResourceLoader<DeviceSettings>({
        getUrl: '/api/device/config',
        postUrl: '/api/device/config',
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
