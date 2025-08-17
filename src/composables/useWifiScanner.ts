import { ref } from 'vue';
import { useWifiStore } from '@/stores/wifi';
import { WifiNetwork, WifiScanResult } from '@/stores/models';

export function useWifiScanner() {
  const wifiStore = useWifiStore();
  const scanning = ref<boolean>(false);
  const networks = ref<WifiNetwork[]>([]);
  const scanStatus = ref<string>(''); // New variable to track scan status

  const startScan = async () => {
    if (scanning.value) return; // Prevent multiple activations

    scanning.value = true;
    scanStatus.value = 'Scanning...';
    const startTime = Date.now();

    const pollScanResults = async () => {
      while (Date.now() - startTime < 30000) { // Limit to 30 seconds
        const result: WifiScanResult = await wifiStore.scanWifiNetworks();
        const lastUpdated = new Date(result.lastUpdatedAt); // Convert to Date object
        const now = new Date();
        const isRecent = (now.getTime() - lastUpdated.getTime()) / 1000 <= 30;

        if (result.scanning) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        } else if (isRecent) {
          networks.value = result.networks;
          scanStatus.value = `Found ${result.networks.length} networks.`;
          scanning.value = false;
          return;
        } else {
          await wifiStore.startScanWifiNetworks();
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
    networks,
    scanStatus,
    startScan
  };
}
