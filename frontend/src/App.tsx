import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import StoryExperience from './pages/StoryExperience';
import InvestigationWorkspace from './pages/InvestigationWorkspace';
import Events from './pages/Events';
import Facilities from './pages/Facilities';
import Sensors from './pages/Sensors';
import Reports from './pages/Reports';
import About from './pages/About';

function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<StoryExperience />} />
          <Route path="/events" element={<Events />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/sensors" element={<Sensors />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/about" element={<About />} />
          <Route path="/investigation/:eventId" element={<InvestigationWorkspace />} />
        </Routes>
      </AppShell>
    </Router>
  );
}

export default App;
