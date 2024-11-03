import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { PorcupineManager, BuiltInKeywords } from '@picovoice/porcupine-react-native';
import { RhinoManager } from '@picovoice/rhino-react-native';
import { findClosestWithoutJecoute } from '@/lib/textUtils';
import BleManager from 'react-native-ble-manager';
import { sendMessage, formatDataForAPI } from '@/lib/apiUtils';

const DEVICE_MAC_ADDRESS = process.env.EXPO_PUBLIC_DEVICE_MAC_ADDRESS ?? "";

export const setupVoiceRecognition = (onSpeechResultsHandler: (e: SpeechResultsEvent) => void) => {
  console.log("Setting up voice recognition");
  Voice.onSpeechStart = (e: any) => console.log('onSpeechStart:', e);
  Voice.onSpeechEnd = (e: any) => console.log('onSpeechEnd:', e);
  Voice.onSpeechResults = onSpeechResultsHandler;
};

export const handleSpeechResults = (e: SpeechResultsEvent, color: string, setData: any, setIsText: any, callback: (data: string[], file?: string) => void) => {
  const txt = e.value;
  const result = findClosestWithoutJecoute(txt);
  if (result === null) {
    Tts.speak("Je n'ai pas compris");
  } else {
    Tts.speak("J'écris " + result + ' en ' + color);
    sendMessage(
      formatDataForAPI(
        'Write',
        result.toUpperCase(),
        color,
      ),
    ).then((response) => {
      setIsText(true);
      setData(result);
      callback(response.bytes);
    });
  }
};

export const startHotwordDetection = (porcupineManager: any) => {
  if (porcupineManager.current) {
    porcupineManager.current.start().then(() => console.log('Porcupine hotword detection started')).catch((error:string) => console.error('Porcupine error: ' + error));
  } else {
    console.error("PorcupineManager is not defined");
  }
};

const processorErrorCallBack = (error: any) => {
    console.error('Rhino error: ' + error);
};

const startRhino = async (rhinoManager:any) => {
    if(rhinoManager.current) {
      await rhinoManager.current.process();
      console.log('Rhino started');
    }
};

export const setupPorcupineRhino = async (porcupineManager: any, rhinoManager: any, accessKey: string, setColor: any, callback: (data: string[], file?: string) => void) => {
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
                sendMessage(formatDataForAPI(intent, slotValue))
                .then(response => {
                  if (response.file) {
                    callback(response.bytes, response.file);
                  } else {
                    callback(response.bytes);
                  }                  
                }).catch((error) => {
                  console.error('Error sending message:', error);
                });
              }
            }
          }
        } else {
          Tts.speak("Je n'ai pas compris");
        }
    };

    const detectionCallback = (keywordIndex: number) => {
        if (keywordIndex === 0) {
          console.log('detected jarvis');
          Tts.speak('Oui?');
          setTimeout(() =>  {
            startRhino(rhinoManager).then().catch(error => {
              console.error('Rhino error: ' + error);
            })
          }, 600);
        } else {
          console.log('detected unknown keyword');
        }
    };
  
    try {
        await PorcupineManager.fromBuiltInKeywords(
            accessKey,
            [BuiltInKeywords.JARVIS],
            detectionCallback
        ).then(porcupine => {
            porcupineManager.current = porcupine;
            console.log('Porcupine started');
            startHotwordDetection(porcupineManager);
        }).catch((e) => {
            console.error("Porcupine couldn't be started: " + e);
        })

        await RhinoManager.create(
            accessKey,
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
        console.error("Error setting up Porcupine or Rhino:", error);
    }
};

export const cleanupConnections = (porcupineManager: any, rhinoManager: any) => {
  if (porcupineManager.current) {
    porcupineManager.current.stop().catch((error:string) => console.error("Error stopping Porcupine: " + error));
  }
  if (rhinoManager.current) {
    rhinoManager.current.delete().catch((error:string) => console.error("Error deleting Rhino: " + error));
  }
  BleManager.disconnect(DEVICE_MAC_ADDRESS).catch((error:string) => console.error('Error disconnecting BLE: ' + error));
};
