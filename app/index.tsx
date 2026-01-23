import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { secureStoreService } from '../src/services/secure-store-service';

export default function Index() {
  const [apiKey, setApiKey] = useState('');
  const [storedKey, setStoredKey] = useState<string | null>(null);

  const saveKey = async () => {
    try {
      await secureStoreService.saveApiKey(apiKey);
      console.log('Saved');
    } catch (e) {
      console.error(e);
    }
  };

  const getKey = async () => {
    try {
      const key = await secureStoreService.getApiKey();
      setStoredKey(key);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteKey = async () => {
    try {
      await secureStoreService.deleteApiKey();
      setStoredKey(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <TextInput
        placeholder="Enter API Key"
        value={apiKey}
        onChangeText={setApiKey}
        style={{ borderWidth: 1, padding: 10, width: 200 }}
      />
      <Button title="Save Key" onPress={saveKey} />
      <Button title="Get Key" onPress={getKey} />
      <Button title="Delete Key" onPress={deleteKey} />
      {storedKey && <Text>Stored Key: {storedKey}</Text>}
    </View>
  );
}
