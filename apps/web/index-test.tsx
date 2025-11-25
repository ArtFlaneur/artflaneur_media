import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('🚀 index.tsx loaded!');
console.log('React:', React);
console.log('ReactDOM:', ReactDOM);

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Could not find root element!');
  throw new Error("Could not find root element to mount to");
}

// Простой тестовый компонент
function TestApp() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#D93025' }}>🎨 Art Flaneur Test</h1>
      <p>If you see this, React is working!</p>
    </div>
  );
}

console.log('Creating root...');
const root = ReactDOM.createRoot(rootElement);
console.log('Root created:', root);

console.log('Rendering...');
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
console.log('✅ Render called!');
