<template>
  <v-container fluid class="pa-0" :key="componentKey">
    <!-- Header -->
    <v-row class="mb-1">
      <v-col cols="12">
        <v-card class="pa-2" color="#16213e">
          <v-row align="center">
            <v-col cols="auto">
              <v-row align="center" no-gutters class="ml-2">
                <!-- Заменили на SVG иконку лампочки -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFC107">
                  <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"/>
                </svg>
                <span class="text-h6 ml-2 text-white">Aquarium Lamp</span>
                <span class="text-caption ml-2 text-grey-darken-1">v{{ version }}</span>
              </v-row>
            </v-col>
            <v-spacer />
<!--            <v-col cols="auto">-->
<!--              <div class="text-body-1 text-white">{{ currentDateTime }}</div>-->
<!--            </v-col>-->
            <v-col cols="auto">
              <v-btn icon @click="router.push('/settings')" color="white" density="compact">
                <!-- Заменили на SVG иконку настроек -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                </svg>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Chart Section -->
    <v-row class="mb-1 sticky-row">
      <v-col cols="12" class="pa-0">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">Daily Brightness Schedule</v-card-title>
          <div class="mb-4">
            <v-row>
              <v-col v-for="(channel, index) in channels" :key="index" cols="auto" class="pa-1">
                <v-chip :color="channel.color" variant="flat" size="small">
                  {{ channel.name }}
                </v-chip>
              </v-col>
            </v-row>
          </div>
          <div class="chart-container">
            <canvas ref="chartCanvas" width="800" height="200"></canvas>
          </div>
          <div class="text-center mt-2" :class="connectionStatus.color">
            {{ connectionStatus.text }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Manual Control -->
    <v-row class="mt-1">
      <v-col cols="12" class="pt-0">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">Manual Control</v-card-title>
          <v-row class="mb-0">
            <v-col cols="12" md="8">
              <v-row>
                <v-col v-for="(channel, index) in channels" :key="index" cols="12" sm="6" md="4" class="pa-1">
                  <div class="mb-0">
                    <v-chip :color="channel.color" variant="flat" size="small" class="mb-2">
                      {{ channel.name }}
                    </v-chip>
                    <v-slider
                        v-model="lampStore.lampState.manualBrightness[index]"
                        :color="channel.color"
                        min="0"
                        max="100"
                        step="1"
                        thumb-label
                        :disabled="lampStore.lampState.mode !== 'manual'"
                        @update:model-value="updateManualBrightness(index, $event)"
                    >
                      <template #append>
                        <span class="text-white">{{ lampStore.lampState.manualBrightness[index] }}%</span>
                      </template>
                    </v-slider>
                  </div>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-white mb-2">Mode</div>
              <v-btn-toggle
                  v-model="lampStore.lampState.mode"
                  color="primary"
                  mandatory
                  @update:model-value="updateLampMode"
              >
                <v-btn value="schedule" size="small">Schedule</v-btn>
                <v-btn value="manual" size="small">Manual</v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Schedule Settings -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">
            Schedule Settings
          </v-card-title>
          <v-row>
            <v-col v-for="(schedule, index) in lampStore.lampState.schedules" :key="`schedule-${index}-${componentKey}`" cols="12" md="6" xl="4">
              <v-card class="pa-3 mb-3" color="#0f1419">
                <v-row align="center" class="mb-2">
                  <v-col cols="auto">
                    <v-switch
                        v-model="schedule.enabled"
                        color="primary"
                        density="compact"
                        hide-details
                        @update:model-value="updateSchedule(index)"
                    />
                  </v-col>
                  <v-col cols="auto">
                    <span class="text-white font-weight-medium">{{ index + 1 }}</span>
                  </v-col>
                  <v-col>
                    <v-text-field
                        :model-value="schedule.from"
                        type="time"
                        variant="outlined"
                        density="compact"
                        hide-details
                        :disabled="!schedule.enabled"
                        @update:model-value="updateTimeValue(index, $event)"
                    />
                  </v-col>
                </v-row>

                <!-- 5 Channel Sliders -->
                <div v-for="(channel, channelIndex) in channels" :key="channelIndex" class="mb-2">
                  <v-row align="center" no-gutters>
                    <v-col cols="2">
                      <v-chip
                          :color="channel.color"
                          variant="flat"
                          size="x-small"
                          class="text-caption"
                      >
                        {{ channel.name.charAt(0) }}
                      </v-chip>
                    </v-col>
                    <v-col cols="8">
                      <v-slider
                          v-model="schedule.brightness[channelIndex]"
                          :color="channel.color"
                          min="0"
                          max="100"
                          step="1"
                          density="compact"
                          hide-details
                          :disabled="!schedule.enabled"
                          @update:model-value="updateSchedule(index)"
                      />
                    </v-col>
                    <v-col cols="2" class="text-right">
                      <span class="text-caption text-white">{{ schedule.brightness[channelIndex] }}%</span>
                    </v-col>
                  </v-row>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useLampStore } from '../stores/lamp';
import { useAppStore } from '../stores/app';
import pkg from '../../package.json'
import { LampMode } from "@/stores/models.ts";
import { useRouter } from 'vue-router'
import { useDeviceStore } from "@/stores/device.ts";

const router = useRouter()

const version = pkg.version

const lampStore = useLampStore()
const appStore = useAppStore()
const deviceStore = useDeviceStore()

