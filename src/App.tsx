import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { HomePage } from './pages/Home';
import { LearnPage } from './pages/Learn';
import { PracticePage } from './pages/Practice';
import { CompetePage } from './pages/Compete';
import { RoadmapPage } from './pages/Roadmap';
import { ProfilePage } from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="learn/:lessonId" element={<LearnPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="practice/:problemId" element={<PracticePage />} />
          <Route path="compete" element={<CompetePage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="roadmap/:pathId" element={<RoadmapPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
