import './App.css';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import TestDashboard from './components/TestDashboard';

function App() {

  return (
    <>
      <LoginForm />
      <hr />
      <RegistrationForm />
      <hr />
      <TestDashboard />
    </>
  )
}

export default App