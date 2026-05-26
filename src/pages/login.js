import { login, register, googleLogin, continueAsGuest, isLoggedIn } from '../auth.js';
import { api } from '../api.js';
import { navigate } from '../router.js';
import { toastSuccess, toastError } from '../toast.js';

export function renderLogin(container) {
  if (isLoggedIn()) {
    setTimeout(() => navigate('/'), 0);
    return;
  }

  let mode = 'login'; // login | register | forgot | reset | verify
  let loading = false;
  let resetEmail = '';
  let authEmail = ''; // Store email for verification resends
  let showPassword = false;

  function render() {
    container.innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <div class="login-logo">
            <img src="/logo.png" alt="Aisira Logo" style="width:64px;height:64px;margin-bottom:16px;object-fit:contain" />
            <h1>Aisira</h1>
            <p class="tagline">The Digital Nidhi of Tulunadu Culture</p>
          </div>

          <div id="login-error"></div>

          ${mode === 'login' ? renderLoginForm()
            : mode === 'register' ? renderRegisterForm()
            : mode === 'forgot' ? renderForgotForm()
            : mode === 'reset' ? renderResetForm()
            : renderVerifyForm()}
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderVerifyForm() {
    return `
      <form class="login-form" id="verify-form">
        <div style="text-align:center;margin-bottom:8px">
          <div style="font-size:2.5rem;margin-bottom:8px">📧</div>
          <h3 style="color:var(--text-primary);margin:0">Verify your Email</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem;margin-top:4px">
            Enter the 6-digit code sent to <strong style="color:var(--accent-light)">${authEmail}</strong>
          </p>
        </div>
        <div>
          <label class="input-label">Verification Code <span class="required">*</span></label>
          <input type="text" class="input-field" id="verify-code" placeholder="Enter 6-digit code" required maxlength="6" pattern="[0-9]{6}"
            style="text-align:center;font-size:1.5rem;letter-spacing:8px;font-weight:700" />
        </div>
        <button type="submit" class="btn btn-primary btn-lg" ${loading ? 'disabled' : ''}>
          ${loading ? '<div class="spinner"></div>' : '✅ Verify & Log In'}
        </button>
      </form>
      <div class="login-toggle" style="margin-top:16px">
        <a id="resend-verify-code" style="cursor:pointer">Resend code</a> · <a id="back-to-login">Back to Sign In</a>
      </div>
    `;
  }

  function renderLoginForm() {
    return `
      <form class="login-form" id="auth-form">
        <div>
          <label class="input-label">Email <span class="required">*</span></label>
          <input type="email" class="input-field" id="auth-email" placeholder="Enter your email" required />
        </div>
        <div>
          <label class="input-label">Password <span class="required">*</span></label>
          <div style="position:relative">
            <input type="${showPassword ? 'text' : 'password'}" class="input-field" id="auth-password" placeholder="Enter password" required minlength="6" style="padding-right:48px" />
            <button type="button" class="password-toggle-btn" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;font-size:18px;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;padding:4px;z-index:10">
              ${showPassword ? '👁️' : '🙈'}
            </button>
          </div>
        </div>
        <div style="text-align:right;margin-top:-8px">
          <a id="forgot-link" style="color:var(--accent-light);font-size:0.85rem;cursor:pointer;text-decoration:underline">Forgot Password?</a>
        </div>
        <button type="submit" class="btn btn-primary btn-lg" ${loading ? 'disabled' : ''}>
          ${loading ? '<div class="spinner"></div>' : 'Sign In'}
        </button>
        <div id="google-btn-login" style="margin-top:12px;display:flex;justify-content:center"></div>
      </form>
      <div class="login-divider">or</div>
      <button class="btn btn-secondary" style="width:100%" id="guest-btn">👁️ Continue as Guest</button>
      <div class="login-toggle" style="margin-top:16px">
        Don't have an account? <a id="toggle-auth">Register</a>
      </div>
    `;
  }

  function renderRegisterForm() {
    return `
      <form class="login-form" id="auth-form">
        <div>
          <label class="input-label">Full Name <span class="required">*</span></label>
          <input type="text" class="input-field" id="auth-name" placeholder="Enter your name" required />
        </div>
        <div>
          <label class="input-label">Email <span class="required">*</span></label>
          <input type="email" class="input-field" id="auth-email" placeholder="Enter your email" required />
        </div>
        <div>
          <label class="input-label">Password <span class="required">*</span></label>
          <div style="position:relative">
            <input type="${showPassword ? 'text' : 'password'}" class="input-field" id="auth-password" placeholder="Enter password" required minlength="6" style="padding-right:48px" />
            <button type="button" class="password-toggle-btn" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;font-size:18px;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;padding:4px;z-index:10">
              ${showPassword ? '👁️' : '🙈'}
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-lg" ${loading ? 'disabled' : ''}>
          ${loading ? '<div class="spinner"></div>' : 'Create Account'}
        </button>
        <div id="google-btn-login" style="margin-top:12px;display:flex;justify-content:center"></div>
      </form>
      <div class="login-divider">or</div>
      <button class="btn btn-secondary" style="width:100%" id="guest-btn">👁️ Continue as Guest</button>
      <div class="login-toggle" style="margin-top:16px">
        Already have an account? <a id="toggle-auth">Sign In</a>
      </div>
    `;
  }

  function renderForgotForm() {
    return `
      <form class="login-form" id="forgot-form">
        <div style="text-align:center;margin-bottom:8px">
          <div style="font-size:2.5rem;margin-bottom:8px">🔒</div>
          <h3 style="color:var(--text-primary);margin:0">Forgot Password?</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem;margin-top:4px">Enter your email and we'll send you a reset code</p>
        </div>
        <div>
          <label class="input-label">Email <span class="required">*</span></label>
          <input type="email" class="input-field" id="forgot-email" placeholder="Enter your registered email" required />
        </div>
        <button type="submit" class="btn btn-primary btn-lg" ${loading ? 'disabled' : ''}>
          ${loading ? '<div class="spinner"></div>' : '📧 Send Reset Code'}
        </button>
      </form>
      <div class="login-toggle" style="margin-top:16px">
        Remember your password? <a id="back-to-login">Back to Sign In</a>
      </div>
    `;
  }

  function renderResetForm() {
    return `
      <form class="login-form" id="reset-form">
        <div style="text-align:center;margin-bottom:8px">
          <div style="font-size:2.5rem;margin-bottom:8px">✉️</div>
          <h3 style="color:var(--text-primary);margin:0">Enter Reset Code</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem;margin-top:4px">
            Code sent to <strong style="color:var(--accent-light)">${resetEmail}</strong>
          </p>
          <p style="color:var(--text-muted);font-size:0.8rem">Expires in 15 minutes</p>
        </div>
        <div>
          <label class="input-label">6-Digit Code <span class="required">*</span></label>
          <input type="text" class="input-field" id="reset-code" placeholder="Enter 6-digit code" required maxlength="6" pattern="[0-9]{6}"
            style="text-align:center;font-size:1.5rem;letter-spacing:8px;font-weight:700" />
        </div>
        <div>
          <label class="input-label">New Password <span class="required">*</span></label>
          <div style="position:relative">
            <input type="${showPassword ? 'text' : 'password'}" class="input-field" id="reset-password" placeholder="Enter new password (min 6 chars)" required minlength="6" style="padding-right:48px" />
            <button type="button" class="password-toggle-btn" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;font-size:18px;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;padding:4px;z-index:10">
              ${showPassword ? '👁️' : '🙈'}
            </button>
          </div>
        </div>
        <div>
          <label class="input-label">Confirm Password <span class="required">*</span></label>
          <div style="position:relative">
            <input type="${showPassword ? 'text' : 'password'}" class="input-field" id="reset-confirm" placeholder="Confirm new password" required minlength="6" style="padding-right:48px" />
            <button type="button" class="password-toggle-btn" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;font-size:18px;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;padding:4px;z-index:10">
              ${showPassword ? '👁️' : '🙈'}
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-lg" ${loading ? 'disabled' : ''}>
          ${loading ? '<div class="spinner"></div>' : '🔑 Reset Password'}
        </button>
      </form>
      <div class="login-toggle" style="margin-top:16px">
        <a id="resend-code" style="cursor:pointer">Resend code</a> · <a id="back-to-login">Back to Sign In</a>
      </div>
    `;
  }

  function bindEvents() {
    // Password visibility toggle binding
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showPassword = !showPassword;
        
        // Find input in the same wrapper
        const input = btn.parentElement.querySelector('input');
        if (input) {
          input.type = showPassword ? 'text' : 'password';
        }
        
        // Update all toggle buttons dynamically in DOM to keep state synced!
        document.querySelectorAll('.password-toggle-btn').forEach(otherBtn => {
          otherBtn.innerHTML = showPassword ? '👁️' : '🙈';
        });
      });
    });

    // Login / Register form
    document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value;
      const name = document.getElementById('auth-name')?.value?.trim() || 'User';

      loading = true;
      render();

      try {
        if (mode === 'register') {
          await register(email, password, name);
          authEmail = email;
          mode = 'verify';
          loading = false;
          render();
          toastSuccess('Verification code sent to your email!');
        } else {
          await login(email, password);
          toastSuccess('Welcome back!');
          navigate('/');
        }
      } catch (err) {
        if (err.message.includes('verify your email')) {
          authEmail = email;
          mode = 'verify';
          loading = false;
          render();
          return;
        }
        loading = false;
        render();
        document.getElementById('login-error').innerHTML = `<div class="login-error">${err.message}</div>`;
      }
    });

    // Verify form
    document.getElementById('verify-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('verify-code').value.trim();

      loading = true;
      render();

      try {
        const user = await api.verifyEmail(authEmail, code);
        // After successful verification, manually set user in auth and redirect
        // Since api.verifyEmail returns the user and token, we should handle it like a login
        localStorage.setItem('yn_token', user.token);
        // The auth state is usually handled by the login/register functions in auth.js
        // I should probably add a dedicated 'verify' function to auth.js to be consistent
        window.location.reload(); // Quick way to re-init auth state and redirect
      } catch (err) {
        loading = false;
        render();
        document.getElementById('login-error').innerHTML = `<div class="login-error">${err.message}</div>`;
      }
    });

    // Resend verification
    document.getElementById('resend-verify-code')?.addEventListener('click', async () => {
      try {
        await api.resendVerification(authEmail);
        toastSuccess('New verification code sent!');
      } catch (err) {
        toastError(err.message);
      }
    });

    // Forgot password form
    document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();

      loading = true;
      render();

      try {
        await api.forgotPassword(email);
        resetEmail = email;
        mode = 'reset';
        loading = false;
        render();
        toastSuccess('Reset code sent! Check your email or server console.');
      } catch (err) {
        loading = false;
        render();
        document.getElementById('login-error').innerHTML = `<div class="login-error">${err.message}</div>`;
      }
    });

    // Reset password form
    document.getElementById('reset-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('reset-code').value.trim();
      const newPassword = document.getElementById('reset-password').value;
      const confirm = document.getElementById('reset-confirm').value;

      if (newPassword !== confirm) {
        document.getElementById('login-error').innerHTML = `<div class="login-error">Passwords do not match</div>`;
        return;
      }

      loading = true;
      render();

      try {
        const result = await api.resetPassword(resetEmail, code, newPassword);
        toastSuccess(result.message || 'Password reset! You can now log in.');
        mode = 'login';
        loading = false;
        render();
      } catch (err) {
        loading = false;
        render();
        document.getElementById('login-error').innerHTML = `<div class="login-error">${err.message}</div>`;
      }
    });

    // Resend code
    document.getElementById('resend-code')?.addEventListener('click', async () => {
      try {
        await api.forgotPassword(resetEmail);
        toastSuccess('New code sent!');
      } catch (err) {
        toastError(err.message);
      }
    });

    // Navigation links
    document.getElementById('guest-btn')?.addEventListener('click', () => {
      continueAsGuest();
      toastSuccess('Browsing as guest');
      navigate('/');
    });

    document.getElementById('toggle-auth')?.addEventListener('click', (e) => {
      e.preventDefault();
      mode = mode === 'login' ? 'register' : 'login';
      render();
    });

    document.getElementById('forgot-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      mode = 'forgot';
      render();
    });

    document.getElementById('back-to-login')?.addEventListener('click', (e) => {
      e.preventDefault();
      mode = 'login';
      render();
    });

    initGoogleLogin();
  }

  function initGoogleLogin() {
    if (typeof google === 'undefined') {
      setTimeout(initGoogleLogin, 100);
      return;
    }
    
    google.accounts.id.initialize({
      client_id: "990036941261-8bhe4h6bjad9vlodi32jae8m78gpl1ca.apps.googleusercontent.com",
      callback: handleGoogleResponse
    });
    
    const loginBtn = document.getElementById('google-btn-login');
    if (loginBtn) {
      google.accounts.id.renderButton(loginBtn, { 
        theme: "outline", 
        size: "large", 
        width: 320, 
        text: "continue_with",
        shape: "rectangular"
      });
    }
  }

  async function handleGoogleResponse(response) {
    loading = true;
    render();
    try {
      await googleLogin(response.credential);
      toastSuccess('Signed in with Google!');
      navigate('/');
    } catch (err) {
      loading = false;
      render();
      document.getElementById('login-error').innerHTML = `<div class="login-error">${err.message}</div>`;
    }
  }

  render();
}
