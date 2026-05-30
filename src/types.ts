/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductInfo {
  id: 'postpago' | 'porta' | 'porta_pre_8' | 'porta_pos_15990' | 'nuevo' | 'renov';
  name: string;
  points: number;
  iconName: string;
  description: string;
}

export interface SaleRecord {
  id: string;
  timestamp: string; // ISO string
  postpagoCount: number;
  portaCount: number;
  portaPre8Count: number; // For old records compatibility
  portaPos15990Count?: number; // Added for the Porta pos -$15.990 (15 points)
  nuevoCount: number;
  renovCount: number;
  pointsEarned: number;
  renovationBonusApplied?: boolean; // True if calculated at 5 points dynamically
}

export interface PrepagoRecord {
  id: string;
  timestamp: string; // ISO string
  type: 'activo' | 'cargado'; // 'activo' counts as 1 pt, 'cargado' counts as 3 pts
  phone?: string; // Optional identifier/phone
  pointsEarned: number; // 1 or 3
}

export interface MonthlyHistoryRecord {
  id: string;
  monthName: string; // e.g., "Mayo 2026"
  postpagoMeta: number;
  postpagoPoints: number;
  postpagoPercent: number;
  prepagoMeta: number;
  prepagoPoints: number;
  prepagoPercent: number;
  postpagoCommission: number;
  prepagoCommission: number;
  totalCommission: number;
  timestamp: string;
  planCounts: {
    postpago: number;
    porta_pos_15990: number;
    porta: number;
    nuevo: number;
    renov: number;
    activos: number;
    cargados: number;
  };
}

export interface UserProfile {
  username: string;
  metaObjective: number;
  salesHistory: SaleRecord[];
  metaPrepagoObjective?: number;
  prepagosHistory?: PrepagoRecord[];
  createdAt?: string;
  monthlyHistory?: MonthlyHistoryRecord[];
}
