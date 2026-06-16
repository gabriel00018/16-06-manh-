import styles from "../../../styles/Header.module.css";
import logo from "../../../public/logo.png";

function Header() {

    const handleLogout = async () => {
        await fetch("http://127.0.0.1:5000/logout", {
            method: "POST",
            credentials: "include"
        });

        localStorage.removeItem('usuario');
        localStorage.removeItem('logado');
        localStorage.removeItem('email_recuperacao');
        localStorage.removeItem('codigo_recuperacao');

        window.location.href = '/login';
    };

    // ✅ Verifica se está logado e redireciona
    const handleInicio = (e) => {
        e.preventDefault();
        const logado = localStorage.getItem('logado');
        if (logado) {
            window.location.href = '/dashboard';
        }
        // Se não estiver logado, não faz nada
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                <img src={logo} alt="Top Lanches" className={styles.logo} />
            </div>
            <nav>
                <ul className={styles.navList}>
                    {/* ✅ Início só redireciona se estiver logado */}
                    <li><a href="/" onClick={handleInicio} className={styles.navLink}>Início</a></li>


                    <li>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            Sair
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;