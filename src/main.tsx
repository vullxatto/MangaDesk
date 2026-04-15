import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './react/App';
import './css/pages/index.css';
import './css/pages/auth.css';
import './css/pages/articles.css';
import './css/pages/examples.css';

// GitHub Pages serves project sites at /<repo>/; routes must match that path (see vite base).
const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
