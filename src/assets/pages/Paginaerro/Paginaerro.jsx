import { Link } from "react-router-dom";
import styles from "../../../styles/Paginaerro.module.css";

function Paginaerro() {
    return (
        <div className={styles.errorContainer}>
            <div className={styles.errorCard}>
                <h1 className={styles.errorCode}>404</h1>
                <h2 className={styles.errorTitle}>Ops! Página não encontrada</h2>
                <p className={styles.errorMessage}>
                    A página que você está procurando pode ter sido removida,
                    teve o nome alterado ou está temporariamente indisponível.
                </p>
                <Link to="/dashboard" className={styles.homeButton}>
                    Voltar para home
                </Link>
            </div>
        </div>
    );
}

export default Paginaerro;