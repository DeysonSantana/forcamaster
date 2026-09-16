/**
 * ForcaMaster - Authentication Manager (Google Sign-In via Firebase)
 * Gerencia login social com Google, persistência de sessão, avatar e sincronização de perfil.
 */

import { firebaseService } from './firebaseConfig.js';
import { statsManager } from './statsManager.js';
import { sound } from './audio.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    await firebaseService.init();
    const auth = firebaseService.getAuth();

    if (auth) {
      const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js');
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            displayName: user.displayName || 'Jogador Conectado',
            email: user.email,
            photoURL: user.photoURL,
            isAnonymous: false
          };
          statsManager.setPlayerName(user.displayName);
        } else {
          this.currentUser = null;
        }
        this.notify();
      });
    }

    this.initialized = true;
  }

  onAuthChange(fn) {
    this.listeners.push(fn);
    fn(this.getUser());
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    const user = this.getUser();
    this.listeners.forEach(fn => fn(user));
  }

  getUser() {
    if (this.currentUser) return this.currentUser;

    const guestStoredId = typeof localStorage !== 'undefined' ? localStorage.getItem('forcamaster_guest_id') : null;

    // Fallback de convidado local
    return {
      uid: 'guest_' + (guestStoredId || this.generateGuestId()),
      displayName: statsManager.getPlayerName() || 'Jogador Convidado',
      email: null,
      photoURL: null,
      isAnonymous: true
    };
  }

  generateGuestId() {
    const id = Math.random().toString(36).substring(2, 9);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('forcamaster_guest_id', id);
    }
    return id;
  }

  isLoggedIn() {
    return Boolean(this.currentUser && !this.currentUser.isAnonymous);
  }

  async loginWithGoogle() {
    await this.init();
    const auth = firebaseService.getAuth();
    const GoogleAuthProvider = firebaseService.getGoogleAuthProvider();

    if (!auth || !GoogleAuthProvider) {
      throw new Error('Firebase não conectado. Configure as credenciais do seu projeto Firebase nas configurações.');
    }

    const { signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      this.currentUser = {
        uid: user.uid,
        displayName: user.displayName || 'Jogador Google',
        email: user.email,
        photoURL: user.photoURL,
        isAnonymous: false
      };

      statsManager.setPlayerName(user.displayName);
      sound.playWin();
      this.notify();
      return this.currentUser;
    } catch (err) {
      sound.playWrong();
      console.error('[ForcaMaster] Erro no login com Google:', err);
      throw err;
    }
  }

  async logout() {
    const auth = firebaseService.getAuth();
    if (auth) {
      const { signOut } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js');
      await signOut(auth);
    }
    this.currentUser = null;
    sound.playKeyTick();
    this.notify();
  }
}

export const authManager = new AuthManager();
