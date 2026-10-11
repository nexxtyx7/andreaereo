/* André Aéreas — interações do site
 * A busca continua demonstrativa. Para ativar contas e recuperação real,
 * preencha SUPABASE_URL e SUPABASE_ANON_KEY com as credenciais PUBLICÁVEIS
 * do seu projeto Supabase (nunca coloque service_role aqui).
 */
(() => {
  'use strict';

  const CONTACTS = {
    whatsapp: 'https://wa.me/553591793515',
    instagram: 'https://www.instagram.com/andre_aereas?psln=anN1OXIyd2J1ZnN3'
  };
  const SUPABASE_URL = 'https://dbpzhcfscgdngdykepcy.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_AnTYz37axiEDXBRoaj3A-Q_zE5OeuoI';
  const authConfigured = /^https:\/\//.test(SUPABASE_URL) &&
    !SUPABASE_URL.includes('COLE_AQUI') && !SUPABASE_ANON_KEY.includes('COLE_AQUI');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = (message) => {
    const node = $('#toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('show'), 3600);
  };

  // Menu mobile
  const menuButton = $('.menu-toggle');
  if (menuButton) {
    menuButton.addEventListener('click', () => {
      const nav = $('.desktop-nav');
      if (!nav) return;
      const open = nav.classList.toggle('mobile-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    $$('.desktop-nav a').forEach(link => link.addEventListener('click', () => {
      $('.desktop-nav')?.classList.remove('mobile-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  // Busca de demonstração
  let tripType = 'round';
  $$('.trip-type').forEach(button => button.addEventListener('click', () => {
    tripType = button.dataset.trip || 'round';
    $$('.trip-type').forEach(item => item.classList.toggle('active', item === button));
    const returnInput = $('#return');
    const returnField = $('.return-field');
    if (returnInput && returnField) {
      const isRound = tripType === 'round';
      returnInput.required = isRound;
      returnInput.disabled = !isRound;
      returnField.style.opacity = isRound ? '1' : '.45';
    }
    if (tripType === 'multi') toast('Múltiplos destinos: modo demonstrativo com rota inicial.');
  }));

  $('#swap')?.addEventListener('click', () => {
    const origin = $('#origin');
    const destination = $('#destination');
    if (origin && destination) [origin.value, destination.value] = [destination.value, origin.value];
  });

  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  ['#departure', '#return'].forEach(selector => {
    const input = $(selector);
    if (input) input.min = localDate;
  });
  $('#departure')?.addEventListener('change', event => {
    const ret = $('#return');
    if (!ret) return;
    ret.min = event.target.value || localDate;
    if (ret.value && ret.value < ret.min) ret.value = '';
  });

  const demoFlights = [
    { airline: 'André Aéreas', code: 'AA 204', from: '08:15', to: '19:30', duration: '11h 15min', hours: 675, stops: 0, price: 2890 },
    { airline: 'André Aéreas', code: 'AA 318', from: '13:40', to: '06:10', duration: '12h 30min', hours: 750, stops: 1, price: 2340 },
    { airline: 'André Aéreas', code: 'AA 422', from: '22:05', to: '14:25', duration: '13h 20min', hours: 800, stops: 1, price: 1980 }
  ];
  const brl = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  function renderFlights() {
    const list = $('#flight-results');
    if (!list) return;
    const filter = $('#stops-filter')?.value || 'all';
    const sort = $('#sort-results')?.value || 'price';
    let flights = demoFlights.filter(f => filter === 'all' || (filter === 'direct' ? f.stops === 0 : f.stops > 0));
    flights.sort((a, b) => sort === 'duration' ? a.hours - b.hours : a.price - b.price);
    list.innerHTML = '';
    $('#empty-results')?.toggleAttribute('hidden', flights.length > 0);
    flights.forEach(flight => {
      const card = document.createElement('article');
      card.className = 'flight-result';
      card.style.cssText = 'display:grid;grid-template-columns:1fr 1.3fr auto;align-items:center;gap:16px;padding:18px 0;border-bottom:1px solid #e5eaf0';
      card.innerHTML = '<div><strong></strong><small style="display:block;opacity:.7"></small></div><div><strong></strong><small style="display:block;opacity:.7"></small></div><div style="text-align:right"><strong></strong><small style="display:block;opacity:.7">por passageiro</small><a class="button button-primary" style="display:inline-flex;margin-top:8px;padding:10px 14px;font-size:12px" target="_blank" rel="noopener noreferrer">Consultar no WhatsApp ↗</a></div>';
      const blocks = card.querySelectorAll('div');
      blocks[0].querySelector('strong').textContent = flight.airline;
      blocks[0].querySelector('small').textContent = flight.code;
      blocks[1].querySelector('strong').textContent = flight.from + '  →  ' + flight.to;
      blocks[1].querySelector('small').textContent = flight.duration + ' · ' + (flight.stops ? flight.stops + ' escala' : 'direto');
      blocks[2].querySelector('strong').textContent = brl(flight.price);
      const message = 'Olá! Gostaria de cotar a opção demonstrativa ' + flight.code + '. Rota: ' + $('#origin').value + ' para ' + $('#destination').value + '. Entendo que o preço exibido é ilustrativo.';
      blocks[2].querySelector('a').href = CONTACTS.whatsapp + '?text=' + encodeURIComponent(message);
      list.appendChild(card);
    });
  }
  $('#sort-results')?.addEventListener('change', renderFlights);
  $('#stops-filter')?.addEventListener('change', renderFlights);

  const modal = $('#results-modal');
  function closeResults() {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
  }
  $$('[data-close]').forEach(button => button.addEventListener('click', closeResults));
  $('#flight-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const origin = $('#origin')?.value.trim();
    const destination = $('#destination')?.value.trim();
    const departure = $('#departure')?.value;
    const ret = $('#return')?.value;
    if (!origin || !destination || origin.toLowerCase() === destination.toLowerCase()) {
      toast('Informe origem e destino diferentes.');
      return;
    }
    if (!departure || departure < localDate || (tripType === 'round' && (!ret || ret < departure))) {
      toast('Confira as datas da viagem.');
      return;
    }
    const route = $('#results-route');
    if (route) route.textContent = origin + '  →  ' + destination + ' · ' + departure + (tripType === 'round' ? ' · volta ' + ret : '') + ' · ' + $('#passengers').value + ' passageiro(s) · ' + $('#cabin').value;
    renderFlights();
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
  });
  $$('.destination-card').forEach(card => card.addEventListener('click', () => {
    const destination = card.dataset.destination;
    if (destination && $('#destination')) $('#destination').value = destination;
  }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeResults(); });

  // Área de conta. O layout só é inserido pelo JS, sem reescrever o HTML original.
  const authStyle = document.createElement('style');
  authStyle.textContent = `
    .account-trigger{border:1px solid rgba(120,215,255,.55);background:transparent;color:inherit;border-radius:999px;padding:10px 14px;font:inherit;cursor:pointer}
    .auth-overlay{position:fixed;inset:0;z-index:9999;background:rgba(2,12,26,.72);display:none;align-items:center;justify-content:center;padding:18px}
    .auth-overlay.open{display:flex}.auth-box{width:min(100%,430px);background:#fff;color:#102238;border-radius:20px;padding:28px;box-shadow:0 24px 80px #0004;position:relative;font-family:inherit}
    .auth-box h2{margin:0 35px 8px 0;font-size:26px}.auth-box p{line-height:1.5;color:#536274}.auth-close{position:absolute;right:15px;top:12px;border:0;background:none;font-size:28px;cursor:pointer;color:#26384a}
    .auth-box form{display:grid;gap:12px}.auth-box label{display:grid;gap:6px;font-size:13px;font-weight:700}.auth-box input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #ccd5df;border-radius:9px;font:inherit}
    .auth-submit{padding:13px;border:0;border-radius:10px;background:#102b49;color:white;font-weight:700;cursor:pointer}.auth-links{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px}.auth-links button{border:0;background:none;color:#075a8c;text-decoration:underline;cursor:pointer;padding:0;font:inherit}.auth-message{font-size:13px;overflow-wrap:anywhere}
    .auth-submit:disabled{opacity:.6;cursor:wait}
    @media(max-width:700px){.site-header .header-actions{gap:8px}.account-trigger{padding:8px 10px;font-size:12px}.desktop-nav.mobile-open{display:flex;position:absolute;top:100%;left:0;right:0;z-index:100;background:#071629;padding:18px;flex-direction:column;gap:16px}}
  `;
  document.head.appendChild(authStyle);
  let accountButton = null;
  const headerActions = $('.header-actions');
  if (headerActions) {
    accountButton = document.createElement('button');
    accountButton.className = 'account-trigger';
    accountButton.type = 'button';
    accountButton.textContent = 'Minha conta';
    accountButton.addEventListener('click', () => openAuth('login'));
    headerActions.insertBefore(accountButton, menuButton || null);
  }
  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.id = 'auth-overlay';
  overlay.innerHTML = '<section class="auth-box" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button class="auth-close" type="button" aria-label="Fechar">×</button><h2 id="auth-title">Bem-vindo à André Aéreas</h2><p id="auth-description">Entre na sua conta para continuar.</p><div id="auth-content"></div><p class="auth-message" id="auth-message" role="status" aria-live="polite"></p></section>';
  document.body.appendChild(overlay);
  let authMode = 'login';
  let supabaseClient = null;
  let supabaseLoading = null;
  const authMessage = $('#auth-message', overlay);
  const authContent = $('#auth-content', overlay);
  const authTitle = $('#auth-title', overlay);
  const authDescription = $('#auth-description', overlay);

  function loadSupabase() {
    if (!authConfigured) return Promise.reject(new Error('A autenticação ainda não foi configurada. É necessário conectar um projeto Supabase para que cadastro, login e recuperação funcionem de verdade.'));
    if (window.supabase?.createClient) return Promise.resolve(window.supabase);
    if (!supabaseLoading) supabaseLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = () => window.supabase?.createClient ? resolve(window.supabase) : reject(new Error('Não foi possível carregar o serviço de autenticação.'));
      script.onerror = () => reject(new Error('Sem conexão para carregar a autenticação. Tente novamente.'));
      document.head.appendChild(script);
    });
    return supabaseLoading;
  }
  async function getClient() {
    if (supabaseClient) return supabaseClient;
    const sdk = await loadSupabase();
    supabaseClient = sdk.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
  }
  function setMessage(message, isError = false) {
    authMessage.textContent = message;
    authMessage.style.color = isError ? '#b42318' : '#176b45';
  }
  function openAuth(mode) {
    authMode = mode;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    renderAuth();
  }
  function closeAuth() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    setMessage('');
  }
  function renderAuth() {
    setMessage('');
    const recovery = location.hash.includes('type=recovery');
    if (recovery) authMode = 'update';
    const titles = {
      login: ['Entrar na sua conta', 'Acesse sua conta da André Aéreas.'],
      signup: ['Criar conta', 'Cadastre seu e-mail para começar.'],
      recovery: ['Esqueceu sua senha?', 'Enviaremos um link para o seu e-mail cadastrado.'],
      update: ['Criar nova senha', 'Escolha uma senha nova para sua conta.']
    };
    [authTitle.textContent, authDescription.textContent] = titles[authMode] || titles.login;
    const emailField = '<label>E-mail<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="voce@exemplo.com"></label>';
    const passwordField = '<label>Senha<input name="password" type="password" autocomplete="' + (authMode === 'signup' ? 'new-password' : 'current-password') + '" minlength="8" required placeholder="Mínimo de 8 caracteres"></label>';
    let fields = emailField + (authMode === 'login' || authMode === 'signup' ? passwordField : '');
    if (authMode === 'update') fields = '<label>Nova senha<input name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="Mínimo de 8 caracteres"></label>';
    authContent.innerHTML = '<form id="auth-form">' + fields + '<button class="auth-submit" type="submit">' + ({login:'Entrar',signup:'Criar conta',recovery:'Enviar link de recuperação',update:'Salvar nova senha'}[authMode] || 'Continuar') + '</button></form>' +
      '<div class="auth-links">' +
      (authMode !== 'login' && authMode !== 'update' ? '<button type="button" data-auth="login">Já tenho conta</button>' : '') +
      (authMode === 'login' ? '<button type="button" data-auth="recovery">Esqueci minha senha</button><button type="button" data-auth="signup">Criar conta</button>' : '') +
      (authMode === 'signup' ? '<button type="button" data-auth="recovery">Esqueci minha senha</button>' : '') + '</div>';
    $$('[data-auth]', authContent).forEach(button => button.addEventListener('click', () => openAuth(button.dataset.auth)));
    $('#auth-form', authContent)?.addEventListener('submit', handleAuthSubmit);
  }
  async function handleAuthSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = $('button[type="submit"]', form);
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    submit.disabled = true;
    setMessage('Processando…');
    try {
      const client = await getClient();
      let result;
      if (authMode === 'signup') result = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } });
      else if (authMode === 'login') result = await client.auth.signInWithPassword({ email, password });
      else if (authMode === 'recovery') result = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname + '#recuperar-senha' });
      else if (authMode === 'update') result = await client.auth.updateUser({ password });
      if (result?.error) throw result.error;
      if (authMode === 'login') {
        setMessage('Login realizado com sucesso.');
        toast('Você entrou na sua conta.');
        setTimeout(closeAuth, 900);
      } else if (authMode === 'signup') {
        setMessage('Cadastro enviado. Confira seu e-mail para confirmar a conta, se a confirmação estiver ativada.');
      } else if (authMode === 'recovery') {
        setMessage('Se esse e-mail estiver cadastrado, você receberá um link para redefinir a senha. Confira também o spam.');
      } else {
        setMessage('Senha alterada com sucesso. Você já pode entrar com a nova senha.');
        history.replaceState(null, '', location.pathname + location.search);
        authMode = 'login';
        setTimeout(renderAuth, 1200);
      }
    } catch (error) {
      setMessage(error?.message || 'Não foi possível concluir. Confira as configurações e tente novamente.', true);
    } finally {
      submit.disabled = false;
    }
  }
  $('.auth-close', overlay)?.addEventListener('click', closeAuth);
  overlay.addEventListener('click', event => { if (event.target === overlay) closeAuth(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAuth(); });
  if (location.hash.includes('type=recovery') || location.hash.includes('recuperar-senha')) openAuth('update');

  // Exibe uma mensagem clara em vez de falhar silenciosamente se alguém tentar usar a conta sem configurar o backend.
  if (!authConfigured) {
    accountButton?.setAttribute('title', 'Login e recuperação precisam ser conectados ao Supabase');
  }
})();
