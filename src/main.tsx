import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

// Easter egg pour qui ouvre la console.
console.info('%cHello, developer. Your AI saw you open the console and resigned.', 'font: italic 14px Georgia, serif');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
