const config = {
  plugins: ["@tailwindcss/postcss"],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        text: 'var(--color-text)',
        'text-light': 'var(--color-text-light)',
        'button-login': 'var(--color-button-login-bg)',
        'button-login-hover': 'var(--color-button-login-hover)',
        'button-register': 'var(--color-button-register-bg)',
        'button-register-hover': 'var(--color-button-register-hover)',
        'input-bg': 'var(--color-input-bg)',
        'input-border': 'var(--color-input-border)',
        error: 'var(--color-error)',
        'modal-bg': 'var(--color-modal-bg)',
        'modal-overlay': 'var(--color-modal-overlay)',
        'chat-sidebar-bg': 'var(--color-chat-sidebar-bg)',
        'chat-main-bg': 'var(--color-chat-main-bg)',
        'chat-message-bg': 'var(--color-chat-message-bg)',
        'chat-message-text': 'var(--color-chat-message-text)',
      },
    },
  },
};

export default config;