const chartCanvas = ref<HTMLCanvasElement>()
const currentDateTime = ref('')
const componentKey = ref(0)

const channels = [
  { name: 'Blue', color: '#2196F3' },           // Синий
  { name: 'Blue/Violet', color: '#673AB7' },    // Сине-фиолетовый
  { name: 'Blue/Green', color: '#009688' },     // Сине-зеленый (бирюзовый)
  { name: 'White', color: '#FFFFFF' },          // Белый
  { name: 'White/Yellow/Magenta', color: '#FF69B4' } // Розово-пурпурный (Hot Pink)
]

const connectionStatus = computed(() => {
  if (deviceStore.deviceInfo.connected) {
    return { text: 'Connected to ESP32', color: 'text-green' }
  }
  return { text: 'Disconnected - Check ESP32 connection', color: 'text-red' }
})

let timeInterval: NodeJS.Timeout

const debounceTimers = ref<{ [key: string]: NodeJS.Timeout }>({})

const updateDateTime = () => {
  const now = new Date()

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  currentDateTime.value = `${dateStr}, ${timeStr}`
}

const updateTimeValue = (index: number, value: string) => {
  console.log(`updateTimeValue: index=${index}, value=${value}`)

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (timeRegex.test(value)) {
    lampStore.lampState.schedules[index].from = value
    updateSchedule(index)
  }
}

const drawChart = () => {
  if (!chartCanvas.value) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  ctx.fillStyle = '#16213e'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1

  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  for (let i = 0; i <= 6; i++) {
    const x = (width / 6) * i
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  ctx.fillStyle = '#fff'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  for (let i = 0; i <= 6; i++) {
    const x = (width / 6) * i
    const hour = i * 4
    const timeLabel = `${hour}:00`  // Убрать конвертацию
    ctx.fillText(timeLabel, x, height - 5)
  }

  ctx.textAlign = 'right'
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i
    const brightness = 100 - (i * 25)
    ctx.fillText(`${brightness}%`, width - 5, y + 4)
  }

  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60
  const currentX = (currentHour / 24) * width

  ctx.strokeStyle = '#ff6b6b'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(currentX, 0)
  ctx.lineTo(currentX, height)
  ctx.stroke()
  ctx.setLineDash([])

  channels.forEach((channel, channelIndex) => {
    ctx.strokeStyle = channel.color
    ctx.lineWidth = 3
    ctx.beginPath()

    const enabledSchedules = lampStore.lampState.schedules
        .map((schedule, index) => ({ ...schedule, index }))
        .filter(schedule => schedule.enabled)
        .sort((a, b) => {
          const timeA = parseInt(a.from.split(':')[0]) * 60 + parseInt(a.from.split(':')[1])
          const timeB = parseInt(b.from.split(':')[0]) * 60 + parseInt(b.from.split(':')[1])
          return timeA - timeB
        })

    if (enabledSchedules.length > 0) {
      const schedules = [
        { time: '00:00', brightness: enabledSchedules[enabledSchedules.length - 1].brightness[channelIndex] },
        ...enabledSchedules.map(p => ({ time: p.from, brightness: p.brightness[channelIndex] })),
        { time: '24:00', brightness: enabledSchedules[0].brightness[channelIndex] }
      ]

      schedules.forEach((schedule, index) => {
        const [hours, minutes] = schedule.time.split(':').map(Number)
        const timeInHours = hours + minutes / 60
        const x = (timeInHours / 24) * width
        const y = height - (schedule.brightness / 100) * height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
    }

    ctx.stroke()
  })
}

const updateManualBrightness = (channelIndex: number, value: number) => {
  const timerKey = `manual-${channelIndex}`
  if (debounceTimers.value[timerKey]) {
    clearTimeout(debounceTimers.value[timerKey])
  }

  debounceTimers.value[timerKey] = setTimeout(async () => {
    try {
      await lampStore.setChannelBrightness(channelIndex, value)
      console.log(`Channel ${channelIndex} brightness set to ${value}%`)
    } catch (error) {
      console.error('Failed to update brightness:', error)
    }
  }, 300)
}

const updateLampMode = async (mode: LampMode) => {
  try {
    await lampStore.setLampMode(mode)
  } catch (error) {
    console.error('Failed to update lamp mode:', error)
  }
}

const updateSchedule = (index: number) => {
  const timerKey = `schedule-${index}`
  if (debounceTimers.value[timerKey]) {
    clearTimeout(debounceTimers.value[timerKey])
  }

  debounceTimers.value[timerKey] = setTimeout(async () => {
    try {
      await lampStore.updateSchedule(index, lampStore.lampState.schedules[index])
      console.log(`Schedule ${index} updated`)
    } catch (error) {
      console.error('Failed to update schedule:', error)
    }
  }, 500)
}

watch(
    () => lampStore.lampState.schedules,
    () => {
      setTimeout(() => {
        drawChart()
      }, 50)
    },
    { deep: true }
)

onMounted(() => {
  timeInterval = setInterval(updateDateTime, 1000)

  setTimeout(() => {
    drawChart()
  }, 100)

  appStore.initializeApp().then(() => {
    drawChart()
  })
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }

  Object.values(debounceTimers.value).forEach(timer => {
    if (timer) clearTimeout(timer)
  })
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  background: #16213e;
}

.sticky-row {
  position: sticky;
  top: 0;
  z-index: 2;
}
</style>
