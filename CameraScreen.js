import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Alert, Text, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { Button, Overlay, Divider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios'; // Axios'u import edin

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [image, setImage] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.takePictureAsync(options);
      setImage(data.uri);
      setOverlayVisible(true);
    }
  };

  const uploadImage = async () => {
    if (!image) return;
    let formData = new FormData();
    formData.append('photo', {
      uri: image,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    try {
      const startTime = new Date(); // İşlem başlangıç zamanı

      await axios.post('http://18.232.115.155:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const endTime = new Date(); // İşlem bitiş zamanı
      const duration = endTime - startTime; // Milisaniye cinsinden süre

      Alert.alert("Success", `Image uploaded successfully!\nResponse time: ${duration} ms`);
      setOverlayVisible(false); // Hide overlay after uploading
    } catch (error) {
      console.error(error);
      Alert.alert("Error", `Failed to upload image. ${error}`);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <View style={styles.center}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Capture & Upload</Text>
      <Camera style={styles.camera} ref={setCameraRef} />
      <Button
        icon={<Icon name="camera" size={20} color="white" />}
        title=" Take Picture"
        onPress={takePicture}
        buttonStyle={styles.button}
      />
      <Overlay isVisible={overlayVisible} onBackdropPress={() => setOverlayVisible(false)}>
        <View style={styles.overlay}>
          <Text style={styles.overlayHeaderText}>Photo Preview</Text>
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}
          <Divider style={styles.divider} />
          <Button
            icon={<Icon name="upload" size={20} color="white" />}
            title=" Upload Image"
            onPress={uploadImage}
            buttonStyle={styles.button}
          />
        </View>
      </Overlay>
    </View>
  );
}

// Ekran boyutlarını al
const { width: screenWidth } = Dimensions.get('window');


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  camera: {
    width: screenWidth, // Ekran genişliğine eşit genişlik
    height: screenWidth * 4 / 3, // 4:3 oranında bir yükseklik (veya ihtiyacınıza göre ayarlayın)
  },
  button: {
    backgroundColor: '#2089dc',
    borderRadius: 20,
    marginVertical: 10,
  },
  previewImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  overlay: {
    padding: 20,
    alignItems: 'center',
  },
  overlayHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  divider: {
    backgroundColor: 'blue',
    height: 2,
    width: '80%',
    marginVertical: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
