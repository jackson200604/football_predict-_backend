// On définit des types constants pour éviter les fautes de frappe
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED';
export type Winner = 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface Team {
  id: number;
  name: string;
  shortName?: string; // Optionnel : utile pour l'affichage mobile
}

export interface ScoreDetail {
  home: number | null;
  away: number | null;
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  competition: { id: number; name: string };
  homeTeam: Team;
  awayTeam: Team;
  score: {
    winner: Winner | null;
    fullTime: ScoreDetail;
    halfTime?: ScoreDetail; // Ajout pour plus de précision statistique
  };
}

/** 
 * Regroupement des analyses pour une équipe
 * On utilise Partial pour NewsAnalysis au cas où les données manquent
 */
export interface TeamAnalysis {
  stats: {
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    form: ('W' | 'D' | 'L')[]; // Format standard : Win, Draw, Loss
    cleanSheets: number;
  };
  news: {
    items: NewsItem[];
    impact: {
      injuries: string[];
      suspensions: string[];
      sentiment: number; // -1 à 1
    };
  };
}

export interface FinalPrediction {
  matchId: number;
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
  pick: Winner;
  confidence: ConfidenceLevel;
  analysisSummary: string[];
  }
