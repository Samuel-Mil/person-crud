import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './style.module.css'; // Crie um ficheiro CSS para o Header

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userDataString = sessionStorage.getItem('user');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      if (userData.role === 'admin') {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.logo}>
          <Link to="/">AdmClientes</Link>
        </h1>
        <nav className={styles.nav}>
          <ul>
            {/* O link de cadastro só aparece para administradores */}
            {isAdmin && (
              <li>
                <Link to="/create_person">Cadastrar Cliente</Link>
              </li>
            )}
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
