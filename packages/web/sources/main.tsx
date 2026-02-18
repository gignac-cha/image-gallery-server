import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Application } from './Application.tsx';
import './styles/gallery.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Application />
    </StrictMode>,
  );
}
