import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import AppView from './src/components/AppView';
import NavBar from './src/components/NavBar';
import { KeyStoreContext } from './src/contexts/KeyStore';
import { HistoryContext, HistoryType } from './src/contexts/HistoryContext';
import { KeyStoreType } from './src/types/keytypes';
import { useFonts, loadAsync } from 'expo-font';
import { StorageContext, StorageType } from './src/contexts/StorageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { allowScreenCaptureAsync, preventScreenCaptureAsync } from 'expo-screen-capture';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Manrope': require('./src/fonts/regular.otf'),
    'Manrope-Bold': require('./src/fonts/bold.otf'),
  });

  const keyStore = useState<KeyStoreType[]>([]);
  const [history, setHistory] = useState<HistoryType[]>([{ page: "SANDOOKS" }]);
  const [storage, setStorage] = useState<StorageType | null>(null);

  const backAction = () => {
    setHistory((h) => {
      if (h.length > 1) {
        return h.slice(0, h.length - 1);
      } else {
        console.log("Exiting app");
        BackHandler.exitApp();
        return h;
      }
    });
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction);
    getStorage();
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [])

  const getStorage = async () => {
    const storage = await AsyncStorage.getItem("storage");
    if (storage) {
      setStorage(JSON.parse(storage));
    } else {
      setStorage({
        settings: {
          allowScreenCapture: false,
          showThumbnails: true,
        }
      });
    }
  }

  useEffect(() => {
    if (storage) {
      AsyncStorage.setItem("storage", JSON.stringify(storage));
      if (storage.settings.allowScreenCapture) {
        allowScreenCaptureAsync();
      } else {
        preventScreenCaptureAsync();
      }
    }
  }, [storage])

  return (
    <View style={styles.main}>
      {fontsLoaded && (
        <>
          <StatusBar style="light" />
          <StorageContext.Provider value={[storage, setStorage]}>
            <HistoryContext.Provider value={[history, setHistory]}>
              <KeyStoreContext.Provider value={keyStore}>
                <AppView />
                <NavBar />
              </KeyStoreContext.Provider>
            </HistoryContext.Provider>
          </StorageContext.Provider>

        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  main: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    backgroundColor: '#000',
  }
});
