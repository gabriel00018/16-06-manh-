import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../../../styles/Cardapio.module.css";

export default function Cardapio() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [editando, setEditando] = useState(null);
    const [formEdicao, setFormEdicao] = useState({});
    const [confirmandoExcluir, setConfirmandoExcluir] = useState(null);
    const [modalPedido, setModalPedido] = useState(null);
    const [quantidade, setQuantidade] = useState(1);
    const [mesaSelecionada, setMesaSelecionada] = useState('');
    const [mesas, setMesas] = useState([]);
    const [loadingPedido, setLoadingPedido] = useState(false);
    const [observacao, setObservacao] = useState('');

    useEffect(() => {
        const usuarioStr = localStorage.getItem("usuario");
        if (usuarioStr) setUser(JSON.parse(usuarioStr));
        buscarProdutos();
        buscarMesas();
    }, []);

    const enviarPedido = async () => {
        if (!mesaSelecionada) {
            setErro('Selecione uma mesa.');
            setTimeout(() => setErro(''), 3000);
            return;
        }
        if (quantidade < 1) {
            setErro('Quantidade deve ser pelo menos 1.');
            setTimeout(() => setErro(''), 3000);
            return;
        }

        setLoadingPedido(true);
        try {
            const res = await fetch('http://127.0.0.1:5000/pedido', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id_mesa: mesaSelecionada,
                    observacoes: observacao,
                    itens: [{ id_produto: modalPedido.id, quantidade }]
                })
            });
            const data = await res.json();
            if (res.ok) {
                setSucesso('Pedido realizado com sucesso!');
                setModalPedido(null);
                setQuantidade(1);
                setMesaSelecionada('');
                setObservacao('');
                buscarMesas();
                setTimeout(() => setSucesso(''), 3000);
            } else {
                setErro(data.erro || 'Erro ao fazer pedido.');
                setTimeout(() => setErro(''), 3000);
            }
        } catch {
            setErro('Erro de conexão.');
            setTimeout(() => setErro(''), 3000);
        } finally {
            setLoadingPedido(false);
        }
    };

    const buscarMesas = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/mesas', { credentials: 'include' });
            const data = await res.json();
            setMesas(data); // CORRIGIDO: mostra todas as mesas, não só as disponíveis
        } catch {}
    };

    const buscarProdutos = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/produtos', { credentials: 'include' });
            const data = await res.json();
            setProdutos(data);
        } catch {
            setErro('Erro ao carregar produtos.');
        } finally {
            setLoading(false);
        }
    };

    const excluir = async (id) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/produto/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setSucesso('Produto excluído com sucesso!');
                setProdutos(prev => prev.filter(p => p.id !== id));
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

    const abrirEdicao = (produto) => {
        setEditando(produto.id);
        setFormEdicao({
            nome: produto.nome,
            descricao: produto.descricao,
            preco: produto.preco,
            categoria: produto.categoria,
            disponivel: produto.disponivel
        });
    };

    const salvarEdicao = async (id) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/produto/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formEdicao)
            });
            const data = await res.json();
            if (res.ok) {
                setSucesso('Produto atualizado!');
                setEditando(null);
                buscarProdutos();
                setTimeout(() => setSucesso(''), 3000);
            } else {
                setErro(data.erro || 'Erro ao editar.');
                setTimeout(() => setErro(''), 3000);
            }
        } catch {
            setErro('Erro de conexão.');
            setTimeout(() => setErro(''), 3000);
        }
    };

    const categorias = [...new Set(produtos.map(p => p.categoria))];

    return (
        <div className={styles.pageContainer}>

            {confirmandoExcluir !== null && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcone}>🗑️</div>
                        <h3 className={styles.modalTitulo}>Excluir produto?</h3>
                        <p className={styles.modalTexto}>Esta ação não pode ser desfeita.</p>
                        <div className={styles.modalBotoes}>
                            <button className={styles.modalBtnCancelar} onClick={() => setConfirmandoExcluir(null)}>
                                Cancelar
                            </button>
                            <button className={styles.modalBtnConfirmar} onClick={() => excluir(confirmandoExcluir)}>
                                Sim, excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalPedido && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitulo}>🍔 {modalPedido.nome}</h3>
                        <p className={styles.modalTexto}>R$ {Number(modalPedido.preco).toFixed(2).replace('.', ',')}</p>

                        <div className={styles.modalCampo}>
                            <label className={styles.modalLabel}>Quantidade</label>
                            <div className={styles.quantidadeRow}>
                                <button className={styles.btnQtd} onClick={() => setQuantidade(q => Math.max(1, q - 1))}>−</button>
                                <span className={styles.qtdValor}>{quantidade}</span>
                                <button className={styles.btnQtd} onClick={() => setQuantidade(q => q + 1)}>+</button>
                            </div>
                        </div>

                        <div className={styles.modalCampo}>
                            <label className={styles.modalLabel}>Mesa</label>
                            <select
                                className={styles.modalSelect}
                                value={mesaSelecionada}
                                onChange={e => setMesaSelecionada(e.target.value)}
                            >
                                <option value="">Selecione a mesa...</option>
                                {mesas.map(m => (
                                    <option key={m.id} value={m.id}>
                                        Mesa {m.numero} — {m.status === 'disponivel' ? 'Livre' : 'Ocupada'}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className={styles.modalCampo}>
                            <label className={styles.modalLabel}>Observação</label>
                            <textarea
                                className={styles.modalSelect}
                                placeholder="Ex: sem cebola, ponto da carne, alergias..."
                                value={observacao}
                                onChange={e => setObservacao(e.target.value)}
                                rows={3}
                                style={{ resize: 'none' }}
                            />
                        </div>


                        <div className={styles.modalTotal}>
                            Total: <strong>R$ {(modalPedido.preco * quantidade).toFixed(2).replace('.', ',')}</strong>
                        </div>

                        <div className={styles.modalBotoes}>
                            <button className={styles.modalBtnCancelar} onClick={() => { setModalPedido(null); setQuantidade(1); setMesaSelecionada(''); setObservacao(''); }}>
                                Cancelar
                            </button>
                            <button className={styles.modalBtnConfirmar} onClick={enviarPedido} disabled={loadingPedido}>
                                {loadingPedido ? 'Enviando...' : 'Confirmar Pedido'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.header}>
                <h1 className={styles.title}>Cardápio</h1>
                {user?.id_tipo === 1 && (
                    <button className={styles.btnAdicionar} onClick={() => navigate('/adicionar-lanche')}>
                        + Adicionar Lanche
                    </button>
                )}
            </div>

            {erro && (
                <div className={styles.toast + ' ' + styles.toastErro}>
                    <span>✕</span><span>{erro}</span>
                </div>
            )}
            {sucesso && (
                <div className={styles.toast + ' ' + styles.toastSucesso}>
                    <span>✓</span><span>{sucesso}</span>
                </div>
            )}

            {loading && <p className={styles.loadingText}>Carregando cardápio...</p>}

            {!loading && categorias.map(categoria => (
                <div key={categoria} className={styles.categoriaSection}>
                    <h2 className={styles.categoriaTitulo}>{categoria}</h2>
                    <div className={styles.cardsGrid}>
                        {produtos
                            .filter(p => p.categoria === categoria)
                            .map(produto => (
                                <div key={produto.id} className={`${styles.card} ${!produto.disponivel ? styles.cardIndisponivel : ''}`}>
                                    {editando === produto.id ? (
                                        <div className={styles.formEdicao}>
                                            <input
                                                className={styles.inputEdicao}
                                                value={formEdicao.nome}
                                                onChange={e => setFormEdicao({...formEdicao, nome: e.target.value})}
                                                placeholder="Nome"
                                            />
                                            <textarea
                                                className={styles.inputEdicao}
                                                value={formEdicao.descricao}
                                                onChange={e => setFormEdicao({...formEdicao, descricao: e.target.value})}
                                                placeholder="Descrição"
                                                rows={2}
                                            />
                                            <input
                                                className={styles.inputEdicao}
                                                type="number"
                                                step="0.01"
                                                value={formEdicao.preco}
                                                onChange={e => setFormEdicao({...formEdicao, preco: e.target.value})}
                                                placeholder="Preço"
                                            />
                                            <input
                                                className={styles.inputEdicao}
                                                value={formEdicao.categoria}
                                                onChange={e => setFormEdicao({...formEdicao, categoria: e.target.value})}
                                                placeholder="Categoria"
                                            />
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={formEdicao.disponivel}
                                                    onChange={e => setFormEdicao({...formEdicao, disponivel: e.target.checked})}
                                                />
                                                Disponível
                                            </label>
                                            <div className={styles.botoesEdicao}>
                                                <button className={styles.btnSalvar} onClick={() => salvarEdicao(produto.id)}>Salvar</button>
                                                <button className={styles.btnCancelar} onClick={() => setEditando(null)}>Cancelar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {produto.imagem && (
                                                <img
                                                    src={`http://127.0.0.1:5000${produto.imagem}`}
                                                    alt={produto.nome}
                                                    className={styles.cardImagem}
                                                />
                                            )}
                                            <div className={styles.cardTop}>
                                                <h3 className={styles.cardNome}>{produto.nome}</h3>
                                                {!produto.disponivel && (
                                                    <span className={styles.badgeIndisponivel}>Indisponível</span>
                                                )}
                                            </div>
                                            <p className={styles.cardDescricao}>{produto.descricao}</p>
                                            <p className={styles.cardPreco}>
                                                R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                                            </p>
                                            {produto.disponivel && (
                                                <button
                                                    className={styles.btnSelecionar}
                                                    onClick={() => { setModalPedido(produto); setQuantidade(1); setMesaSelecionada(''); }}
                                                >
                                                    + Selecionar
                                                </button>
                                            )}
                                            {user?.id_tipo === 1 && (
                                                <div className={styles.botoesAdmin}>
                                                    <button className={styles.btnEditar} onClick={() => abrirEdicao(produto)}>
                                                        ✏️ Editar
                                                    </button>
                                                    <button className={styles.btnExcluir} onClick={() => setConfirmandoExcluir(produto.id)}>
                                                        🗑️ Excluir
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            ))}

            {!loading && produtos.length === 0 && (
                <p className={styles.emptyText}>Nenhum produto cadastrado ainda.</p>
            )}
        </div>
    );
}