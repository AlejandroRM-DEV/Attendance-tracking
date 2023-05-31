import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const registry = (type, curp) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "curp": curp,
      "tipo": type,
      "fecha": new Date().toISOString()
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("https://XXXXXXXXXXXXXX.firebaseio.com/bitacora.json", requestOptions)
      .then(response => response.text())
      .then(result => console.log("TO DO"))
      .catch(error => console.log('error', error));
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    Alert.alert('REGISTRAR', data, [
      {
        text: 'SALIDA',
        onPress: () => registry('SALIDA', data)
      },
      {
        text: 'ENTRADA',
        onPress: () => registry('ENTRADA', data)
      },
    ]);
  };

  if (hasPermission === null) {
    return <Text>Solicitando permido de cámara</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'TOCA PARA ESCANEAR'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
