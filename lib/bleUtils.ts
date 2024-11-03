import BleManager from 'react-native-ble-manager';
import { Buffer } from 'buffer';

const serviceUUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const characteristicUUID = '0000fff1-0000-1000-8000-00805f9b34fb';
export let DEVICE_MAC_ADDRESS = process.env.EXPO_PUBLIC_DEVICE_MAC_ADDRESS ?? "";
let dynamicBleAddr: string | undefined; // Variable to hold the dynamic API URL


export const setBleAddr = (url: string) => {
  dynamicBleAddr = url;
  DEVICE_MAC_ADDRESS = dynamicBleAddr ?? process.env.EXPO_PUBLIC_DEVICE_MAC_ADDRESS ?? "";
};

export const scanAndConnect = (setIsConnectedBLE: (isConnected: boolean) => void) => {
  console.log("start scan for:" + DEVICE_MAC_ADDRESS);

  BleManager.enableBluetooth();

  BleManager.scan([serviceUUID], 5, true)
  .then()
  .catch(error => {
    console.error(error, "Error scanning for devices");
    setIsConnectedBLE(false);
    setTimeout(() => scanAndConnect(setIsConnectedBLE), 5000);
  });

  BleManager.connect(DEVICE_MAC_ADDRESS)
    .then(() => {
      console.log('Connected');
      BleManager.retrieveServices(DEVICE_MAC_ADDRESS)
        .then(() => {
          console.log('Retrieved services, Done');
          setIsConnectedBLE(true);
        })
        .catch(error => {
          console.error(error, "Error retrieving services");
          setIsConnectedBLE(false);
          setTimeout(() => scanAndConnect(setIsConnectedBLE), 5000);
        });
    })
    .catch(error => {
      console.error(error, "Error connecting to device");
      setIsConnectedBLE(false);
      setTimeout(() => scanAndConnect(setIsConnectedBLE), 5000);
    });
};

export const connectToDevice = (setIsConnectedBLE: (isConnected: boolean) => void) => {
  BleManager.connect(DEVICE_MAC_ADDRESS)
    .then(() => {
      BleManager.retrieveServices(DEVICE_MAC_ADDRESS).then(() => {
        console.log('Services retrieved and connected');
        setIsConnectedBLE(true);
      }).catch(error => console.error('Error retrieving services: ' + error));
    })
    .catch(error => console.error('Error connecting to device: ' + error));
}

export const sendDataWithDelay = (data: string[], index: number) => {
  if (index < data.length) {
    BleManager.writeWithoutResponse(
      DEVICE_MAC_ADDRESS,
      serviceUUID,
      characteristicUUID,
      Buffer.from(data[index], 'base64').toJSON().data
    ).then(() => console.log('Data sent'))
    .catch(error => console.error('Error sending data: ' + error));
    setTimeout(() => sendDataWithDelay(data, index + 1), 200);
  }
};
