import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { useSocket } from './hooks/useSocket';
import { NotificationProvider } from './context/NotificationContext';

function AppContent() {
  // Initialize socket connection
  useSocket();

  return <AppRoutes />;
}

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
