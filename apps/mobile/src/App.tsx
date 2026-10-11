import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';

const scanModes = [
  { id: 'live', label: 'Live camera scan' },
  { id: 'video', label: 'Preset video' },
  { id: 'images', label: 'Image set' },
];

const recentProjects = [
  { name: 'Plant A - Compressor hall', status: 'Ready for texturing', percent: 82 },
  { name: 'Packaging line 3', status: 'Scan in progress', percent: 48 },
  { name: 'Water treatment intake', status: 'Training export ready', percent: 96 },
];

export default function App() {
  const handleAction = (mode: string) => {
    Alert.alert('Capture mode selected', `${mode} capture workflow started.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerWrap}>
          <Text style={styles.kicker}>Industrial digital twin</Text>
          <Text style={styles.title}>Mobile scan studio</Text>
          <Text style={styles.subtitle}>
            Capture plant spaces, reconstruct textured 3D scenes, and prepare training simulations.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start a new capture</Text>
          {scanModes.map((mode) => (
            <Pressable
              key={mode.id}
              style={styles.primaryButton}
              onPress={() => handleAction(mode.label)}
            >
              <Text style={styles.primaryButtonText}>{mode.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent projects</Text>
          {recentProjects.map((project) => (
            <View key={project.name} style={styles.projectRow}>
              <View style={styles.projectMeta}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectStatus}>{project.status}</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${project.percent}%` }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scene export targets</Text>
          <View style={styles.tagRow}>
            <Text style={styles.tag}>glTF</Text>
            <Text style={styles.tag}>USDZ</Text>
            <Text style={styles.tag}>Gaussian Splat</Text>
            <Text style={styles.tag}>AR / VR</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071522',
  },
  container: {
    padding: 20,
    gap: 18,
  },
  headerWrap: {
    marginTop: 12,
  },
  kicker: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 10,
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#0f1d2d',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#eff6ff',
    textAlign: 'center',
    fontWeight: '700',
  },
  projectRow: {
    marginBottom: 14,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectName: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  projectStatus: {
    color: '#7dd3fc',
    fontSize: 12,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 999,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
});
