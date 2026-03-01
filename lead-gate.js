/*  lead-gate.js  –  Popup obligatorio de suscripción
    Incluir en cada herramienta con: <script src="lead-gate.js"></script>
    NO se activa en index.html
    Una vez suscrito, guarda en localStorage y no vuelve a aparecer.
    Envía nombre + email a GoHighLevel via webhook.
*/
(function(){
  // ========== CONFIG ==========
  const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/MIk6rZOxMRO5C9bFaZu1/webhook-trigger/28b92337-e7e4-4648-a113-33f99f8e1f4d';
  const STORAGE_KEY       = 'fbc_lead_subscribed';

  // No activar en index
  const path = window.location.pathname;
  if(path === '/' || path.endsWith('index.html') || path === '') return;

  // Ya suscrito?
  if(localStorage.getItem(STORAGE_KEY)) return;

  // ========== STYLES ==========
  const css = document.createElement('style');
  css.textContent = `
    .lg-overlay{position:fixed;inset:0;background:rgba(10,22,40,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:lgFadeIn .4s ease;}
    .lg-modal{background:linear-gradient(160deg,#132640,#17304d);border:1px solid #1f4672;border-radius:20px;padding:40px 32px;max-width:440px;width:100%;position:relative;animation:lgSlideUp .5s ease;box-shadow:0 20px 60px rgba(0,0,0,.5);}
    .lg-modal::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0b80e1,#11b3b7);border-radius:20px 20px 0 0;}
    .lg-brand{text-align:center;font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:300;letter-spacing:5px;text-transform:uppercase;color:#fff;margin-bottom:6px;}
    .lg-brand-line{display:block;width:60%;height:1px;background:linear-gradient(90deg,transparent,#0b80e1,#11b3b7,transparent);margin:6px auto 24px;}
    .lg-emoji{text-align:center;font-size:48px;margin-bottom:12px;}
    .lg-title{text-align:center;font-size:22px;font-weight:700;color:#fff;margin-bottom:8px;line-height:1.3;}
    .lg-sub{text-align:center;font-size:14px;color:#8da4bf;line-height:1.6;margin-bottom:28px;}
    .lg-field{margin-bottom:14px;}
    .lg-field input{width:100%;padding:14px 16px;background:#0d1b2e;border:1.5px solid #1f4672;border-radius:10px;font-family:'Century Gothic','Questrial','Futura',sans-serif;font-size:15px;font-weight:500;color:#e4eaf2;transition:all .25s;outline:none;}
    .lg-field input::placeholder{color:#5a7a9b;}
    .lg-field input:focus{border-color:#0b80e1;box-shadow:0 0 0 3px rgba(11,128,225,.2);}
    .lg-error{font-size:12px;color:#e85454;margin-top:4px;display:none;}
    .lg-btn{width:100%;padding:16px;background:linear-gradient(135deg,#0b80e1,#11b3b7);border:none;border-radius:10px;font-family:'Century Gothic','Questrial','Futura',sans-serif;font-size:16px;font-weight:700;color:#fff;cursor:pointer;transition:all .3s;margin-top:8px;}
    .lg-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(11,128,225,.35);}
    .lg-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none;}
    .lg-footer{text-align:center;margin-top:18px;font-size:12px;color:#5a7a9b;line-height:1.5;}
    .lg-footer a{color:#11b3b7;text-decoration:none;}
    .lg-spinner{display:inline-block;width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:lgSpin .6s linear infinite;vertical-align:middle;margin-right:6px;}
    .lg-success{text-align:center;padding:20px 0;}
    .lg-success-icon{font-size:56px;margin-bottom:12px;}
    .lg-success-title{font-size:20px;font-weight:700;color:#11b3b7;margin-bottom:6px;}
    .lg-success-sub{font-size:14px;color:#8da4bf;}
    @keyframes lgFadeIn{from{opacity:0}to{opacity:1}}
    @keyframes lgSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    @keyframes lgSpin{to{transform:rotate(360deg)}}
    @media(max-width:480px){.lg-modal{padding:32px 20px;}.lg-title{font-size:19px;}}
  `;
  document.head.appendChild(css);

  // ========== HTML ==========
  const overlay = document.createElement('div');
  overlay.className = 'lg-overlay';
  overlay.innerHTML = `
    <div class="lg-modal">
      <div class="lg-brand">NICO PASSINI<span class="lg-brand-line"></span></div>
      <div class="lg-emoji">🔓</div>
      <div class="lg-title">Accedé gratis a esta herramienta</div>
      <div class="lg-sub">Dejá tu nombre y email para desbloquear la calculadora. Es gratis, sin spam, y te vas a enterar antes que nadie de nuevas herramientas y contenido.</div>
      <div id="lgForm">
        <div class="lg-field">
          <input type="text" id="lgName" placeholder="Tu nombre" autocomplete="given-name">
          <div class="lg-error" id="lgNameErr">Ingresá tu nombre</div>
        </div>
        <div class="lg-field">
          <input type="email" id="lgEmail" placeholder="Tu email" autocomplete="email">
          <div class="lg-error" id="lgEmailErr">Ingresá un email válido</div>
        </div>
        <button class="lg-btn" id="lgBtn" onclick="window._lgSubmit()">Desbloquear herramienta →</button>
      </div>
      <div class="lg-footer">🔒 Tu información está segura. <a href="https://www.instagram.com/nicopassini_" target="_blank">@nicopassini_</a></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Block scroll
  document.body.style.overflow = 'hidden';

  // Focus first field
  setTimeout(()=>document.getElementById('lgName').focus(), 500);

  // Enter key
  overlay.addEventListener('keypress', function(e){
    if(e.key === 'Enter') window._lgSubmit();
  });

  // ========== SUBMIT ==========
  window._lgSubmit = async function(){
    const nameInput = document.getElementById('lgName');
    const emailInput = document.getElementById('lgEmail');
    const nameErr = document.getElementById('lgNameErr');
    const emailErr = document.getElementById('lgEmailErr');
    const btn = document.getElementById('lgBtn');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    // Validate
    let valid = true;
    nameErr.style.display = 'none';
    emailErr.style.display = 'none';
    nameInput.style.borderColor = '#1f4672';
    emailInput.style.borderColor = '#1f4672';

    if(!name){
      nameErr.style.display = 'block';
      nameInput.style.borderColor = '#e85454';
      valid = false;
    }
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      emailErr.style.display = 'block';
      emailInput.style.borderColor = '#e85454';
      valid = false;
    }
    if(!valid) return;

    // Loading
    btn.disabled = true;
    btn.innerHTML = '<span class="lg-spinner"></span> Enviando...';

    try {
      // GHL Webhook Integration
      const params = new URLSearchParams({ first_name: name, email: email, source: 'Herramientas NicoPassini.com' });
      var img = new Image();
      img.src = GHL_WEBHOOK_URL + '?' + params.toString();

      // Even if GHL returns non-200, we let them through
      // (don't block users because of API issues)
    } catch(e) {
      console.warn('GHL error:', e);
      // Still let them through
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name: name,
      email: email,
      date: new Date().toISOString(),
      tool: window.location.pathname
    }));

    // Success animation
    document.getElementById('lgForm').innerHTML = `
      <div class="lg-success">
        <div class="lg-success-icon">✅</div>
        <div class="lg-success-title">¡Listo, ${name.split(' ')[0]}!</div>
        <div class="lg-success-sub">Ya podés usar la herramienta</div>
      </div>
    `;

    // Close after 1.5s
    setTimeout(()=>{
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .3s ease';
      setTimeout(()=>{
        overlay.remove();
        document.body.style.overflow = '';
      }, 300);
    }, 1500);
  };
})();
