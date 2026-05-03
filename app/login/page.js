'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert('Email ou senha incorretos');
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0f0f',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        width: 360,
        padding: 30,
        borderRadius: 12,
        background: '#1a1a1a',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: 25,
          fontSize: 24
        }}>
          🎬 Perigo.click
        </h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
            border: '1px solid #333',
            background: '#111',
            color: '#fff'
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 15,
            borderRadius: 8,
            border: '1px solid #333',
            background: '#111',
            color: '#fff'
          }}
        />

        <button
          onClick={login}
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            background: '#e50914',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p style={{
          textAlign: 'center',
          marginTop: 15,
          fontSize: 12,
          color: '#777'
        }}>
          Acesso restrito
        </p>
      </div>
    </div>
  );
}
