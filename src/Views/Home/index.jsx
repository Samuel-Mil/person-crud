// src/components/PeopleList/PeopleList.jsx
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import styles from './style.module.css';
import axios from 'axios';
import DeleteClientButton from '../../Components/DeleteClientButton';

export default function Home() {
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState(null);

  // --- Funções de Máscara para Exibição ---
  const maskCPF = (value = '') => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const maskPhone = (value = '') => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/clientes", {
        auth: {
          username: "Samuel",
          password: "Chmpm-2005",
        },
      })
      .then((response) => {
        // Garantir que a resposta é sempre um array
        setClientes(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Erro ao buscar clientes:", error);
        setErro("Erro ao buscar clientes.");
      });
  }, []);

  const handleDeletionSuccess = (deletedClientId) => {
    setClientes(currentClientes =>
      currentClientes.filter(client => client.id !== deletedClientId)
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lista de Clientes</h1>
      <Link to="/create_person" className={styles.mainButton}>+ Cadastrar Cliente</Link>
      {erro && <p className={styles.error}>{erro}</p>}
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
          {/* Adicionada verificação para garantir que 'clientes' é um array antes de mapear */}
          {Array.isArray(clientes) && clientes.map((cliente) => {
            // Se um cliente for nulo ou indefinido, não renderiza a linha
            if (!cliente) return null;

            // Formata o endereço de forma segura
            const enderecoFormatado = cliente.endereco
              ? `${cliente.endereco.logradouro || ''}, ${cliente.endereco.numero || ''} - ${cliente.endereco.localidade || ''} (${cliente.endereco.uf || ''})`
              : 'Endereço não disponível';

            return (
              <tr key={cliente.id}>
                <td>{cliente.nome || 'Nome não disponível'}</td>
                <td>{enderecoFormatado}</td>
                <td>{maskCPF(cliente.cpf)}</td>
                <td>
                  {/* Verifica se 'telefones' é um array antes de mapear */}
                  {Array.isArray(cliente.telefones) && cliente.telefones.map((t, index) => (
                    <div key={index}>
                      {t.tipo}: {maskPhone(t.numero)}
                    </div>
                  ))}
                </td>
                <td>
                  {/* Verifica se 'emails' é um array antes de juntar */}
                  {Array.isArray(cliente.emails) ? cliente.emails.join(", ") : ''}
                </td>
                <td className={styles.actions}>
                  <Link to={`/edit_person?id=${cliente.id}`} className={styles.btnEditar}>Editar</Link>
                  <DeleteClientButton
                    clientId={cliente.id}
                    onDeleteSuccess={handleDeletionSuccess}
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
