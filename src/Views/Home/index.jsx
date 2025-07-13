// src/components/PeopleList/PeopleList.jsx
import { useState, useEffect } from 'react';
import styles from './style.module.css';
import axios from 'axios';

export default function Home() {
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/clientes", {
        auth: {
          username: "Samuel",
          password: "Chmpm-2005",
        },
      })
      .then((response) => {
        setClientes(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar clientes:", error);
        setErro("Erro ao buscar clientes.");
      });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lista de Clientes</h1>
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
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{cliente.endereco?.logradouro}, {cliente.endereco?.numero} - {cliente.endereco?.localidade} ({cliente.endereco?.uf})</td>
              <td>{cliente.cpf}</td>
              <td>
                {cliente.telefones?.map((t, index) => (
                  <div key={index}>
                    {t.tipo}: {t.numero}
                  </div>
                ))}
              </td>
              <td>{cliente.emails?.join(", ")}</td>
              <td>
                <button className={styles.btnEditar}>Editar</button>
                <button className={styles.btnDeletar}>Deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
