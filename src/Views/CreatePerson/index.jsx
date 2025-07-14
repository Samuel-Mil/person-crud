import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './style.module.css';
import { useNavigate } from 'react-router-dom';

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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Funções de máscara
  const maskCPF = (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14);
  const maskPhone = (value) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);
  const maskCEP = (value) => value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);

  // Verificação de permissão
  useEffect(() => {
    const userDataString = sessionStorage.getItem('user');

    if (!userDataString) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userDataString);

    if (userData.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [navigate]);

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setIsLoading(true);
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (data.erro) {
        setMensagem('CEP não encontrado.');
        return;
      }
      setForm(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          logradouro: data.logradouro,
          bairro: data.bairro,
          localidade: data.localidade,
          uf: data.uf,
        }
      }));
      setMensagem(null);
    } catch (error) {
      setMensagem("Erro ao buscar o CEP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setForm({ ...form, cpf: maskCPF(value) });
    } else if (name === 'telefone') {
      setForm({ ...form, telefones: [{ ...form.telefones[0], numero: maskPhone(value) }] });
    } else if (name === 'cep') {
      setForm(prev => ({ ...prev, endereco: { ...prev.endereco, cep: maskCEP(value) } }));
    } else if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setForm(prev => ({ ...prev, endereco: { ...prev.endereco, [field]: value } }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem(null);

    const payload = {
      ...form,
      cpf: form.cpf.replace(/\D/g, ''),
      telefones: form.telefones.map(tel => ({ ...tel, numero: tel.numero.replace(/\D/g, '') })),
      endereco: {
        ...form.endereco,
        cep: form.endereco.cep.replace(/\D/g, ''),
      },
    };

    try {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      await axios.post('http://localhost:8080/clientes', payload, {
        auth: {
          username: userData.username,
          password: userData.password,
        },
      });
      setMensagem('Cliente cadastrado com sucesso!');
      // Limpa o formulário após o sucesso
      setForm({
        nome: '', cpf: '', telefones: [{ tipo: 'CELULAR', numero: '' }], emails: [''],
        endereco: { cep: '', logradouro: '', bairro: '', localidade: '', uf: '', complemento: '' },
      });
    } catch (err) {
      setMensagem('Erro ao cadastrar cliente.');
    } finally {
      setIsLoading(false);
    }
  };

  const messageClass = mensagem
    ? `${styles.message} ${mensagem.includes('sucesso') ? styles.success : styles.error}`
    : '';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastrar Novo Cliente</h1>
      {mensagem && <p className={messageClass}>{mensagem}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Nome:
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </label>
        <label>
          CPF:
          <input name="cpf" value={form.cpf} onChange={handleChange} required />
        </label>
        <label>
          Telefone:
          <input name="telefone" value={form.telefones[0].numero} onChange={handleChange} required />
        </label>
        <label>
          Email:
          <input type="email" value={form.emails[0]} onChange={(e) => setForm({ ...form, emails: [e.target.value] })} required />
        </label>
        <label>
          CEP:
          <input name="cep" value={form.endereco.cep} onChange={handleChange} onBlur={handleCepBlur} required />
        </label>
        <label>
          Logradouro:
          <input name="endereco.logradouro" value={form.endereco.logradouro} onChange={handleChange} />
        </label>
        <label>
          Bairro:
          <input name="endereco.bairro" value={form.endereco.bairro} onChange={handleChange} />
        </label>
        <label>
          Cidade:
          <input name="endereco.localidade" value={form.endereco.localidade} onChange={handleChange} />
        </label>
        <label>
          UF:
          <input name="endereco.uf" value={form.endereco.uf} onChange={handleChange} />
        </label>
        <label>
          Complemento:
          <input name="endereco.complemento" value={form.endereco.complemento} onChange={handleChange} />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'A cadastrar...' : 'Cadastrar Cliente'}
        </button>
      </form>
    </div>
  );
}
