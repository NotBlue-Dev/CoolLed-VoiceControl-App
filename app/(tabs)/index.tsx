import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import BleManager from 'react-native-ble-manager';
import { Buffer } from 'buffer';
import { RhinoManager } from '@picovoice/rhino-react-native';
import {
  BuiltInKeywords,
  PorcupineManager,
} from '@picovoice/porcupine-react-native';
import { formatDataForWebSocket } from '@/lib/speechUtils';
import { findClosestWithoutJecoute } from '@/lib/textUtils';
import { handleAndroidPermissions } from '@/lib/permissionsUtils'
import { useRef } from 'react';

const ACCESS_KEY = process.env.EXPO_PUBLIC_ACCESS_KEY ?? "";
type LogEntry = { type: string; log: string };

export default function TabOneScreen() {
  const [color, setColor] = useState('blanc');
  const [data, setData] = useState('');
  const [isText, setIsText] = useState(false);
  const [needRender, setNeedRender] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]); // Update state type to LogEntry[]
  
  const porcupineManager = useRef<PorcupineManager | null>(null);
  const rhinoManager = useRef<RhinoManager | null>(null);

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

    setupVoiceRecognition();

    handleAndroidPermissions();

    scanAndConnect();

    // Start voice recognition and hotword detection
    setupPorcupineRhino();

    // Cleanup
    return () => {
      cleanupConnections();
    };
  }, []);

  const setupVoiceRecognition = () => {
    console.log("Setup voice recognitions");
    Voice.onSpeechStart = onSpeechStartHandler;
    Voice.onSpeechEnd = onSpeechEndHandler;
    Voice.onSpeechResults = onSpeechResultsHandler;
  };

  const onSpeechStartHandler = (e: any) => {
    console.log('onSpeechStart: ', e);
  };

  const onSpeechEndHandler = (e: any) => {
    console.log('onSpeechEnd: ', e);
    Voice.stop().then(() => startHotwordDetection());
  };

  const onSpeechResultsHandler = (e: SpeechResultsEvent) => {
    console.log('onSpeechResults: ', e);
    Voice.stop().then(() => {
      Tts.getInitStatus().then(() => {
        const txt = e.value;
        const result = findClosestWithoutJecoute(txt); // Assuming you have this utility
        if (result === null) {
          Tts.speak("Je n'ai pas compris");
        } else {
          Tts.speak("J'écris " + result + ' en ' + color);
          setIsText(true);
          setData(result);
          setNeedRender(true);
          //TODO: API Call
          //sendMessage(formatDataForWebSocket('Write', result.toUpperCase(), color));
        }
        startHotwordDetection();
      });
    });
  };

  const startHotwordDetection = () => {
    if (porcupineManager.current) {
      porcupineManager.current
        .start()
        .then(() => console.log('Porcupine hotword detection started'))
        .catch(error => console.error('Porcupine error: ' + error));
    } else {
      console.error("PorcupineManager is not defined");
    }
  };

  const setupPorcupineRhino = async () => {
    try {
      await PorcupineManager.fromBuiltInKeywords(
        ACCESS_KEY,
        [BuiltInKeywords.JARVIS],
        detectionCallback
      ).then(porcupine => {
        porcupineManager.current = porcupine;
        console.log('Porcupine started');
        startHotwordDetection();
      }).catch((e) => {
        console.error("Porcupine couldn't be started: " + e);
      })

      await RhinoManager.create(
        ACCESS_KEY,
        'VCL_fr_android_v3_0_0.rhn',
        inferenceCallback,
        processorErrorCallBack,
        'rhino_params_fr.pv'
      ).then(rhino => {
        rhinoManager.current = rhino;
        console.log('Rhino started');
      })
      .catch(e => {
        console.error("Rhino couldn't be started: " + e);
      });

    } catch (error) {
      console.error("Error starting Porcupine or Rhino: " + error);
    }
  };

  const processorErrorCallBack = (error: any) => {
    console.error('Rhino error: ' + error);
  };

  const inferenceCallback = (inference: any) => {
    if (inference.isUnderstood) {
      const intent = inference.intent;
      const slots = inference.slots;
      if (intent === 'Write') {
        if(porcupineManager.current) {
          porcupineManager.current.stop().then(() => {
            setColor(slots.couleur || 'blanc');
            Tts.speak("J'écoute");
            Voice.start('fr-FR');
          });
        }
      } else {
        if (slots) {
          for (let slotName in slots) {
            let slotValue = slots[slotName];
            Tts.speak(`${slotName}:${slotValue}`);
            //TODO: API CALL
            //sendMessage(formatDataForWebSocket(intent, slotValue));
          }
        }
      }
    } else {
      Tts.speak("Je n'ai pas compris");
    }
  };

  const startRhino = async () => {
    if(rhinoManager.current) {
      await rhinoManager.current.process();
      console.log('Rhino started');
    }
  };

  const detectionCallback = (keywordIndex: number) => {
    if (keywordIndex === 0) {
      console.log('detected jarvis');
      Tts.speak('Oui?');
      setTimeout(() =>  {
        startRhino().then().catch(error => {
          console.error('Rhino error: ' + error);
        })
      }, 600);
    } else {
      console.log('detected unknown keyword');
    }
  };

  const scanAndConnect = () => {
    BleManager.scan(['0000fff0-0000-1000-8000-00805f9b34fb'], 5, true)
      .then(() => BleManager.connect('FF:00:00:02:E6:AA'))
      .then(() => BleManager.retrieveServices('FF:00:00:02:E6:AA'))
      .catch(error => {
        console.error('Error connecting BLE: ' + error)
        setTimeout(() => {
          scanAndConnect();
        }, 5000)
      });
  };

  const sendDataWithDelay = (data: string[], index: number) => {
    if (index < data.length) {
      BleManager.writeWithoutResponse(
        'FF:00:00:02:E6:AA',
        '0000fff0-0000-1000-8000-00805f9b34fb',
        '0000fff1-0000-1000-8000-00805f9b34fb',
        Buffer.from(data[index], 'base64').toJSON().data
      )
        .then(() => console.log('Data sent'))
        .catch(error => console.error('Error sending data: ' + error));
      setTimeout(() => sendDataWithDelay(data, index + 1), 200);
    }
  };

  const addLog = (type: string, log: string) => {
    setLogs(prevState => [
      ...prevState.slice(-4), 
      { type, log }
    ]);
  };

  const onMessage = (data: string[], file = '') => {
    console.log("Processing message with data:", data, "and file:", file);
    sendDataWithDelay(data, 0);
    if (file) {
      setIsText(false);
      setData(file);
      setNeedRender(true);
    }
    startHotwordDetection();
  };

  const test = () => {
    console.log("Starting test function");
    onMessage(["AQCIAgYAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAD/4P/gBgAGAAYABgAGAAYA/+D7UD","AQCIAgYAAAAAAID+AAAAAAAwAPwCBf4CBbYCBbcCBbcCBbYCBfYA9AAAAAAf/h/+AAAAAAAAH/4f/gAAAAAP/g/+AGAAYABgAGAAYABgD/4P/gAAAAAAMAD8AgX+AgW2AgW3AgW3AgW2AgX2APQAAAAAH/4f/gAAAAAAAB/+H/4AAAAAD/4P/gBgAGAAYABgAGAAYA/+D4AD","AQAzAgYAAAAAACv+AAAAAAAwAPwCBf4CBbYCBbcCBbcCBbYCBfYA9AAAAAAf/h/+AAAAAAAAH/4f/gAA5QM="]);
  }

  const cleanupConnections = () => {
    console.log("Cleaning up connections");
    if(porcupineManager.current) {
      porcupineManager.current?.stop().catch(error => console.error("Error stopping Porcupine: " + error));
    }
    BleManager.disconnect('FF:00:00:02:E6:AA').catch(error => console.error('Error disconnecting BLE: ' + error));
  };

  return (
    <View style={styles.container}>
      {needRender && (
        <View style={styles.box}>
          {isText ? (
            <Text style={styles.text}>{data.toUpperCase()}</Text>
          ) : (
            <Image
              source={{ uri: `data:image/png;base64,${data}` }}
              style={{ width: 384, height: 64, backgroundColor: 'red' }}
            />
          )}
        </View>
      )}
      <View>
        {/* Display logs */}
        {logs.map((logEntry, index) => (
          <Text key={index} style={logEntry.type === 'error' ? styles.errorText : null}>
            {logEntry.log}
          </Text>
        ))}
      </View>
      <Button title="Test" onPress={() => test()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    color: 'red',
  },
  box: {
    marginBottom: 10,
  },
  text: {
    color: '#ffffff',
    fontSize: 70,
  },
});
