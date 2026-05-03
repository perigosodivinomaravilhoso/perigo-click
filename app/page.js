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
  const [msg, setMsg] = useState('');
  const [links, setLinks] = useState([]);

  // 🗑 Deletar link
  const deletar = async (code) => {
    if (!confirm('Tem certeza que deseja deletar?')) return;

    await fetch('/api/delete', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ code }),
      headers: { 'Content-Type': 'application/json' }
    });

    carregarLinks();
  };

  // 🔐 Verifica login
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

  // 📊 Carregar histórico
  const carregarLinks = async () => {
    try {
      const res = await fetch('/api/list', {
        credentials: 'include'
      });
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ Criar link
  const handleSubmit = async () => {
    if (!url) {
      setMsg('Digite uma URL');
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
      setMsg(`✅ Criado: https://perigo.click/${finalCode}`);
      setCode('');
      setUrl('');
      carregarLinks();
    } else {
      const text = await res.text();
      setMsg(`❌ ${text}`);
    }
  };

  // 📋 Copiar link
  const copiar = (c) => {
    navigator.clipboard.writeText(`https://perigo.click/${c}`);
    setMsg(`📋 Copiado: perigo.click/${c}`);
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Carregando...</p>;
  }

  return (
    <div style={{
      maxWidth: 700,
      margin: '60px auto',
      fontFamily: 'system-ui, sans-serif',
      padding: 20
    }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>
        🔗 Perigo.click
      </h1>

      {/* FORM */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginBottom: 20
      }}>
        <input
          placeholder="Código (opcional)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            padding: 12,
            border: '1px solid #ccc',
            borderRadius: 8
          }}
        />

        <input
          placeholder="URL de destino"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            padding: 12,
            border: '1px solid #ccc',
            borderRadius: 8
          }}
        />

        <button
          onClick={handleSubmit}
          style={{
            padding: 12,
            borderRadius: 8,
            background: '#111',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Criar link
        </button>
      </div>

      {msg && (
        <p style={{ marginBottom: 20 }}>{msg}</p>
      )}

      {/* LISTA */}
      <h2 style={{ marginBottom: 10 }}>📊 Seus links</h2>

      {links.length === 0 && <p>Nenhum link ainda</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {links.map((l) => (
          <div key={l.code} style={{
            border: '1px solid #eee',
            borderRadius: 10,
            padding: 15,
            background: '#fafafa'
          }}>
            <div style={{ fontWeight: 'bold' }}>
              perigo.click/{l.code}
            </div>

            <div style={{
              fontSize: 12,
              color: '#666',
              marginTop: 4
            }}>
              {l.url}
            </div>

            <div style={{
              marginTop: 8,
              fontSize: 13
            }}>
              👆 {l.clicks || 0} cliques
            </div>

            <button
              onClick={() => copiar(l.code)}
              style={{
                marginTop: 10,
                padding: 8,
                borderRadius: 6,
                border: '1px solid #ccc',
                cursor: 'pointer'
              }}
            >
              📋 Copiar link
            </button>

            <button
              onClick={() => deletar(l.code)}
              style={{
                marginTop: 6,
                padding: 8,
                borderRadius: 6,
                border: '1px solid #e00',
                color: '#e00',
                cursor: 'pointer',
                background: '#fff'
              }}
            >
              🗑 Deletar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
