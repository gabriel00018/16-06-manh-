import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Recomendado usar para navegação interna
import styles from "../../../styles/VerificarCodigo.module.css";

function VerificarCodigo() {
    const [codigo, setCodigo] = useState('');
    const [senha, setSenha] = useState(''); // Corrigido: Inicializado como string vazia
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagem('');
        setErro('');
        setCarregando(true);

        try {
            const emailRecuperacao = localStorage.getItem('email_recuperacao');

            const response = await fetch('http://127.0.0.1:5000/confirmar_codigo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailRecuperacao,
                    codigo: codigo,
                    senha: senha // Agora envia a string da senha digitada
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Mensagem de sucesso vinda do backend ou fixa
                setMensagem(data.mensagem || 'Código verificado com sucesso!');

                // Limpa o email do localStorage após o sucesso (opcional)
                localStorage.removeItem('email_recuperacao');

                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                // Exibe o erro específico retornado pelo Flask (ex: "Código inválido", "Senha curta")
                setErro(data.erro || 'Código inválido ou expirado.');
            }
        } catch (error) {
            setErro('Erro de conexão com o servidor.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.verificationCard}>
                <h2 className={styles.title}>Recuperação de senha</h2>

                {/* As mensagens agora aparecem dinamicamente aqui */}
                {mensagem && <div className={styles.successMessage}>{mensagem}</div>}
                {erro && <div className={styles.errorMessage}>{erro}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Código de verificação</label>
                        <input
                            type="text"
                            placeholder="Insira o código de 6 dígitos"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            maxLength={6}
                            disabled={carregando}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Nova Senha</label>
                        <input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            disabled={carregando}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.sendBtn}
                        disabled={carregando || !codigo || !senha}
                    >
                        {carregando ? 'Verificando...' : 'Confirmar Alteração'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default VerificarCodigo;