    import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from "../../../styles/ConfirmarCodigo.module.css";

export default function ConfirmarCodigo() {
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    // Pré-preenche o e-mail se vier na query string (ex: do fluxo "Adicionar Usuário")
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagem('');
        setErro('');
        setCarregando(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/confirmar_codigo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    codigo: codigo.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensagem(data.mensagem || 'Conta confirmada com sucesso! Redirecionando para o login...');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2500);
            } else {
                setErro(data.erro || 'Código inválido. Tente novamente.');
            }
        } catch (error) {
            console.error(error);
            setErro('Erro de conexão com o servidor.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.confirmCard}>
                <h2 className={styles.title}>Confirmar Conta</h2>
                <p className={styles.infoText}>
                    Digite o e-mail e o código de confirmação recebido.
                </p>

                {mensagem && <div className={styles.successMessage}>{mensagem}</div>}
                {erro && <div className={styles.errorMessage}>{erro}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>E-mail</label>
                        <input
                            type="email"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Código de confirmação</label>
                        <input
                            type="text"
                            placeholder="000000"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            required
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.confirmBtn}
                        disabled={carregando}
                    >
                        {carregando ? 'Confirmando...' : 'Confirmar'}
                    </button>
                </form>

                <div className={styles.bottomNav}>
                    <Link to="/dashboard" className={styles.navLink}>Voltar</Link>
                </div>
            </div>
        </div>
    );
}
