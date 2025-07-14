import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // CORREÇÃO 1: Limpa qualquer sessão antiga para garantir um login limpo.
    sessionStorage.removeItem('user');

    // CORREÇÃO 2: Valida se os campos não estão vazios antes de prosseguir.
    if (!username || !password) {
      setError('Por favor, preencha o nome de usuário e a senha.');
      setIsLoading(false);
      return;
    }

    try {
      await axios.get('http://localhost:8080/clientes', {
        auth: {
          username: username,
          password: password,
        },
      });

      // Se o login for bem-sucedido, guarda os dados completos na sessão.
      sessionStorage.setItem('user', JSON.stringify({
        username: username,
        password: password,
        role: role
      }));

      // Redireciona para a página principal.
      navigate('/');

    } catch (err) {
      // Limpa a sessão em caso de qualquer erro para segurança.
      sessionStorage.removeItem('user');

      if (err.response && err.response.status === 401) {
        setError('Nome de usuário ou senha inválidos. Tente novamente.');
      } else if (err.request) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está a correr.');
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // O JSX e os estilos permanecem os mesmos.
  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>Acesso ao Painel</h1>
        <p style={styles.subtitle}>Por favor, insira as suas credenciais.</p>

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>Nome de Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="role" style={styles.label}>Função</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.input}
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {error && <p style={styles.errorMessage}>{error}</p>}

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Estilos (sem alterações)
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' },
  loginBox: { padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', color: '#333', marginBottom: '10px' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1rem', backgroundColor: 'white' },
  button: { width: '100%', padding: '12px', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' },
  errorMessage: { color: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.1)', padding: '10px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px' },
};
