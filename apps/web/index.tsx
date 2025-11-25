import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('🚀 index.tsx loaded!');
console.log('App component:', App);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Could not find root element!');
  throw new Error("Could not find root element to mount to");
}

console.log('Creating root...');
const root = ReactDOM.createRoot(rootElement);

console.log('Rendering App...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('✅ App render called!');