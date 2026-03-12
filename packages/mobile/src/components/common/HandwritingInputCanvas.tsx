import React, { useRef } from 'react';
import { View, Button, StyleSheet, Platform, Alert } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';

interface HandwritingInputCanvasProps {
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
}

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 240;

const HandwritingInputCanvas: React.FC<HandwritingInputCanvasProps> = ({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  penColor = '#222',
  backgroundColor = '#fff',
}) => {
  const ref = useRef<any>(null);

  const handleOK = (signature: string) => {
    // signature is a base64 PNG
    Alert.alert('Exported', 'Handwriting exported as PNG (base64).');
    // You can handle the PNG data here
  };

  const handleClear = () => {
    ref.current?.clearSignature();
  };

  const handleUndo = () => {
    ref.current?.undo();
  };

  const handleRedo = () => {
    ref.current?.redo();
  };

  const handleExport = () => {
    ref.current?.readSignature();
  };

  return (
    <View style={styles.container}>
      <SignatureCanvas
        ref={ref}
        penColor={penColor}
        backgroundColor={backgroundColor}
        webStyle={`.m-signature-pad {box-shadow: none; border: none;} .m-signature-pad--footer {display: none;}`}
        onOK={handleOK}
        autoClear={false}
        descriptionText="Draw here"
        style={{ width, height, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', backgroundColor }}
      />
      <View style={styles.buttonRow}>
        <Button title="Undo" onPress={handleUndo} accessibilityLabel="Undo" />
        <Button title="Redo" onPress={handleRedo} accessibilityLabel="Redo" />
        <Button title="Clear" onPress={handleClear} accessibilityLabel="Clear" />
        <Button title="Export as PNG" onPress={handleExport} accessibilityLabel="Export as PNG" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 8 },
});

export default HandwritingInputCanvas; 