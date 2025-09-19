import { useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import CandidateView from './components/CandidateView';
import InterviewerDashboard from './components/InterviewerDashboard';

function App() {
  const { token, role } = useAuth();

  // This is the main router component. It shouldn't have complex styling itself.
  // It just decides which full-page component to render.
  
  if (!token) {
    return <AuthPage />;
  }

  return (
    <div>
      {role === 'candidate' && <CandidateView />}
      {role === 'interviewer' && <InterviewerDashboard />}
    </div>
  );
}

export default App;