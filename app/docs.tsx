import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import yaml from 'js-yaml';
import * as FileSystem from 'expo-file-system';
import { YAMLData } from '@/types/yamlData';
import { Asset } from 'expo-asset';
import { Text, View } from '@/components/Themed';

export default function ModalScreen() {
  const [yamlData, setYamlData] = useState<YAMLData | null>(null);

  // Function to load and parse the YAML file
  const loadYAMLFile = async () => {
    try {
      const asset = Asset.fromModule(require('../assets/LED.yml'));
      await asset.downloadAsync(); // Ensure it's downloaded

      // Read the YAML file from the downloaded asset
      const fileContent = await FileSystem.readAsStringAsync(asset.localUri || '');
      const parsedData = yaml.load(fileContent) as YAMLData;
      setYamlData(parsedData);
    } catch (error) {
      console.error('Error loading YAML file:', error);
    }
  };

  useEffect(() => {
    loadYAMLFile();
  }, []);

  // Helper function to render each section of the YAML
  const renderSection = (title: string, data: Record<string, string[]>) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {Object.entries(data).map(([key, values]) => (
        <View key={key} style={styles.subSection}>
          <Text style={styles.key}>{key}</Text>
          {values.map((value, index) => (
            <Text key={index} style={styles.value}>- {value}</Text>
          ))}
        </View>
      ))}
    </View>
  );

  if (!yamlData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading YAML data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderSection('Expressions', yamlData.context.expressions)}
      {renderSection('Slots', yamlData.context.slots)}
      {renderSection('Macros', yamlData.context.macros)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subSection: {
    marginBottom: 10,
  },
  key: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a90e2',
  },
  value: {
    fontSize: 16,
    marginLeft: 10,
  },
});