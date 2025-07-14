import { useState } from 'react';
import axios from 'axios';

export default function DeleteClientButton({ clientId, onDeleteSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDelete = async () => {
    // 1. Pedir confirmação ao utilizador
    const isConfirmed = window.confirm(
      'Tem a certeza que deseja deletar este cliente? Esta ação não pode ser desfeita.'
    );

    if (!isConfirmed) {
      return; // O utilizador cancelou a ação
    }

    setIsDeleting(true);
    setErrorMessage('');

    try {
      await axios.delete(`http://localhost:8080/clientes/${clientId}`, {
        auth: {
          username: 'Samuel',
          password: 'Chmpm-2005',
        },
      });

      alert('Cliente deletado com sucesso!');

      if (onDeleteSuccess) {
        onDeleteSuccess(clientId);
      }

    } catch (err) {
      console.error('Erro ao deletar o cliente:', err);
      setErrorMessage('Não foi possível deletar o cliente.');
      if (errorMessage) {
        alert(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        opacity: isDeleting ? 0.6 : 1,
      }}
    >
      {isDeleting ? 'A deletar...' : 'Deletar'}
    </button>
  );
}
