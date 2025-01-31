export interface BetaAccessCode {
  code: string;
  used: boolean;
  usedAt: Date | null;
}
