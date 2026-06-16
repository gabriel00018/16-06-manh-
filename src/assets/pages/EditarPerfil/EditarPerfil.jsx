import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../../../styles/EditarPerfil.module.css";
import { Link } from "react-router-dom";

export default function EditarPerfil() {
    const navigate = useNavigate();
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });

    useEffect(() => {
        const usuarioStr = localStorage.getItem("usuario");
        if (!usuarioStr) {
            navigate('/login');
            return;
        }
        // ✅ Pega direto do localStorage — nome e email já estão salvos desde o login
        const usuario = JSON.parse(usuarioStr);
        setFormData(prev => ({
            ...prev,
            nome: usuario.nome || '',
            email: usuario.email || ''
        }));
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        if (formData.senha && formData.senha !== formData.confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }

        setCarregando(true);
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

        const body = {
            nome: formData.nome,
            email: formData.email,
        };

        if (formData.senha.trim() !== '') {
            body.senha = formData.senha;
        }

        try {
            const resposta = await fetch(`http://127.0.0.1:5000/editar_usuario/${usuarioLocal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            const data = await resposta.json();

            if (resposta.ok) {
                // ✅ Atualiza localStorage com os novos dados
                const novoUsuario = {
                    ...usuarioLocal,
                    nome: formData.nome,
                    email: formData.email
                };
                localStorage.setItem("usuario", JSON.stringify(novoUsuario));

                setSucesso('Perfil atualizado com sucesso!');
                setTimeout(() => navigate('/dashboard'), 2000);
            } else {
                setErro(data.erro || 'Erro ao salvar.');
            }
        } catch (error) {
            setErro('Erro de conexão.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formCard}>
                <h2 className={styles.title}>Editar Perfil</h2>

                {erro && (
                    <div className={styles.toast + ' ' + styles.toastErro}>
                        <span className={styles.toastIcone}>✕</span>
                        <span>{erro}</span>
                    </div>
                )}
                {sucesso && (
                    <div className={styles.toast + ' ' + styles.toastSucesso}>
                        <span className={styles.toastIcone}>✓</span>
                        <span>{sucesso}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Nome:</label>
                        <input
                            type="text"
                            name="nome"
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
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.divider}>
                        <span>Alterar senha (opcional)</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Nova senha:</label>
                        <input
                            type="password"
                            name="senha"
                            placeholder="Deixe em branco para não alterar"
                            value={formData.senha}
                            onChange={handleChange}
                        />
                        {/* ✅ Dicas de senha em tempo real */}
                        {formData.senha.length > 0 && (
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
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Confirmar nova senha:</label>
                        <input
                            type="password"
                            name="confirmarSenha"
                            placeholder="Repita a nova senha"
                            value={formData.confirmarSenha}
                            onChange={handleChange}
                        />
                        {/* ✅ Indicador de senhas coincidindo */}
                        {formData.confirmarSenha.length > 0 && (
                            <span className={formData.senha === formData.confirmarSenha ? styles.dicaOk : styles.dicaPendente}>
                                {formData.senha === formData.confirmarSenha ? '✓ Senhas coincidem' : '○ Senhas não coincidem'}
                            </span>
                        )}
                    </div>

                    <button type="submit" className={styles.saveBtn} disabled={carregando}>
                        {carregando ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                </form>

                <Link to="/dashboard" className={styles.backLink}>
                    Voltar para Dashboard
                </Link>
            </div>
        </div>
    );
}