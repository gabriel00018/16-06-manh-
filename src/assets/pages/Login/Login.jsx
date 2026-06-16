import { useState } from 'react';
import styles from "../../../styles/Login.module.css";
import {Link} from "react-router-dom";

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');




    async function entrar() {
        var resposta = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                senha: senha,

            })
        })

        resposta = await resposta.json();

        if (resposta.usuario) {

            // Salva Usuario
            localStorage.setItem("usuario", JSON.stringify(resposta.usuario));

            // Logado
            localStorage.setItem("logado", true);

            // token
            localStorage.setItem("token", resposta.token)

            window.location.href = '/dashboard';

        } else {
            setErro(resposta.erro);
        }

        console.log(resposta);
    }



    return (
        <div className={styles.pageContainer}>
            <div className={styles.loginCard}>
                <h2 className={styles.loginTitle}>Login</h2>

                {erro && <div className={styles.errorMessage}>{erro}</div>}

                <div>
                    <div className={styles.formGroup}>
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Insira seu E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Senha:</label>
                        <input
                            type="password"
                            placeholder="Insira sua Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.loginBtn}
                        onClick={entrar}
                    >
                        Entrar
                    </button>

                    <Link to="/recuperar-senha" className={styles.forgotLink}>
                        Esqueci minha senha!
                    </Link>

                    <Link to="/confirmar-codigo" className={styles.forgotLink}>
                        Confirmar código
                    </Link>

                </div>
            </div>
        </div>
    );
}

export default Login;