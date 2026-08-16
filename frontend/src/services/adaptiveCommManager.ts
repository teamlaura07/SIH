import type { NetworkStatus } from '../types/incident';

export interface CommChannelStatus {
  id: string;
  name: string;
  type: 'PRIMARY_INTERNET' | 'LOCAL_INDEXEDDB' | 'LORA_GATEWAY' | 'BLE_MESH_RELAY';
  active: boolean;
  signalQuality: string;
  description: string;
  latencyMs: number;
}

export class AdaptiveCommunicationManager {
  private networkStatus: NetworkStatus = 'ONLINE';

  setNetworkStatus(status: NetworkStatus) {
    this.networkStatus = status;
  }

  getAvailableChannels(): CommChannelStatus[] {
    const isOnline = this.networkStatus === 'ONLINE';
    const isWeak = this.networkStatus === 'WEAK';

    return [
      {
        id: 'CH-INTERNET',
        name: 'Cellular / Wi-Fi Internet Gateway',
        type: 'PRIMARY_INTERNET',
        active: isOnline || isWeak,
        signalQuality: isOnline ? 'High (4G/5G)' : isWeak ? 'Low (2G/EDGE)' : 'Disconnected',
        description: 'Direct REST API & WebSocket synchronization with Central Control Room',
        latencyMs: isOnline ? 120 : 1450
      },
      {
        id: 'CH-INDEXEDDB',
        name: 'Local IndexedDB Storage & Sync Queue',
        type: 'LOCAL_INDEXEDDB',
        active: true,
        signalQuality: 'Internal Storage (100%)',
        description: 'Zero-latency local persistence for Emergency Data Capsules and telemetry logs',
        latencyMs: 2
      },
      {
        id: 'CH-LORA-HW',
        name: 'LoRa 868MHz Gateway (Hardware Extension)',
        type: 'LORA_GATEWAY',
        active: true,
        signalQuality: 'Sub-GHz Mesh (Simulated)',
        description: 'Hardware Extension – Long-range low-power RF broadcast to forest ranger repeaters',
        latencyMs: 380
      },
      {
        id: 'CH-BLE-MESH',
        name: 'BLE Tourist Peer Mesh Relay',
        type: 'BLE_MESH_RELAY',
        active: true,
        signalQuality: 'Short-Range Peer-to-Peer',
        description: 'Hardware Extension – Relays data capsule via nearby connected tourist devices',
        latencyMs: 650
      }
    ];
  }

  getActivePrimaryPath(): string {
    if (this.networkStatus === 'ONLINE') {
      return 'Direct Internet REST/WS Protocol';
    }
    if (this.networkStatus === 'WEAK') {
      return 'Throttled Packet Sync Queue (Weak Cellular)';
    }
    return 'Offline Local Encrypted Capsule Storage -> Auto Sync Queue';
  }
}

export const commManager = new AdaptiveCommunicationManager();
