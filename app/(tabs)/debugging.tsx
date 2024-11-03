import { StyleSheet, TextInput } from 'react-native';

import { Button } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import Tts from 'react-native-tts';
import { API_URL, setAPIUrl, testAPI } from '@/lib/apiUtils';
import { connectToDevice, scanAndConnect, setBleAddr, DEVICE_MAC_ADDRESS } from '@/lib/bleUtils';
import { startHotwordDetection } from '@/lib/voiceUtils';
import { useAppContext } from '@/contexts/appContext';

export default function TabTwoScreen() {
  const { isConnectedBLE, setIsConnectedBLE, isAPIReady, setIsAPIReady, porcupineManager } = useAppContext();

  return (
    <View style={styles.container}>
      <Button title='Start hotword' onPress={() => startHotwordDetection(porcupineManager)} />
      <Button title='Scan BLE' onPress={() =>  scanAndConnect(setIsConnectedBLE)} />
      <Button title='Connect to device' onPress={() => connectToDevice(setIsConnectedBLE)}/>
      <Button title='Test API' onPress={() => testAPI().then(() => setIsAPIReady(true))}/>
      <Button title='Test TTS' onPress={() => Tts.getInitStatus().then(() => Tts.setDefaultLanguage('fr-FR')).catch((error: any) => console.error('Tts error: ' + error))}/>
      <Text>API URL: {API_URL}</Text>
      <TextInput style={{backgroundColor:"white", height:50, width:200}} placeholder='Custom API URL' onChangeText={(text) => setAPIUrl(text)}/>
      <Text>BLE Address: {DEVICE_MAC_ADDRESS}</Text>
      <TextInput style={{backgroundColor:"white", height:50, width:200}} placeholder='Custom BLE ADDR' onChangeText={(text) => setBleAddr(text)}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
