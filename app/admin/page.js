if (typeof window !== 'undefined') {
  const senha = prompt("Senha?");
  if (senha !== "sua-senha-aqui") {
    document.body.innerHTML = "Acesso negado";
  }
}

'use client';

import { useState } from 'react';

export default function Admin() {
  const [code, setCode] = useState('');
  const [url, setUrl] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/create', {
      method: 'POST',
      body: JSON.stringify({ code, url }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      setMsg(`Criado: perigo.click/${code}`);
    } else {
      setMsg('Erro');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Perigo.click</h1>

      <input
        placeholder="Código"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>Criar</button>

      <p>{msg}</p>
    </div>
  );
}
