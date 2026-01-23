
export enum UserRole {
  HOUSEKEEPER = 'HOUSEKEEPER',
  SUPERVISOR = 'SUPERVISOR',
  MANAGER = 'MANAGER'
}

export interface BedAnalysisResult {
  id: string;
  roomNumber: string;
  timestamp: number;
  housekeeperName: string;
  status: 'MADE' | 'UNMADE';
  unmadeReasons?: string[];
  confidence: number; // 0-1
  imageUrl: string;
  reviewedBy?: string;
  reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PerformanceStat {
  name: string;
  madeRate: number;
  totalRooms: number;
}
