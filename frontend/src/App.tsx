import './App.css';
import logo from './assets/logo.png';

function App() {
  return (
    <div className="App" style={{ textAlign: 'center', marginTop: 40 }}>
      <img src={logo} alt="Liceu Santa Isabel Logo" style={{ width: 180, marginBottom: 24 }} />
      <h1>Welcome to Liceu Santa Isabel</h1>
      <p>Your school management system</p>
      <div style={{ marginTop: 32 }}>
        <h2>API Endpoints</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><a href="http://localhost:5000/users" target="_blank" rel="noopener noreferrer">Users</a></li>
          <li><a href="http://localhost:5000/students" target="_blank" rel="noopener noreferrer">Students</a></li>
          <li><a href="http://localhost:5000/classes" target="_blank" rel="noopener noreferrer">Classes</a></li>
          <li><a href="http://localhost:5000/professors" target="_blank" rel="noopener noreferrer">Professors</a></li>
          <li><a href="http://localhost:5000/mensalities" target="_blank" rel="noopener noreferrer">Mensalities</a></li>
          <li><a href="http://localhost:5000/expenses" target="_blank" rel="noopener noreferrer">Expenses</a></li>
        </ul>
      </div>
    </div>
  );
}

export default App; 