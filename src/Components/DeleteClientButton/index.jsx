import React, { useState } from 'react';
import axios from 'axios';

// Passo 1: Adicionar 'isDisabled' às props do componente
export default function DeleteClientButton({ clientId, onDeleteSuccess, isDisabled }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Adiciona uma verificação para não fazer nada se estiver desativado
    if (isDisabled) return;

    const isConfirmed = window.confirm(
      'Tem a certeza que deseja deletar este cliente?'
    );
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      // MOCK: A chamada real à API
      // await axios.delete(`http://localhost:8080/clientes/${clientId}`, { auth: ... });
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Cliente deletado com sucesso!');
      if (onDeleteSuccess) {
        onDeleteSuccess(clientId);
      }
    } catch (err) {
      alert('Não foi possível deletar o cliente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      // Passo 2: O botão fica desativado se a prop 'isDisabled' for verdadeira OU se já estiver a deletar
      disabled={isDisabled || isDeleting}
      style={{
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: (isDisabled || isDeleting) ? 'not-allowed' : 'pointer', // Muda o cursor quando desativado
        opacity: (isDisabled || isDeleting) ? 0.6 : 1, // Muda a opacidade quando desativado
      }}
    >
      {isDeleting ? 'A deletar...' : 'Deletar'}
    </button>
  );
}
