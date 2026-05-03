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

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 📊 DASHBOARD DATA
  const totalLinks = links.length;
  const totalClicks = links.reduce((acc, l) => acc + (l.clicks || 0), 0);
  const topLink = links.reduce((prev, current) =>
    (current.clicks || 0) > (prev?.clicks || 0) ? current : prev,
    null
  );

  // 🗑 Deletar
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

  // 🔐 Login
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

  // 📊 Carregar links
  const carregarLinks = async () => {
    const res = await fetch('/api/list', { credentials: 'include' });
    const data = await res.json();
    setLinks(data);
  };

  // ➕ Criar
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

  // 📋 Copiar
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

      {/* LISTA */}
      <h2 style={{ marginBottom: 10 }}>📊 Seus links</h2>

      {links.length === 0 && <p>Nenhum link ainda</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {links.map((l) => (
          <div key={l.code} style={cardStyle}>
            <div style={{ fontWeight: 'bold' }}>
              perigo.click/{l.code}
            </div>

            <div style={{ fontSize: 12, color: '#666' }}>
              {l.url}
            </div>

            <div style={{ fontSize: 13 }}>
              👆 {l.clicks || 0} cliques
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => copiar(l.code)} style={miniBtn}>
                📋 Copiar
              </button>

              <button onClick={() => deletar(l.code)} style={deleteBtn}>
                🗑 Deletar
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

/* COMPONENTES E ESTILOS */

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
  padding: 6,
  borderRadius: 6,
  border: '1px solid #ccc',
  cursor: 'pointer'
};

const deleteBtn = {
  padding: 6,
  borderRadius: 6,
  border: '1px solid #e00',
  color: '#e00',
  cursor: 'pointer',
  background: '#fff'
};
