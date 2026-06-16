import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../../../styles/Dashboard.module.css";

function MesasGarcom() {
    const navigate = useNavigate();
    const [mesas, setMesas] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/mesas', { credentials: 'include' })
            .then(r => r.json())
            .then(setMesas)
            .catch(() => {});
    }, []);

    return (
        <div className={styles.mesasGarcom}>
            <h2 className={styles.mesasTitulo}>Mesas</h2>
            <div className={styles.mesasGrid}>
                {mesas.length === 0 && (
                    <p className={styles.loadingText}>Nenhuma mesa cadastrada.</p>
                )}
                {mesas.map(mesa => (
                    <div
                        key={mesa.id}
                        className={`${styles.mesaCard} ${mesa.status === 'disponivel' ? styles.mesaLivre : styles.mesaOcupada}`}
                        onClick={() => navigate('/adicionarmesas')}
                    >
                        <span className={styles.mesaNumero}>Mesa {mesa.numero}</span>
                        <span className={styles.mesaStatusLabel}>
                            {mesa.status === 'disponivel' ? 'Livre' : 'Ocupada'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        const usuarioStr = localStorage.getItem("usuario");
        if (!usuarioStr) { navigate('/login'); return; }
        const usuarioObj = JSON.parse(usuarioStr);
        setUser(usuarioObj);

        if (usuarioObj.id_tipo === 1) {
            fetch('http://127.0.0.1:5000/usuarios', { method: 'GET', credentials: 'include' })
                .then(res => {
                    if (!res.ok) return res.json().then(e => { throw new Error(e.erro || res.statusText); });
                    return res.json();
                })
                .then(data => { setUsuarios(data); setLoading(false); })
                .catch(err => { setErro(err.message); setLoading(false); });
        } else {
            setLoading(false);
        }
    }, [navigate]);

    const desbloquear = async (id) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/admin/desbloquear/${id}`, {
                method: 'POST', credentials: 'include'
            });
            if (res.ok) setUsuarios(prev => prev.map(u => u.id === id ? { ...u, bloqueado: 'Não' } : u));
            else alert('Erro ao desbloquear usuário');
        } catch { alert('Erro de conexão'); }
    };

    return (
        <div className={styles.dashboardContainer}>
            <h1>Olá, {user.nome}
                <button className={styles.btnEditarPerfil} onClick={() => navigate('/editarperfil')}> Editar perfil</button>
            </h1>

            {user.id_tipo === 1 && <h2 className={styles.sectionTitle}>Usuários</h2>}

            <aside className={styles.sidebar}>
                <nav>
                    <ul>
                        <li><a href="/cardapio">Cardápio</a></li>
                        {user.id_tipo === 1 && <li><a href="/adicionarusuarios">Adicionar Usuários</a></li>}
                        {user.id_tipo === 1 && <li><a href="/adicionarmesas">Mesas</a></li>}
                    </ul>
                </nav>
            </aside>

            {user.id_tipo === 1 && (
                <div className={styles.cardsGrid}>
                    {loading && <p className={styles.loadingText}>Carregando usuários...</p>}
                    {erro && <p className={styles.errorText}>{erro}</p>}
                    {!loading && !erro && usuarios.map(u => (
                        <div key={u.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3>{u.nome}</h3>
                                <span className={`${styles.badge} ${u.tipo === 'admin' ? styles.badgeAdmin : styles.badgeGarcom}`}>
                                    {u.tipo === 'admin' ? 'ADM' : 'Garçom'}
                                </span>
                            </div>
                            <p className={styles.cardEmail}>{u.email}</p>
                            <div className={styles.cardMeta}>
                                <span className={`${styles.badge} ${u.bloqueado === 'Sim' ? styles.badgeBloqueado : styles.badgeAtivo}`}>
                                    {u.bloqueado === 'Sim' ? 'Bloqueado' : 'Ativo'}
                                </span>
                                {u.bloqueado === 'Sim' && (
                                    <button className={styles.btnDesbloquear} onClick={() => desbloquear(u.id)}>
                                        Desbloquear
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {user.id_tipo === 2 && <MesasGarcom />}
        </div>
    );
}

export default Dashboard;