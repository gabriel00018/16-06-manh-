import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../../../styles/AdicionarUsuario.module.css";
import { Link } from "react-router-dom";

export default function AdicionarUsuario() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [formData, setFormData] = useState({
        imagem: null,
        nome: '',
        email: '',
        senha: '',
        tipo: 'garcom'
    });

    useEffect(() => {
        const usuarioStr = localStorage.getItem("usuario");
        if (!usuarioStr) return;
        const usuario = JSON.parse(usuarioStr);
        setUser(usuario);
        setLoading(false);
        if (usuario.id_tipo !== 1) {
            setErro('Acesso negado. Apenas administradores podem criar usuários.');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'imagem') {
            setFormData({ ...formData, imagem: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');
        setCarregando(true);

        const formDataToSend = new FormData();
        if (formData.imagem) formDataToSend.append('imagem', formData.imagem);
        formDataToSend.append('nome', formData.nome);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('senha', formData.senha);
        formDataToSend.append('id_tipo', formData.tipo === 'admin' ? '1' : '2');

        try {
            const resposta = await fetch("http://127.0.0.1:5000/criar_usuario", {
                method: "POST",
                credentials: "include",
                body: formDataToSend
            });

            const data = await resposta.json();

            if (resposta.ok) {
                setSucesso(data.mensagem || 'Usuário criado com sucesso!');

            } else {
                setErro(data.erro || 'Erro ao criar usuário.');
            }
        } catch (error) {
            setErro('Erro de conexão com o servidor.');
        } finally {
            setCarregando(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.formCard}>
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    if (user && user.id_tipo !== 1) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.formCard}>
                    <div className={styles.toast + ' ' + styles.toastErro}>
                        <span className={styles.toastIcone}>✕</span>
                        <span>Acesso negado. Apenas administradores podem criar usuários.</span>
                    </div>
                    <Link to="/dashboard" className={styles.backLink}>Voltar para Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formCard}>
                <h2 className={styles.title}>Adicionar Usuário</h2>

                {/* ✅ Notificação de erro */}
                {erro && (
                    <div className={styles.toast + ' ' + styles.toastErro}>
                        <span className={styles.toastIcone}>✕</span>
                        <span>{erro}</span>
                    </div>
                )}

                {/* ✅ Notificação de sucesso */}
                {sucesso && (
                    <div className={styles.toast + ' ' + styles.toastSucesso}>
                        <span className={styles.toastIcone}>✓</span>
                        <span>{sucesso}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Imagem:</label>
                        <input
                            type="file"
                            name="imagem"
                            accept="image/*"
                            onChange={handleChange}
                            className={styles.fileInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Nome:</label>
                        <input
                            type="text"
                            name="nome"
                            placeholder="Digite o nome completo"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="exemplo@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Senha:</label>
                        <input
                            type="password"
                            name="senha"
                            placeholder="Crie uma senha"
                            value={formData.senha}
                            onChange={handleChange}
                            required
                        />
                        {/* ✅ Dicas de senha sempre visíveis */}
                        <div className={styles.senhaDicas}>
                            <span className={formData.senha.length >= 8 ? styles.dicaOk : styles.dicaPendente}>
                                {formData.senha.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                            </span>
                            <span className={/[A-Z]/.test(formData.senha) ? styles.dicaOk : styles.dicaPendente}>
                                {/[A-Z]/.test(formData.senha) ? '✓' : '○'} Uma letra maiúscula
                            </span>
                            <span className={/[0-9]/.test(formData.senha) ? styles.dicaOk : styles.dicaPendente}>
                                {/[0-9]/.test(formData.senha) ? '✓' : '○'} Um número
                            </span>
                            <span className={/[@$!%*?&]/.test(formData.senha) ? styles.dicaOk : styles.dicaPendente}>
                                {/[@$!%*?&]/.test(formData.senha) ? '✓' : '○'} Um caractere especial (@$!%*?&)
                            </span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Determine o usuário:</label>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="tipo"
                                    value="admin"
                                    checked={formData.tipo === 'admin'}
                                    onChange={handleChange}
                                />
                                ADM
                            </label>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="tipo"
                                    value="garcom"
                                    checked={formData.tipo === 'garcom'}
                                    onChange={handleChange}
                                />
                                Garçom
                            </label>
                        </div>
                    </div>

                    <button type="submit" className={styles.saveBtn} disabled={carregando}>
                        {carregando ? 'Salvando...' : 'Salvar'}
                    </button>

                    <Link to="/confirmar-codigo" className={styles.confirmarLink}>
                        Confirmar Código
                    </Link>
                </form>

                <Link to="/dashboard" className={styles.backLink}>
                    Voltar para Dashboard
                </Link>
            </div>
        </div>
    );
}