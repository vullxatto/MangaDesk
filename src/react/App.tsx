import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ExamplesPage } from './pages/ExamplesPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/examples" element={<ExamplesPage />} />
    </Routes>
  );
}
