import React from 'react';
import HandwritingInputCanvas from '../components/HandwritingInputCanvas';

const HandwritingDemo: React.FC = () => (
  <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
    <h2>Handwriting Input Demo</h2>
    <p>Draw with your mouse, touch, or stylus. Use the Clear and Export buttons below the canvas.</p>
    <HandwritingInputCanvas width={500} height={300} />
  </div>
);

export default HandwritingDemo; 