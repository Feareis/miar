import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

// Easter egg pour qui ouvre la console.
console.info('%cHello, developer. Your AI read your code and resigned.', 'font: italic 14px Georgia, serif');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
