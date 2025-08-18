import { ref } from 'vue';
import { useOneWireDeviceStore } from '@/stores/one_wire_device';
import { OneWireDeviceScanResult } from '@/stores/models';

export function useOneWireDeviceScanner() {
  const oneWireDeviceStore = useOneWireDeviceStore();
  const scanning = ref<boolean>(false);
  const devices = ref<string[]>([]);
  const scanStatus = ref<string>(''); // New variable to track scan status

  const startScan = async () => {
    if (scanning.value) return; // Prevent multiple activations

    scanning.value = true;
    scanStatus.value = 'Scanning...';
    const startTime = Date.now();

    const pollScanResults = async () => {
      while (Date.now() - startTime < 30000) { // Limit to 30 seconds
        const result: OneWireDeviceScanResult = await oneWireDeviceStore.scanOneWireDevices();

        if (result.inProgress) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        } else if (result.isReady) {
          devices.value = result.devices;
          scanStatus.value = `Found ${result.devices.length} devices.`;
          scanning.value = false;
          return;
        } else {
          await oneWireDeviceStore.startScanOneWireDevices();
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before rechecking
        }
      }

      scanStatus.value = 'Scan failed or timed out.';
      scanning.value = false; // Stop scanning after timeout
    };

    await pollScanResults();
  };

  return {
    scanning,
    devices,
    scanStatus,
    startScan
  };
}
