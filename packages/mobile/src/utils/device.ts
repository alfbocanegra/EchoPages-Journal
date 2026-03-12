import DeviceInfo from 'react-native-device-info';

export async function getDeviceId(): Promise<string> {
  // Returns a unique ID for the device (persists across installs)
  return DeviceInfo.getUniqueId();
}
