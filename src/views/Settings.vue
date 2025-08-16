<template>
  <v-container fluid class="pa-0">
    <!-- Header -->
    <v-row class="mb-1">
      <v-col cols="12">
        <v-card class="pa-2" color="#16213e">
          <v-row align="center">
            <v-col cols="auto">
              <v-btn icon @click="router.push('/')" color="white" density="compact">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                </svg>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-row align="center" no-gutters class="ml-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFC107">
                  <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"/>
                </svg>
                <span class="text-h6 ml-2 text-white">Aquarium Lamp</span>
                <span class="text-caption ml-2 text-grey-darken-1">v{{ version }}</span>
                <span class="text-caption ml-4 text-white d-flex align-center">
                  <svg v-if="!currentTempStore.state.ready" width="16" height="16" viewBox="0 0 24 24" fill="grey" class="mr-1">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                  <template v-if="currentTempStore.state.ready">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="red" class="mr-1">
                      <path d="M17 17.75V11.5C17 8.46 14.54 6 11.5 6S6 8.46 6 11.5v6.25C4.83 18.58 4 20.19 4 22h15c0-1.81-0.83-3.42-2-4.25zM11.5 20c-1.38 0-2.5-1.12-2.5-2.5S10.12 15 11.5 15s2.5 1.12 2.5 2.5S12.88 20 11.5 20zM13 11.5V17h-3v-5.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5z"/>
                    </svg>
                    {{ roundedTemperature }}
                    <span style="font-size: 0.9em;">°C</span>
                  </template>
                  <template v-else>
                    —
                  </template>
                </span>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>


    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          WiFi Configuration
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;" class="pa-0">
          <WifiSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          Time
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;">
          <TimeSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          NTP Configuration
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;">
          <NtpSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          Temperature Sensor Configuration
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;">
          <TempSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          Thermostat Configuration
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;">
          <ThermostatSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          Device Information
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;">
          <DeviceInfoSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          Advanced
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;">
          <AdvancedSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<style scoped>
::v-deep(.v-expansion-panel-text__wrapper) {
  padding: 4px 8px !important;
}
</style>

<script setup lang="ts">
import pkg from '../../package.json'
import { useRouter } from 'vue-router'
import WifiSection from '@/components/settings/WifiSection.vue'
import TimeSection from '@/components/settings/TimeSection.vue'
import NtpSection from '@/components/settings/NtpSection.vue'
import DeviceInfoSection from '@/components/settings/DeviceInfoSection.vue'
import AdvancedSection from "@/components/settings/AdvancedSection.vue";
import TempSection from "@/components/settings/TempSection.vue";
import ThermostatSection from "@/components/settings/ThermostatSection.vue";
import { useCurrentTempStore } from '@/stores/current_temp'
import { computed } from 'vue'

const router = useRouter()
const version = pkg.version
const currentTempStore = useCurrentTempStore()

const roundedTemperature = computed(() => {
  return currentTempStore.state.temperature ? currentTempStore.state.temperature.toFixed(1) : null
})
</script>
