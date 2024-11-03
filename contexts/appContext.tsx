import React, { createContext, useContext, useState, useRef } from 'react';
import { PorcupineManager } from '@picovoice/porcupine-react-native';

type AppContextType = {
  isConnectedBLE: boolean;
  setIsConnectedBLE: (value: boolean) => void;
  isAPIReady: boolean;
  setIsAPIReady: (value: boolean) => void;
  porcupineManager: React.MutableRefObject<PorcupineManager | null>;
};

interface Props {
    children: React.ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: Props) => {
  const [isConnectedBLE, setIsConnectedBLE] = useState(false);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const porcupineManager = useRef<PorcupineManager | null>(null);

  return (
    <AppContext.Provider value={{ isConnectedBLE, setIsConnectedBLE, isAPIReady, setIsAPIReady, porcupineManager }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};