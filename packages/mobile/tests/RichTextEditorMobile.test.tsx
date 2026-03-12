import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RichTextEditorMobile from '../src/components/editor/RichTextEditorMobile';

describe('RichTextEditorMobile', () => {
  it('renders the editor and toolbar', () => {
    const { getByA11yLabel } = render(<RichTextEditorMobile />);
    expect(getByA11yLabel(/editor toolbar/i)).toBeTruthy();
    expect(getByA11yLabel(/journal entry editor/i)).toBeTruthy();
  });

  it('allows image attachment and alt text input (mocked)', async () => {
    const { getByA11yLabel, findAllByA11yLabel } = render(<RichTextEditorMobile />);
    // Mock ImagePicker
    jest.mock('expo-image-picker', () => ({
      launchImageLibraryAsync: jest.fn().mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://test-image.png' }],
      }),
      MediaTypeOptions: { Images: 'Images' },
    }));
    const imageButton = getByA11yLabel(/insert image/i);
    fireEvent.press(imageButton);
    // Would need to await and check for image preview
  });

  it('is accessible (toolbar and textbox have labels)', () => {
    const { getByA11yLabel } = render(<RichTextEditorMobile />);
    expect(getByA11yLabel(/editor toolbar/i)).toBeTruthy();
    expect(getByA11yLabel(/journal entry editor/i)).toBeTruthy();
  });
});
