import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { setupVoiceRecognition, handleSpeechResults, startHotwordDetection, setupPorcupineRhino, cleanupConnections } from '@/lib/voiceUtils';
import { scanAndConnect, sendDataWithDelay } from '@/lib/bleUtils';
import { handleAndroidPermissions } from '@/lib/permissionsUtils';
import { LogEntry } from '@/types/logEntry';
import { SpeechResultsEvent } from '@react-native-voice/voice';
import { RhinoManager } from '@picovoice/rhino-react-native';
import Tts from 'react-native-tts';
import { testAPI } from '@/lib/apiUtils';
import { useAppContext } from '@/contexts/appContext';
import { colorMapping } from '@/lib/apiUtils';

const ACCESS_KEY = process.env.EXPO_PUBLIC_ACCESS_KEY ?? "";

export default function TabOneScreen() {
  const [data, setData] = useState('');
  const [isText, setIsText] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const rhinoManager = useRef<RhinoManager | null>(null);
  const { isConnectedBLE, setIsConnectedBLE, isAPIReady, setIsAPIReady, porcupineManager } = useAppContext();
  const [color, setColor] = useState('white');

  const colorRef = useRef(color);

  useEffect(() => {
    colorRef.current = color;
    console.log('Color changed to ' + color);
  }, [color]);

  useEffect(() => {
    console.log("Starting setup for TabOneScreen");
    
    const oldConsoleLog = console.log;
    const oldConsoleError = console.error;

    console.log = (...args) => {
      addLog('log', args.join(' '));
      oldConsoleLog(...args);
    };

    console.error = (...args) => {
      addLog('error', args.join(' '));
      oldConsoleError(...args);
    };

    const addLog = (type: string, log: string) => {
      setLogs(prevState => [...prevState.slice(-8), { type, log }]);
    };

    handleAndroidPermissions();
    Tts.getInitStatus().then(() => Tts.setDefaultLanguage('fr-FR'))
      .catch((error: any) => console.error('Tts error: ' + error));
    setupVoiceRecognition(onSpeechResultsHandler);
    scanAndConnect(setIsConnectedBLE);
    setupPorcupineRhino(porcupineManager, rhinoManager, ACCESS_KEY, setColor, onMessage);
    testAPI().then(() => setIsAPIReady(true));

    return () => cleanupConnections(porcupineManager, rhinoManager);
  }, []);

  const onSpeechResultsHandler = (e: SpeechResultsEvent) => {
    const currentColor = colorRef.current;
    handleSpeechResults(e, currentColor, setData, setIsText, onMessage);
    startHotwordDetection(porcupineManager);
  };

  const onMessage = (data: string[], file = '') => {
    sendDataWithDelay(data, 0);
    if (file) {
      setIsText(false);
      setData(file);
    }
    startHotwordDetection(porcupineManager);
  };

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 20}}>
        <Text style={{color:'white'}}>API Status: <Text style={{ color: isAPIReady ? 'green' : 'red' }}>{isAPIReady ? 'Connected' : 'Disconnected'}</Text></Text>
        <Text style={{color:'white'}}>BLE Status: <Text style={{ color: isConnectedBLE ? 'green' : 'red' }}>{isConnectedBLE ? 'Connected' : 'Disconnected'}</Text></Text>
      </View>
      <View>
        {isText ? <Text style={[styles.text, {color: colorMapping[color]}]}>{data.toUpperCase()}</Text> : <Image source={{ uri: `data:image/png;base64,${data}` }} style={{ width: 384, height: 64 }} />}
      </View>
      <View>
        {logs.map((logEntry, index) => (
          <View key={index.toString() + logEntry.log}>
            <Text style={logEntry.type === 'error' ? styles.errorText : {color:"white"}}>{logEntry.log}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap:50,
    backgroundColor: '#000000',
  },
  errorText: { color: 'red' },
  text: { fontSize: 70 },
});
