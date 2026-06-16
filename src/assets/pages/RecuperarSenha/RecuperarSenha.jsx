import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importei o useNavigate para ser mais moderno
import styles from "../../../styles/RecuperarSenha.module.css";

function RecuperarSenha() {
    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    async function recuperaSenha() {
        // 1. Resetar estados e iniciar carregamento
        setErro('');
        setMensagem('');
        setCarregando(true);

        try {
            const res = await fetch("http://127.0.0.1:5000/solicitar_recuperacao", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email,
                })
            });

            const dados = await res.json();

            // 2. VERIFICAÇÃO CRUCIAL: O servidor respondeu com sucesso (status 200)?
            if (res.ok) {
                // SUCESSO: E-mail existe e código foi gerado
                setMensagem(dados.mensagem || `Código enviado para ${email}!`);

                // Salva o e-mail para usar na próxima tela de verificação
                localStorage.setItem('email_recuperacao', email);

                // Redireciona após 2 segundos
                setTimeout(() => {
                    navigate('/verificar-codigo');
                }, 2000);

            } else {
                // ERRO: E-mail não existe (404) ou outro problema (400, 500)
                setErro(dados.erro || "Ocorreu um erro ao solicitar recuperação.");
            }

        } catch (error) {
            // ERRO DE REDE: Servidor desligado ou sem internet
            setErro("Não foi possível conectar ao servidor.");
            console.error("Erro na requisição:", error);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.recoveryCard}>
                <h2 className={styles.title}>Recuperação de senha</h2>

                {mensagem && <div className={styles.successMessage}>{mensagem}</div>}
                {erro && <div className={styles.errorMessage}>{erro}</div>}

                <div>
                    <div className={styles.formGroup}>
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Insira seu E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={carregando} // Desativa enquanto carrega
                            required
                        />
                    </div>

                    <button
                        type="button" // Mudei para button para evitar submits fantasmas
                        className={styles.sendBtn}
                        onClick={recuperaSenha}
                        disabled={carregando || !email} // Desativa se estiver carregando ou sem email
                    >
                        {carregando ? "enviando..." : "enviar"}
                    </button>

                    <Link to="/login" className={styles.backLink}>
                        Voltar para o login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default RecuperarSenha;