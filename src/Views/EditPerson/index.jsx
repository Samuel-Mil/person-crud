import styles from './style.module.css';
import { useState } from 'react';

export default function EditPerson({ person, onSave }) {
  const [form, setForm] = useState({
    nome: person?.nome || '',
    endereco: person?.endereco || '',
    cpf: person?.cpf || '',
    telefone: person?.telefone || '',
    email: person?.email || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Salvar pessoa:', form);
    if (onSave) onSave(form);
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Editar Pessoa</h2>

        <div className={styles.formGroup}>
          <label>Nome</label>
          <input
            name="nome"
            type="text"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Endereço</label>
          <input
            name="endereco"
            type="text"
            value={form.endereco}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>CPF</label>
          <input
            name="cpf"
            type="text"
            value={form.cpf}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Telefone</label>
          <input
            name="telefone"
            type="text"
            value={form.telefone}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className={styles.button}>
          Salvar
        </button>
      </form>
    </div>
  );
}
