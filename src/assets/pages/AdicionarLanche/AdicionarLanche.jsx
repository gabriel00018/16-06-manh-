import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../../../styles/AdiconarLanche.module.css";

export default function AdicionarLanche() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nome: '',
        descricao: '',
        preco: '',
        categoria: '',
        disponivel: true
    });
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const usuarioStr = localStorage.getItem("usuario");
        if (!usuarioStr) {
            navigate('/');
            return;
        }
        const usuario = JSON.parse(usuarioStr);
        if (Number(usuario.id_tipo) !== 1) {
            navigate('/cardapio');
        }
    }, []);

    const handleImagem = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagem(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        const nomeLimpo = form.nome.trim();
        const descricaoLimpa = form.descricao.trim();
        const preco = parseFloat(form.preco);

        if (!nomeLimpo) {
            setErro('Nome é obrigatório.');
            setTimeout(() => setErro(''), 3000);
            return;
        }
        //erro pão
        //if (!descricaoLimpa || !descricaoLimpa.toLowerCase().includes('pão')) {
        //  setErro('Descrição é obrigatória e precisa conter "Pão".');
        // setTimeout(() => setErro(''), 3000);
        //return;
        //}

        if (!form.preco || isNaN(preco) || preco < 0.01) {
            setErro('Preço deve ser pelo menos R$ 0,01.');
            setTimeout(() => setErro(''), 3000);
            return;
        }

        if (!form.categoria) {
            setErro('Selecione uma categoria.');
            setTimeout(() => setErro(''), 3000);
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('nome', nomeLimpo);
            formData.append('descricao', descricaoLimpa);
            formData.append('preco', form.preco);
            formData.append('categoria', form.categoria);
            formData.append('disponivel', form.disponivel ? '1' : '0');
            if (imagem) formData.append('imagem', imagem);

            const res = await fetch('http://127.0.0.1:5000/produto', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setSucesso('Produto cadastrado com sucesso!');
                setTimeout(() => navigate('/cardapio'), 2000);
            } else {
                setErro(data.erro || 'Erro ao cadastrar produto.');
                setTimeout(() => setErro(''), 3000);
            }
        } catch {
            setErro('Erro de conexão.');
            setTimeout(() => setErro(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <button className={styles.btnVoltar} onClick={() => navigate('/cardapio')}>
                    ← Voltar
                </button>
                <h1 className={styles.title}>Adicionar Lanche</h1>
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

            <div className={styles.card}>
                <div className={styles.uploadArea} onClick={() => document.getElementById('inputImagem').click()}>
                    {preview ? (
                        <img src={preview} alt="Preview" className={styles.preview} />
                    ) : (
                        <div className={styles.uploadPlaceholder}>
                            <span className={styles.uploadIcon}>🖼️</span>
                            <span>Clique para adicionar uma imagem</span>
                        </div>
                    )}
                </div>
                <input
                    id="inputImagem"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImagem}
                />

                <div className={styles.formGroup}>
                    <label className={styles.label}>Nome *</label>
                    <input
                        className={styles.input}
                        placeholder="Ex: X-Burguer"
                        value={form.nome}
                        onChange={e => setForm({ ...form, nome: e.target.value })}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Descrição</label>
                    <textarea
                        className={styles.input}
                        placeholder="Ex: Pão, carne 150g, queijo, alface e tomate"
                        value={form.descricao}
                        onChange={e => setForm({ ...form, descricao: e.target.value })}
                        rows={3}
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Preço (R$) *</label>
                        <input
                            className={styles.input}
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={form.preco}
                            onChange={e => setForm({ ...form, preco: e.target.value })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Categoria *</label>
                        <select
                            className={styles.input}
                            value={form.categoria}
                            onChange={e => setForm({ ...form, categoria: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            <option value="Hamburguer">Hamburguer</option>
                            <option value="Hot Dog">Hot Dog</option>
                            <option value="Bebidas">Bebidas</option>
                        </select>
                    </div>
                </div>

                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={form.disponivel}
                        onChange={e => setForm({ ...form, disponivel: e.target.checked })}
                    />
                    Disponível para pedidos
                </label>

                <button
                    className={styles.btnSalvar}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Salvando...' : '✓ Cadastrar Produto'}
                </button>
            </div>
        </div>
    );
}