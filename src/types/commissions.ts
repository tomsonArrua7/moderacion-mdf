export interface CommissionInfo {
  id: string;
  name: string;
  description?: string;
}

export const DEFAULT_COMMISSIONS: CommissionInfo[] = Array.from({ length: 15 }, (_, i) => {
  const num = i + 1;
  return {
    id: `COMISION-${num}`,
    name: `Comisión ${num}`,
    description: 'Lanzamiento MDF Juventudes • Comisión de Debate'
  };
});
