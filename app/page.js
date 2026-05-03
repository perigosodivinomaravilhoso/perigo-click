'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function gerarCodigo() {
  return Math.random().toString(36).substring(2, 8);
}

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [toast, setToast] = useState(null);
  const [order, setOrder] = useState('desc');

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 📊 DASHBOARD
  const totalLinks = links.length;
  const totalClicks = links.reduce((acc, l) => acc + (l.clicks || 0), 0);
  const topLink = links.reduce((prev, current) =>
    (current.clicks || 0) > (prev?.clicks || 0) ? current : prev,
    null
  );

  // 🔄 ordenação
  const sortedLinks = [...links].sort((a, b) => {
    return order === 'desc'
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at);
  });

  // 🗑 deletar
  const deletar = async (code) => {
    if (!confirm('Tem certeza que deseja deletar?')) return;

    await fetch('/api/delete', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ code }),
      headers: { 'Content-Type': 'application/json' }
    });

    showToast('Link deletado');
    carregarLinks();
  };

  // 🔐 login
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = '/login';
      } else {
        carregarLinks();
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // 📊 carregar
  const carregarLinks = async () => {
    const res = await fetch('/api/list', { credentials: 'include' });
    const data = await res.json();
    setLinks(data);
  };

  // ➕ criar
  const handleSubmit = async () => {
    if (!url) {
      showToast('❌ Digite uma URL', 'error');
      return;
    }

    const finalCode = code || gerarCodigo();

    const res = await fetch('/api/create', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ code: finalCode, url }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      showToast(`✅ Criado: perigo.click/${finalCode}`);
      setCode('');
      setUrl('');
      carregarLinks();
    } else {
      const text = await res.text();
      showToast(text, 'error');
    }
  };

  // 📋 copiar
  const copiar = (c) => {
    navigator.clipboard.writeText(`https://perigo.click/${c}`);
    showToast('📋 Link copiado!');
  };

  if (loading) return <p style={{ padding: 40 }}>Carregando...</p>;

  return (
    <div style={{
      maxWidth: 900,
      margin: '40px auto',
      fontFamily: 'system-ui, sans-serif',
      padding: 20
    }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>
        🔗 Perigo.click
      </h1>

      {/* DASHBOARD */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 30
      }}>
        <Card title="Links" value={totalLinks} />
        <Card title="Cliques" value={totalClicks} highlight />
        <Card title="Top link" value={topLink ? topLink.code : '—'} />
      </div>

      {/* FORM */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 30
      }}>
        <input
          placeholder="Código"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleSubmit} style={buttonStyle}>
          Criar
        </button>
      </div>

      {/* HEADER + FILTRO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
      }}>
        <h2>📊 Seus links</h2>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          style={{
            padding: 6,
            borderRadius: 6,
            border: '1px solid #ccc'
          }}
        >
          <option value="desc">Mais recentes</option>
          <option value="asc">Mais antigos</option>
        </select>
      </div>

      {links.length === 0 && <p>Nenhum link ainda</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sortedLinks.map((l) => (
          <div key={l.code} style={cardStyle}>

            {/* LINHA 1 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <strong>perigo.click/{l.code}</strong>

              <span style={{ fontSize: 12, color: '#999' }}>
                {new Date(l.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* LINHA 2 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              color: '#555'
            }}>
              <span>{l.url}</span>

              <span style={{
                paddingLeft: 10,
                borderLeft: '1px solid #ddd'
              }}>
                👆 {l.clicks || 0}
              </span>
            </div>

            {/* BOTÕES */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => copiar(l.code)} style={miniBtn}>
                Copiar
              </button>

              <button onClick={() => deletar(l.code)} style={deleteBtn}>
                Deletar
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '12px 16px',
          borderRadius: 8,
          background: toast.type === 'error' ? '#ff4d4f' : '#111',
          color: '#fff'
        }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

/* COMPONENTES */

const Card = ({ title, value, highlight }) => (
  <div style={{
    padding: 16,
    borderRadius: 10,
    background: highlight ? '#e50914' : '#111',
    color: '#fff'
  }}>
    <div style={{ fontSize: 12, opacity: 0.7 }}>{title}</div>
    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{value}</div>
  </div>
);

/* ESTILOS */

const inputStyle = {
  padding: 12,
  borderRadius: 8,
  border: '1px solid #ccc',
  flex: 1
};

const buttonStyle = {
  padding: 12,
  borderRadius: 8,
  background: '#111',
  color: '#fff',
  cursor: 'pointer'
};

const cardStyle = {
  border: '1px solid #eee',
  borderRadius: 10,
  padding: 15,
  background: '#fafafa'
};

const miniBtn = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 6,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer'
};

const deleteBtn = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 6,
  border: '1px solid #eee',
  color: '#999',
  background: '#fff',
  cursor: 'pointer'
};
