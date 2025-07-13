import { useState } from 'react';
import axios from 'axios';
import styles from './style.module.css';

export default function CreatePerson() {
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    telefones: [{ tipo: 'CELULAR', numero: '' }],
    emails: [''],
    endereco: {
      cep: '',
      logradouro: '',
      bairro: '',
      localidade: '',
      uf: '',
      complemento: '',
    },
  });

  const [mensagem, setMensagem] = useState(null);

  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const handleCepChange = async (e) => {
    const cepSemMascara = e.target.value.replace(/\D/g, '');
    setForm({ ...form, endereco: { ...form.endereco, cep: e.target.value } });

    if (cepSemMascara.length === 8) {
      try {
        const response = await axios.get(`http://localhost:8080/cep/${cepSemMascara}`, {
          auth: {
            username: 'Samuel',
            password: 'Chmpm-2005',
          },
        });

        setForm((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            logradouro: response.data.logradouro,
            bairro: response.data.bairro,
            localidade: response.data.localidade,
            uf: response.data.uf,
          },
        }));
      } catch (err) {
        console.error('Erro ao buscar CEP', err);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nome: form.nome,
      cpf: form.cpf.replace(/\D/g, ''),
      telefones: form.telefones.map(tel => ({...tel, numero: tel.numero.replace(/\D/g, '')})),
      emails: form.emails,
      endereco: {
          ...form.endereco,
          cep: form.endereco.cep.replace(/\D/g, '')
      },
    };

    try {
      await axios.post('http://localhost:8080/clientes', payload, {
        auth: {
          username: 'Samuel',
          password: 'Chmpm-2005',
        },
      });
      setMensagem('Cliente cadastrado com sucesso!');
    } catch (err) {
      console.error('Erro ao cadastrar cliente', err);
      setMensagem('Erro ao cadastrar cliente.');
    }
  };

  const messageClass = mensagem
    ? `${styles.message} ${mensagem === 'Cliente cadastrado com sucesso!' ? styles.success : styles.error}`
    : '';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Registar Cliente</h1>
      {mensagem && <p className={messageClass}>{mensagem}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Nome:
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          CPF:
          <input
            name="cpf"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })}
            placeholder="000.000.000-00"
            required
          />
        </label>

        <label>
          Telefone:
          <input
            value={form.telefones[0].numero}
            onChange={(e) => {
              const maskedPhone = e.target.value
                .replace(/\D/g, '')
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2')
                .slice(0, 15);
              const novo = { ...form.telefones[0], numero: maskedPhone };
              setForm({ ...form, telefones: [novo] });
            }}
            placeholder="(00) 00000-0000"
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            value={form.emails[0]}
            onChange={(e) => setForm({ ...form, emails: [e.target.value] })}
            required
          />
        </label>

        <label>
          CEP:
          <input
            value={form.endereco.cep}
            onChange={(e) => {
                const maskedCep = e.target.value
                    .replace(/\D/g, '')
                    .replace(/(\d{5})(\d)/, '$1-$2')
                    .slice(0, 9);
                handleCepChange({ target: { value: maskedCep } });
            }}
            placeholder="00000-000"
            required
          />
        </label>

        <label>
          Logradouro:
          <input value={form.endereco.logradouro} readOnly disabled />
        </label>

        <label>
          Bairro:
          <input value={form.endereco.bairro} readOnly disabled />
        </label>

        <label>
          Cidade:
          <input value={form.endereco.localidade} readOnly disabled />
        </label>

        <label>
          UF:
          <input value={form.endereco.uf} readOnly disabled />
        </label>

        <label>
          Complemento:
          <input
            name="complemento"
            value={form.endereco.complemento}
            onChange={(e) =>
              setForm({
                ...form,
                endereco: { ...form.endereco, complemento: e.target.value },
              })
            }
          />
        </label>

        <button type="submit">Registar</button>
      </form>
    </div>
  );
}
