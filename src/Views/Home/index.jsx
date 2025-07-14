// src/components/PeopleList/PeopleList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import styles from './style.module.css';
import axios from 'axios';
import DeleteClientButton from '../../Components/DeleteClientButton';

export default function Home() {
  const [clientes, setClientes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Estados para gerir o fluxo de autenticação e erros
  const [authStatus, setAuthStatus] = useState('pending');
  // NOVO: Estado para guardar a mensagem de erro específica
  const [errorMessage, setErrorMessage] = useState('');

  // Funções de Máscara (sem alterações)
  const maskCPF = (value = '') => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14);
  const maskPhone = (value = '') => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);

  useEffect(() => {
    const controller = new AbortController();

    const checkAuthAndFetchData = async () => {
      const userDataString = sessionStorage.getItem('user');

      if (!userDataString) {
        setErrorMessage('Nenhuma sessão encontrada. Por favor, faça login.');
        setAuthStatus('failed');
        return;
      }

      const userData = JSON.parse(userDataString);
      const { username, password, role } = userData;

      if (!username || !password) {
        setErrorMessage('Dados da sessão estão incompletos. Por favor, faça login novamente.');
        setAuthStatus('failed');
        return;
      }

      if (role === 'admin') {
        setIsAdmin(true);
      }

      try {
        const response = await axios.get("http://localhost:8080/clientes", {
          auth: { username, password },
          signal: controller.signal
        });

        setClientes(Array.isArray(response.data) ? response.data : []);
        setAuthStatus('success');

      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Requisição cancelada.');
          return;
        }

        // CORREÇÃO: Lógica de erro detalhada
        sessionStorage.removeItem('user');

        if (error.response) {
          // O servidor respondeu com um erro (ex: 401 Unauthorized)
          if (error.response.status === 401) {
            setErrorMessage('As suas credenciais são inválidas ou a sua sessão expirou.');
          } else {
            setErrorMessage(`Ocorreu um erro no servidor (Código: ${error.response.status}).`);
          }
        } else if (error.request) {
          // A requisição foi feita, mas não houve resposta (servidor offline)
          setErrorMessage('Não foi possível conectar ao servidor. Verifique se o backend está a correr e acessível na porta 8080.');
        } else {
          // Outro erro
          setErrorMessage('Ocorreu um erro inesperado ao tentar processar a sua autenticação.');
        }

        setAuthStatus('failed');
      }
    };

    checkAuthAndFetchData();

    return () => {
      controller.abort();
    };
  }, []);

  const handleDeletionSuccess = (deletedClientId) => {
    setClientes(currentClientes =>
      currentClientes.filter(client => client.id !== deletedClientId)
    );
  };

  const handleDisabledClick = (e) => {
    if (!isAdmin) {
      e.preventDefault();
    }
  };

  if (authStatus === 'pending') {
    return <div className={styles.container}><p>A verificar autenticação...</p></div>;
  }

  if (authStatus === 'failed') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Acesso Negado</h1>
        {/* Mostra a mensagem de erro específica */}
        <p style={{ color: '#c0392b', textAlign: 'center', marginBottom: '20px' }}>{errorMessage}</p>
        <Link to="/login" className={styles.mainButton}>Ir para a Página de Login</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lista de Clientes</h1>
      <Link
        to="/create_person"
        className={`${styles.mainButton} ${!isAdmin ? styles.disabledButton : ''}`}
        onClick={handleDisabledClick}
        aria-disabled={!isAdmin}
      >
        + Cadastrar Cliente
      </Link>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Endereço</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => {
            if (!cliente) return null;
            const enderecoFormatado = cliente.endereco ? `${cliente.endereco.logradouro || ''}, ${cliente.endereco.numero || ''}` : 'N/A';
            return (
              <tr key={cliente.id}>
                <td>{cliente.nome || 'N/A'}</td>
                <td>{enderecoFormatado}</td>
                <td>{maskCPF(cliente.cpf)}</td>
                <td>
                  {Array.isArray(cliente.telefones) && cliente.telefones.map((t, index) => (
                    <div key={index}>{t.tipo}: {maskPhone(t.numero)}</div>
                  ))}
                </td>
                <td>{Array.isArray(cliente.emails) ? cliente.emails.join(", ") : ''}</td>
                <td className={styles.actions}>
                  <Link
                    to={`/edit_person?id=${cliente.id}`}
                    className={`${styles.btnEditar} ${!isAdmin ? styles.disabledButton : ''}`}
                    onClick={handleDisabledClick}
                    aria-disabled={!isAdmin}
                  >
                    Editar
                  </Link>
                  <DeleteClientButton
                    clientId={cliente.id}
                    onDeleteSuccess={handleDeletionSuccess}
                    isDisabled={!isAdmin}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
