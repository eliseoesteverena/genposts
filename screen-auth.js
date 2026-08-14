(function(){
  let mode = 'signin';

  function el(){ return document.querySelector('[data-view="auth"]'); }

  function render(){
    const root = el();
    root.querySelector('.auth-title').textContent = mode === 'signin' ? 'Iniciar sesion' : 'Crear cuenta';
    root.querySelector('.auth-name-field').hidden = mode === 'signin';
    root.querySelector('.auth-toggle').textContent = mode === 'signin' ? 'No tenes cuenta? Crear una' : 'Ya tenes cuenta? Iniciar sesion';
    root.querySelector('.auth-submit-btn').textContent = mode === 'signin' ? 'Entrar' : 'Crear cuenta';
    root.querySelector('.auth-status').hidden = true;
  }

  function setStatus(msg, isError){
    const s = el().querySelector('.auth-status');
    s.hidden = false; s.textContent = msg; s.classList.toggle('is-error', !!isError);
  }

  async function submit(){
    const root = el();
    const email = root.querySelector('.auth-email').value.trim();
    const password = root.querySelector('.auth-password').value;
    const name = root.querySelector('.auth-name').value.trim();

    if (!email || !password) { setStatus('Completa email y contrasena.', true); return; }
    if (mode === 'signup' && !name) { setStatus('Completa tu nombre.', true); return; }

    const btn = root.querySelector('.auth-submit-btn');
    btn.disabled = true;
    setStatus(mode === 'signin' ? 'Entrando...' : 'Creando cuenta...');

    try {
      if (mode === 'signin') await Auth.signIn(email, password);
      else await Auth.signUp(email, password, name);
      await refreshSidebarUser();
      Router.go('#/');
    } catch (err) {
      setStatus('Error: ' + err.message, true);
    } finally {
      btn.disabled = false;
    }
  }

  function wire(){
    const root = el();
    root.querySelector('.auth-submit-btn').addEventListener('click', submit);
    root.querySelector('.auth-toggle').addEventListener('click', function(){
      mode = mode === 'signin' ? 'signup' : 'signin';
      render();
    });
  }

  async function refreshSidebarUser(){
    const session = await Auth.getSession();
    const avatar = document.querySelector('.sidebar-user-avatar');
    const info = document.querySelector('.sidebar-user-info');
    const actionBtn = document.querySelector('.sidebar-user-action');

    if (session && session.user) {
      avatar.textContent = (session.user.name || session.user.email || '?').charAt(0).toUpperCase();
      info.innerHTML = '<strong>' + escapeHtml(session.user.name || 'Sin nombre') + '</strong><span>' + escapeHtml(session.user.email) + '</span>';
      actionBtn.textContent = 'Cerrar sesion';
      actionBtn.onclick = async function(){
        await Auth.signOut();
        await refreshSidebarUser();
        Router.go('#/');
      };
    } else {
      avatar.textContent = '?';
      info.innerHTML = '<strong>Invitado</strong><span>Sin iniciar sesion</span>';
      actionBtn.textContent = 'Iniciar sesion';
      actionBtn.onclick = function(){ Router.go('#/auth'); };
    }
  }

  function escapeHtml(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  let wired = false;
  Router.register('auth', function(){
    if (!wired) { wire(); wired = true; }
    mode = 'signin';
    render();
  });

  window.RefreshSidebarUser = refreshSidebarUser;
  refreshSidebarUser();
})();
