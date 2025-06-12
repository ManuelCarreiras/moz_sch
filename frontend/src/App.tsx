import './App.css';
import logo from './assets/logo.png';

function App() {
  return (
    <div className="App" style={{ textAlign: 'center', marginTop: 40 }}>
      <img src={logo} alt="Liceu Santa Isabel Logo" style={{ width: 180, marginBottom: 24 }} />
      <h1>Welcome to Liceu Santa Isabel</h1>
      <p>Your school management system</p>
    </div>
  );
}

export default App; 