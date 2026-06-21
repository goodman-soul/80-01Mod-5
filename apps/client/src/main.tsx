import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>康复器械管理平台</h1>
        <p style={styles.subtitle}>请选择您的访问入口</p>
      </div>
      <div style={styles.cards}>
        <a href="/admin.html" style={styles.card}>
          <div style={styles.cardIcon}>🏢</div>
          <h2 style={styles.cardTitle}>管理端</h2>
          <p style={styles.cardDesc}>仓管和管家工作台</p>
        </a>
        <a href="/h5.html" style={{ ...styles.card, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={styles.cardIcon}>📱</div>
          <h2 style={{ ...styles.cardTitle, color: '#fff' }}>用户端</h2>
          <p style={{ ...styles.cardDesc, color: 'rgba(255,255,255,0.85)' }}>老人借用康复器械</p>
        </a>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    margin: 0,
  },
  cards: {
    display: 'flex',
    gap: 40,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 280,
    height: 280,
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: '#fff',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    cursor: 'pointer',
  },
  cardIcon: {
    fontSize: 72,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 600,
    margin: 0,
    marginBottom: 8,
    color: '#fff',
  },
  cardDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    margin: 0,
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
