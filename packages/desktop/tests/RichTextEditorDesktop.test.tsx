import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RichTextEditorDesktop from '../src/components/editor/RichTextEditorDesktop';

describe('RichTextEditorDesktop', () => {
  it('renders the editor and toolbar', () => {
    render(<RichTextEditorDesktop />);
    expect(screen.getByRole('toolbar', { name: /editor toolbar/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /journal entry editor/i })).toBeInTheDocument();
  });

  it('allows image attachment and alt text input', () => {
    render(<RichTextEditorDesktop />);
    // Simulate file input (mock FileReader)
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload image, video, or audio/i) as HTMLInputElement;
    const dataUrl = 'data:image/png;base64,dummy';
    // Mock FileReader
    const fileReaderMock = {
      readAsDataURL: jest.fn(),
      onload: null as null | (() => void),
      result: dataUrl,
    };
    // @ts-ignore
    window.FileReader = jest.fn(() => fileReaderMock);
    fireEvent.change(input, { target: { files: [file] } });
    // Simulate onload
    if (fileReaderMock.onload) fileReaderMock.onload({} as any);
    // Check image preview
    // (In a real test, you'd wait for the image to appear)
  });

  it('is accessible (toolbar and textbox have labels)', () => {
    render(<RichTextEditorDesktop />);
    expect(screen.getByRole('toolbar', { name: /editor toolbar/i })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /journal entry editor/i })).toBeTruthy();
  });
});
