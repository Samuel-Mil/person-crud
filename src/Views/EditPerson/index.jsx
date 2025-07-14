import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './style.module.css';
// Passo 1: Importar o useNavigate para fazer o redirecionamento
import { useNavigate } from 'react-router-dom';

export default function EditPerson() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [clientId, setClientId] = useState(null);
  // Inicializa o hook para navegação
  const navigate = useNavigate();

  // Funções de máscara (sem alterações)
  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const maskPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const maskCEP = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  useEffect(() => {
    // --- LÓGICA DE VERIFICAÇÃO DE PERMISSÃO ATUALIZADA ---
    const userDataString = sessionStorage.getItem('user');

    // Caso 1: Utilizador não está logado. Redireciona para o login.
    if (!userDataString) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userDataString);

    // Caso 2: Utilizador está logado, mas não é admin. Redireciona para a home.
    if (userData.role !== 'admin') {
      navigate('/');
      return;
    }
    // --- FIM DA VERIFICAÇÃO ---

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      setMensagem('ID do cliente não fornecido na URL.');
      setIsLoading(false);
      return;
    }

    setClientId(id);

    const fetchClientData = async () => {
      try {
        // Usa as credenciais da sessão para a requisição
        const response = await axios.get(`http://localhost:8080/clientes/${id}`, {
          auth: {
            username: userData.username,
            password: userData.password,
          },
        });

        const clientData = response.data;

        setForm({
          nome: clientData.nome || '',
          cpf: maskCPF(clientData.cpf || ''),
          telefones: clientData.telefones.map(tel => ({ ...tel, numero: maskPhone(tel.numero || '') })) || [{ tipo: 'CELULAR', numero: '' }],
          emails: clientData.emails || [''],
          endereco: {
            cep: maskCEP(clientData.endereco.cep || ''),
            logradouro: clientData.endereco.logradouro || '',
            bairro: clientData.endereco.bairro || '',
            localidade: clientData.endereco.localidade || '',
            uf: clientData.endereco.uf || '',
            complemento: clientData.endereco.complemento || '',
          },
        });

      } catch (err) {
        console.error('Erro ao buscar dados do cliente', err);
        setMensagem('Não foi possível carregar os dados do cliente.');
        if (err.response && err.response.status === 401) {
            navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [navigate]); // Adicionado 'navigate' às dependências do useEffect

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        endereco: { ...prev.endereco, [field]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem(null);

    if (!clientId) {
      setMensagem('Erro: ID do cliente não encontrado.');
      return;
    }

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
      // Pega as credenciais da sessão para a requisição PUT
      const userData = JSON.parse(sessionStorage.getItem('user'));
      await axios.put(`http://localhost:8080/clientes/${clientId}`, payload, {
        auth: {
          username: userData.username,
          password: userData.password,
        },
      });
      setMensagem('Cliente atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar cliente', err);
      setMensagem('Erro ao atualizar os dados do cliente.');
    }
  };

  const messageClass = mensagem
    ? `${styles.message} ${mensagem.includes('sucesso') ? styles.success : styles.error}`
    : '';

  if (isLoading) {
    return <div className={styles.container}><p>A carregar...</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Cliente</h1>
      {mensagem && <p className={messageClass}>{mensagem}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* ... (o resto do seu formulário permanece igual) ... */}
        <label>
          Nome:
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </label>
        <label>
          CPF:
          <input name="cpf" value={form.cpf} onChange={(e) => setForm({...form, cpf: maskCPF(e.target.value)})} required />
        </label>
        <label>
          Telefone:
          <input
            value={form.telefones[0].numero}
            onChange={(e) => {
              const novo = { ...form.telefones[0], numero: maskPhone(e.target.value) };
              setForm({ ...form, telefones: [novo] });
            }}
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
            name="endereco.cep"
            value={form.endereco.cep}
            onChange={(e) => setForm({...form, endereco: {...form.endereco, cep: maskCEP(e.target.value)}})}
            required
          />
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
        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
}
