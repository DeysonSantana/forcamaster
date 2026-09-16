/**
 * ForcaMaster - Firebase Configuration & Initialization Layer (Modular v10)
 * Inicializa os módulos Firebase via CDN oficial com suporte a Dual-Mode (Cloud + Local Offline Fallback)
 * e permite configuração personalizada de projeto (BYOC - Bring Your Own Config).
 */

const STORAGE_FIREBASE_CONFIG_KEY = 'forcamaster_firebase_custom_config';

// Configuração padrão do projeto Firebase (Compartilhada com o ecossistema QuizMaster)
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCqGd42xeen1HGc4PpgBa8sH1nhOi17ylM",
  authDomain: "quizmaster-f9388.firebaseapp.com",
  projectId: "quizmaster-f9388",
  storageBucket: "quizmaster-f9388.firebasestorage.app",
  messagingSenderId: "169092133424",
  appId: "1:169092133424:web:019d8ef6e122468864f3f5",
  measurementId: "G-XEPBYW3SVY"
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.isReady = false;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.statusListeners = [];

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  handleNetworkChange(online) {
    this.isOnline = online;
    this.notifyStatusListeners();
  }

  onStatusChange(fn) {
    this.statusListeners.push(fn);
    fn(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== fn);
    };
  }

  notifyStatusListeners() {
    const status = this.getStatus();
    this.statusListeners.forEach(fn => fn(status));
  }

  getStatus() {
    const hasCustom = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(STORAGE_FIREBASE_CONFIG_KEY));
    return {
      isOnline: this.isOnline,
      isReady: this.isReady,
      hasCustomConfig: hasCustom
    };
  }

  getStoredConfig() {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_FIREBASE_CONFIG_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Migração automática: se for placeholder antigo, descarta para usar a nova configuração oficial do QuizMaster
          if (parsed && (parsed.apiKey?.includes('Dummy') || parsed.projectId === 'forcamaster-pro')) {
            localStorage.removeItem(STORAGE_FIREBASE_CONFIG_KEY);
            return DEFAULT_FIREBASE_CONFIG;
          }
          return parsed;
        }
      } catch (e) {
        console.warn('Configuração do Firebase corrompida no storage local', e);
      }
    }
    return DEFAULT_FIREBASE_CONFIG;
  }

  saveConfig(configObj) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_FIREBASE_CONFIG_KEY, JSON.stringify(configObj));
    }
    this.isReady = false;
    return this.init();
  }

  resetConfig() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_FIREBASE_CONFIG_KEY);
    }
    this.isReady = false;
    return this.init();
  }

  async init() {
    if (!this.isOnline) {
      this.isReady = false;
      this.notifyStatusListeners();
      return false;
    }

    try {
      const config = this.getStoredConfig();

      // Carrega os módulos oficiais do Firebase v10 via CDN
      const [{ initializeApp }, { getAuth, GoogleAuthProvider }, { getFirestore }] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js')
      ]);

      this.app = initializeApp(config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.GoogleAuthProvider = GoogleAuthProvider;
      this.isReady = true;

      this.notifyStatusListeners();
      console.log('[ForcaMaster] Firebase SDK inicializado com sucesso.');
      return true;
    } catch (err) {
      console.warn('[ForcaMaster] Modo Offline/Local ativo. Firebase não inicializado:', err.message);
      this.isReady = false;
      this.notifyStatusListeners();
      return false;
    }
  }

  getAuth() {
    return this.auth;
  }

  getDb() {
    return this.db;
  }

  getGoogleAuthProvider() {
    return this.GoogleAuthProvider;
  }
}

export const firebaseService = new FirebaseService();
