(function(){
  const BASE = window.AUTH_BASE || '/api/auth';

  async function request(path, opts){
    const res = await fetch(BASE + path, Object.assign({
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }, opts || {}));
    let data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || ('Error ' + res.status);
      throw new Error(msg);
    }
    return data;
  }

  window.Auth = {
    async signUp(email, password, name){
      return request('/sign-up/email', { method: 'POST', body: JSON.stringify({ email: email, password: password, name: name }) });
    },
    async signIn(email, password){
      return request('/sign-in/email', { method: 'POST', body: JSON.stringify({ email: email, password: password }) });
    },
    async signOut(){
      return request('/sign-out', { method: 'POST' });
    },
    async getSession(){
      try {
        const data = await request('/get-session', { method: 'GET' });
        return (data && data.user) ? data : null;
      } catch (e) {
        return null;
      }
    }
  };
})();
