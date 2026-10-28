import React, { useState } from 'react';
import { Smartphone, Zap, CheckCircle2, Copy, Send, HelpCircle, ArrowRight } from 'lucide-react';

export default function PhoneSetupGuide({ onSimulateCall }) {
  const [testPhone, setTestPhone] = useState('+39 340 123 4567');
  const [testName, setTestName] = useState('Marco Rossi');
  const [copied, setCopied] = useState(false);

  // Endpoint URL
  const webhookUrl = `${window.location.protocol}//${window.location.hostname}:3001/api/calls/incoming`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestSimulate = () => {
    if (!testPhone) {
      alert('Inserisci un numero di telefono per il test!');
      return;
    }
    onSimulateCall(testPhone, testName);
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
            <Smartphone size={24} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '700' }}>
              Guida Collegamento Smartphone (Caller ID in Tempo Reale)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Come trasmettere automaticamente al PC il numero e il nome di chi ti chiama sul cellulare.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Quick Testing Box */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '1rem', color: 'var(--primary)', marginBottom: '12px' }}>
          <Zap size={18} /> Test Rapido Simulatore Chiamata (Senza App)
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Puoi testare istantaneamente la finestra di chiamata e la presa d'ordine inserendo un numero qui sotto e cliccando su "Simula Chiamata":
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="Numero di telefono (es. +39 340...)"
            style={{ flex: 1, minWidth: '200px' }}
          />

          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Nome (opzionale per numeri sconosciuti)"
            style={{ flex: 1, minWidth: '200px' }}
          />

          <button
            onClick={handleTestSimulate}
            style={{
              background: 'var(--accent-green)',
              color: 'white',
              fontWeight: '700',
              padding: '10px 24px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px var(--accent-green-glow)'
            }}
          >
            <Send size={18} /> Simula Chiamata in Entrata
          </button>
        </div>
      </div>

      {/* Webhook Endpoint Info */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>
          1. Il tuo Webhook Endpoint del Gestionale
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Qualsiasi richiesta HTTP POST inviata a questo URL farà squillare il gestionale a schermo:
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px dashed var(--border-accent)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'monospace',
          fontSize: '0.95rem',
          color: '#34D399'
        }}>
          <span style={{ flex: 1, wordBreak: 'break-all' }}>{webhookUrl}</span>
          <button
            onClick={handleCopyUrl}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copied ? <CheckCircle2 size={16} color="var(--accent-green)" /> : <Copy size={16} />}
            {copied ? 'Copiato!' : 'Copia URL'}
          </button>
        </div>
      </div>

      {/* Step by Step Guide Android */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
          2. Configurazione Gratuita su Cellulare Android (con MacroDroid)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', shrink: 0 }}>
              1
            </div>
            <div>
              <b style={{ fontSize: '0.98rem' }}>Scarica l'app MacroDroid dal Play Store</b>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                MacroDroid è un'app gratuita per Android che permette di automatizzare eventi del telefono.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', shrink: 0 }}>
              2
            </div>
            <div>
              <b style={{ fontSize: '0.98rem' }}>Crea una Nuova Macro con Trigger "Chiamata in Arrivo"</b>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Aggiungi un <b>Trigger</b> -&gt; <i>Chiamate/SMS</i> -&gt; <i>Chiamata In Arrivo</i> (Seleziona "Da Qualsiasi Numero").
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', shrink: 0 }}>
              3
            </div>
            <div>
              <b style={{ fontSize: '0.98rem' }}>Aggiungi l'Azione "Richiesta HTTP GET/POST"</b>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Aggiungi un'<b>Azione</b> -&gt; <i>Applicazioni</i> -&gt; <i>Richiesta HTTP (POST)</i>.<br />
                Incolla l'URL: <code style={{ color: '#34D399' }}>{webhookUrl}</code><br />
                Parametri del Body / JSON: <code style={{ color: '#F472B6' }}>{"{ \"phone\": \"[call_number]\", \"name\": \"[call_name]\" }"}</code>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', shrink: 0 }}>
              4
            </div>
            <div>
              <b style={{ fontSize: '0.98rem' }}>Salva ed Attiva la Macro</b>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Fatto! Da questo momento ogni volta che il tuo cellulare riceverà una chiamata, il tuo computer mostrerà istantaneamente il pop-up del cliente ed aprirà la schermata di presa ordine!
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
