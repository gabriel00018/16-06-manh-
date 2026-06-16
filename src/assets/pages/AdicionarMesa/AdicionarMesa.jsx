import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../../../styles/AdicionarMesa.module.css";

export default function AdicionarMesa() {
    const navigate = useNavigate();
    const [mesas, setMesas] = useState([]);
    const [numero, setNumero] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmandoExcluir, setConfirmandoExcluir] = useState(null);
    const [mesaAberta, setMesaAberta] = useState(null);
    const [itens, setItens] = useState([]);
    const [totalMesa, setTotalMesa] = useState(0);
    const [confirmandoPagar, setConfirmandoPagar] = useState(false);
    const [confirmandoExcluirItem, setConfirmandoExcluirItem] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [pagamentoParcial, setPagamentoParcial] = useState(false);
    const [itensSelecionados, setItensSelecionados] = useState([]);

    useEffect(() => {
        const usuarioStr = localStorage.getItem("usuario");
        if (!usuarioStr) { navigate('/'); return; }
        const u = JSON.parse(usuarioStr);
        setUsuario(u);
        buscarMesas();
    }, []);

    const buscarMesas = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/mesas', { credentials: 'include' });
            const data = await res.json();
            setMesas(data);
        } catch {
            setErro('Erro ao carregar mesas.');
        }
    };

    const numerosDisponiveis = Array.from({ length: 10 }, (_, i) => i + 1)
        .filter(n => !mesas.some(m => m.numero === n));

    const handleAdicionar = async () => {
        if (!numero) {
            setErro('Selecione um número de mesa.');
            setTimeout(() => setErro(''), 3000);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:5000/mesa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ numero: parseInt(numero) })
            });
            const data = await res.json();
            if (res.ok) {
                setSucesso(`Mesa ${numero} adicionada!`);
                setNumero('');
                buscarMesas();
                setTimeout(() => setSucesso(''), 3000);
            } else {
                setErro(data.erro || 'Erro ao adicionar mesa.');
                setTimeout(() => setErro(''), 3000);
            }
        } catch {
            setErro('Erro de conexão.');
            setTimeout(() => setErro(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleExcluir = async (id) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/mesa/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setSucesso('Mesa excluída!');
                buscarMesas();
                setTimeout(() => setSucesso(''), 3000);
            } else {
                setErro(data.erro || 'Erro ao excluir.');
                setTimeout(() => setErro(''), 3000);
            }
        } catch {
            setErro('Erro de conexão.');
            setTimeout(() => setErro(''), 3000);
        } finally {
            setConfirmandoExcluir(null);
        }
    };

    const abrirMesa = async (mesa) => {
        setMesaAberta(mesa);
        try {
            const res = await fetch(`http://127.0.0.1:5000/mesa/${mesa.id}/itens`, { credentials: 'include' });
            const data = await res.json();
            setItens(data.itens || []);
            setTotalMesa(data.total || 0);
        } catch {
            setErro('Erro ao carregar itens da mesa.');
            setTimeout(() => setErro(''), 3000);
        }
    };

    const handleExcluirItem = async (id_item) => {
        setConfirmandoExcluirItem(null);

        // 1. DELETE do item
        let deleteOk = false;
        try {
            const res = await fetch(`http://127.0.0.1:5000/item_pedido/${id_item}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                deleteOk = true;
                setSucesso('Item removido!');
                setTimeout(() => setSucesso(''), 3000);
            } else {
                setErro(data.erro || 'Erro ao remover item.');
                setTimeout(() => setErro(''), 3000);
                return;
            }
        } catch {
            setErro('Erro de conexão ao remover item.');
            setTimeout(() => setErro(''), 3000);
            return;
        }

        // 2. Recarrega itens separado — erro aqui não afeta o fluxo principal
        if (!deleteOk || !mesaAberta) return;

        try {
            const res2 = await fetch(`http://127.0.0.1:5000/mesa/${mesaAberta.id}/itens`, { credentials: 'include' });
            const data2 = await res2.json();
            const novosItens = data2.itens || [];
            setItens(novosItens);
            setTotalMesa(data2.total || 0);
            if (novosItens.length === 0) {
                setMesaAberta(null);
                buscarMesas();
            }
        } catch {
            // Recarregamento falhou, mas item foi excluído — fecha modal e atualiza grade
            setMesaAberta(null);
            buscarMesas();
        }
    };

    const handlePagar = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/mesa/${mesaAberta.id}/pagar`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setSucesso('Mesa paga e liberada!');
                setTimeout(() => setSucesso(''), 3000);
                setMesaAberta(null);
                buscarMesas();
            } else {
                setErro(data.erro || 'Erro ao pagar.');
                setTimeout(() => setErro(''), 3000);
            }
        } catch {
            setErro('Erro de conexão.');
            setTimeout(() => setErro(''), 3000);
        } finally {
            setConfirmandoPagar(false);
        }
    };

    const handlePagarParcial = async () => {
        if (itensSelecionados.length === 0) {
            setErro('Selecione pelo menos um item.');
            setTimeout(() => setErro(''), 3000);
            return;
        }
        try {
            const res = await fetch(`http://127.0.0.1:5000/mesa/${mesaAberta.id}/pagar_parcial`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ itens: itensSelecionados })
            });
            const data = await res.json();
            if (res.ok) {
                setSucesso('Pagamento parcial realizado!');
                setTimeout(() => setSucesso(''), 3000);
                setPagamentoParcial(false);
                setItensSelecionados([]);
                // Recarrega itens ou fecha se ficou vazio
                const res2 = await fetch(`http://127.0.0.1:5000/mesa/${mesaAberta.id}/itens`, { credentials: 'include' });
                const data2 = await res2.json();
                const novosItens = data2.itens || [];
                setItens(novosItens);
                setTotalMesa(data2.total || 0);
                if (novosItens.length === 0) { setMesaAberta(null); buscarMesas(); }
                else buscarMesas();
            } else {
                setErro(data.erro || 'Erro ao pagar parcial.');
                setTimeout(() => setErro(''), 3000);
            }
        } catch {
            setErro('Erro de conexão.');
            setTimeout(() => setErro(''), 3000);
        }
    };

    const toggleItemSelecionado = (id_item) => {
        setItensSelecionados(prev =>
            prev.includes(id_item) ? prev.filter(i => i !== id_item) : [...prev, id_item]
        );
    };


    return (
        <div className={styles.pageContainer}>

            {/* Modal de itens da mesa — renderizado PRIMEIRO (fica atrás) */}
            {mesaAberta && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalItensMesa}>
                        <div className={styles.modalItensHeader}>
                            <h3 className={styles.modalTitulo}>Mesa {mesaAberta.numero}</h3>
                            <button className={styles.btnFecharModal} onClick={() => setMesaAberta(null)}>✕</button>
                        </div>
                        {itens.length === 0 ? (
                            <p className={styles.emptyText}>Nenhum item nesta mesa.</p>
                        ) : (
                            <>
                                <div className={styles.listaItens}>
                                    {itens.map(item => (
                                        <div
                                            key={item.id_item}
                                            className={`${styles.itemRow} ${pagamentoParcial && itensSelecionados.includes(item.id_item) ? styles.itemSelecionado : ''}`}
                                            onClick={() => pagamentoParcial && toggleItemSelecionado(item.id_item)}
                                            style={{ cursor: pagamentoParcial ? 'pointer' : 'default' }}
                                        >
                                            {pagamentoParcial && (
                                                <input
                                                    type="checkbox"
                                                    readOnly
                                                    checked={itensSelecionados.includes(item.id_item)}
                                                    className={styles.checkboxItem}
                                                />
                                            )}
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemNome}>{item.produto}</span>
                                                <span className={styles.itemQtd}>x{item.quantidade}</span>
                                                {item.observacao && (
                                                    <span className={styles.itemObs}>📝 {item.observacao}</span>
                                                )}
                                            </div>
                                            <div className={styles.itemDireita}>
                                                <span className={styles.itemPreco}>R$ {item.subtotal.toFixed(2)}</span>
                                                {!pagamentoParcial && (
                                                    <button
                                                        className={styles.btnExcluirItem}
                                                        onClick={() => setConfirmandoExcluirItem(item.id_item)}
                                                    >🗑️</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.totalRow}>
                                    <span>Total</span>
                                    <span className={styles.totalValor}>
        R$ {pagamentoParcial
                                        ? itens.filter(i => itensSelecionados.includes(i.id_item)).reduce((s, i) => s + i.subtotal, 0).toFixed(2)
                                        : totalMesa.toFixed(2)}
    </span>
                                </div>

                                {!pagamentoParcial ? (
                                    <div className={styles.botoesModal}>
                                        <button className={styles.btnPagarParcial} onClick={() => { setPagamentoParcial(true); setItensSelecionados([]); }}>
                                            💳 Pagamento Parcial
                                        </button>
                                        <button className={styles.btnPagar} onClick={() => setConfirmandoPagar(true)}>
                                            ✅ Marcar como Pago
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.botoesModal}>
                                        <button className={styles.btnCancelarParcial} onClick={() => { setPagamentoParcial(false); setItensSelecionados([]); }}>
                                            Cancelar
                                        </button>
                                        <button className={styles.btnPagar} onClick={handlePagarParcial}>
                                            ✅ Pagar Selecionados ({itensSelecionados.length})
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modais de confirmação — renderizados DEPOIS (ficam na frente) */}
            {confirmandoExcluirItem !== null && (
                <div className={`${styles.modalOverlay} ${styles.modalOverlayTop}`}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcone}>🗑️</div>
                        <h3 className={styles.modalTitulo}>Remover item?</h3>
                        <p className={styles.modalTexto}>O item será removido do pedido.</p>
                        <div className={styles.modalBotoes}>
                            <button className={styles.modalBtnCancelar} onClick={() => setConfirmandoExcluirItem(null)}>Cancelar</button>
                            <button className={styles.modalBtnConfirmar} onClick={() => handleExcluirItem(confirmandoExcluirItem)}>Sim, remover</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmandoPagar && (
                <div className={`${styles.modalOverlay} ${styles.modalOverlayTop}`}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcone}>💳</div>
                        <h3 className={styles.modalTitulo}>Confirmar pagamento?</h3>
                        <p className={styles.modalTexto}>A mesa será liberada após o pagamento.</p>
                        <div className={styles.modalBotoes}>
                            <button className={styles.modalBtnCancelar} onClick={() => setConfirmandoPagar(false)}>Cancelar</button>
                            <button className={styles.modalBtnConfirmar} onClick={handlePagar}>Sim, pago!</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmandoExcluir !== null && (
                <div className={`${styles.modalOverlay} ${styles.modalOverlayTop}`}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcone}>🗑️</div>
                        <h3 className={styles.modalTitulo}>Excluir mesa?</h3>
                        <p className={styles.modalTexto}>Esta ação não pode ser desfeita.</p>
                        <div className={styles.modalBotoes}>
                            <button className={styles.modalBtnCancelar} onClick={() => setConfirmandoExcluir(null)}>Cancelar</button>
                            <button className={styles.modalBtnConfirmar} onClick={() => handleExcluir(confirmandoExcluir)}>Sim, excluir</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.header}>
                <button className={styles.btnVoltar} onClick={() => navigate('/dashboard')}>← Voltar</button>
                <h1 className={styles.title}>
                    {usuario && Number(usuario.id_tipo) === 1 ? 'Gerenciar Mesas' : 'Mesas'}
                </h1>
            </div>

            {erro && <div className={styles.toast + ' ' + styles.toastErro}><span>✕</span><span>{erro}</span></div>}
            {sucesso && <div className={styles.toast + ' ' + styles.toastSucesso}><span>✓</span><span>{sucesso}</span></div>}

            {usuario && Number(usuario.id_tipo) === 1 && (
                <div className={styles.card}>
                    <h2 className={styles.cardTitulo}>Adicionar Mesa</h2>
                    <p className={styles.cardSubtitulo}>{mesas.length}/10 mesas cadastradas</p>
                    {mesas.length < 10 ? (
                        <div className={styles.formRow}>
                            <select className={styles.select} value={numero} onChange={e => setNumero(e.target.value)}>
                                <option value="">Selecione o número...</option>
                                {numerosDisponiveis.map(n => (
                                    <option key={n} value={n}>Mesa {n}</option>
                                ))}
                            </select>
                            <button className={styles.btnAdicionar} onClick={handleAdicionar} disabled={loading}>
                                {loading ? 'Adicionando...' : '+ Adicionar'}
                            </button>
                        </div>
                    ) : (
                        <p className={styles.limiteTexto}>⚠️ Limite de 10 mesas atingido.</p>
                    )}
                </div>
            )}

            <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Mesas Cadastradas</h2>
                {mesas.length === 0 ? (
                    <p className={styles.emptyText}>Nenhuma mesa cadastrada ainda.</p>
                ) : (
                    <div className={styles.mesasGrid}>
                        {[...mesas].sort((a, b) => a.numero - b.numero).map(mesa => (
                            <div
                                key={mesa.id}
                                className={`${styles.mesaCard} ${mesa.status !== 'disponivel' ? styles.mesaCardOcupada : ''}`}
                                onClick={() => mesa.status !== 'disponivel' && abrirMesa(mesa)}
                                style={{ cursor: mesa.status !== 'disponivel' ? 'pointer' : 'default' }}
                            >
                                <div className={styles.mesaNumero}>Mesa {mesa.numero}</div>
                                <div className={`${styles.mesaStatus} ${mesa.status === 'disponivel' ? styles.statusDisponivel : styles.statusOcupada}`}>
                                    {mesa.status === 'disponivel' ? 'Disponível' : 'Ocupada'}
                                </div>
                                {usuario && Number(usuario.id_tipo) === 1 && (
                                    <button
                                        className={styles.btnExcluirMesa}
                                        onClick={e => { e.stopPropagation(); setConfirmandoExcluir(mesa.id); }}
                                    >🗑️</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}