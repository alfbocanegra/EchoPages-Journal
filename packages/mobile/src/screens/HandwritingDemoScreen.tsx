import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import HandwritingInputCanvas from '../components/common/HandwritingInputCanvas';

const HandwritingDemoScreen: React.FC = () => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.heading}>Handwriting Input Demo</Text>
    <Text style={styles.instructions}>
      Draw with your finger or stylus. Use the Undo, Redo, Clear, and Export buttons below the canvas.
    </Text>
    <HandwritingInputCanvas width={340} height={260} />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', backgroundColor: '#f3f3f3', paddingTop: 32 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  instructions: { fontSize: 16, color: '#555', marginBottom: 20, textAlign: 'center', maxWidth: 340 },
});

export default HandwritingDemoScreen; 