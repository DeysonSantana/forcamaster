/**
 * ForcaMaster - Stats & Profile Manager
 * Persistência e cálculo de métricas de desempenho, sequências, histórico e exportação/importação JSON.
 */

const STORAGE_KEY = 'forcamaster_profile_v2';

export class StatsManager {
  constructor() {
    this.profile = this.load();
  }

  getDefaultProfile() {
    return {
      playerName: 'Jogador',
      totalGames: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalScore: 0,
      highestScore: 0,
      history: []
    };
  }

  load() {
    if (typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          return { ...this.getDefaultProfile(), ...parsed };
        }
      } catch (e) {
        console.warn('Falha ao carregar perfil do LocalStorage', e);
      }
    }
    return this.getDefaultProfile();
  }

  save() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      } catch (e) {
        console.error('Falha ao salvar perfil', e);
      }
    }
  }

  setPlayerName(name) {
    if (name && name.trim().length > 0) {
      this.profile.playerName = name.trim().slice(0, 16);
      this.save();
    }
  }

  getPlayerName() {
    return this.profile.playerName;
  }

  recordGame({ isWin, word, category, score, errors }) {
    this.profile.totalGames++;

    if (isWin) {
      this.profile.wins++;
      this.profile.currentStreak++;
      if (this.profile.currentStreak > this.profile.bestStreak) {
        this.profile.bestStreak = this.profile.currentStreak;
      }
      this.profile.totalScore += score;
      if (score > this.profile.highestScore) {
        this.profile.highestScore = score;
      }
    } else {
      this.profile.losses++;
      this.profile.currentStreak = 0;
    }

    // Registra entrada de histórico (limite de 30 últimas partidas)
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      word,
      category,
      result: isWin ? 'win' : 'loss',
      score,
      errors
    };

    this.profile.history.unshift(entry);
    if (this.profile.history.length > 30) {
      this.profile.history.pop();
    }

    this.save();
    return this.profile;
  }

  getSummary() {
    const winRate = this.profile.totalGames > 0
      ? Math.round((this.profile.wins / this.profile.totalGames) * 100)
      : 0;

    return {
      name: this.profile.playerName,
      totalGames: this.profile.totalGames,
      wins: this.profile.wins,
      losses: this.profile.losses,
      winRate: `${winRate}%`,
      currentStreak: this.profile.currentStreak,
      bestStreak: this.profile.bestStreak,
      totalScore: this.profile.totalScore,
      highestScore: this.profile.highestScore,
      history: this.profile.history
    };
  }

  exportData() {
    const dataStr = JSON.stringify(this.profile, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `forcamaster_${this.profile.playerName}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importData(jsonContent) {
    try {
      const parsed = JSON.parse(jsonContent);
      if (typeof parsed.totalGames === 'number' && typeof parsed.wins === 'number') {
        this.profile = { ...this.getDefaultProfile(), ...parsed };
        this.save();
        return { success: true };
      }
      return { success: false, error: 'Estrutura JSON inválida para ForcaMaster.' };
    } catch (e) {
      return { success: false, error: 'Arquivo JSON corrompido ou ilegível.' };
    }
  }

  reset() {
    this.profile = this.getDefaultProfile();
    this.save();
  }
}

export const statsManager = new StatsManager();
