export type AdminSection = 'inicio' | 'gestion' | 'personal' | 'tarifas' | 'contabilidad';

export type VehicleType = 'carro' | 'moto' | 'camioneta' | 'bicicleta' | 'otro';
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'qr' | 'otro';
export type StaffRole = 'admin' | 'vigilante';

export type PlanInfo = {
  id: string;
  code: string;
  name: string;
  max_tenants: number;
  max_admins: number;
  max_vigilantes: number;
  analytics_months: number;
};

export type TenantInfo = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  account_id: string;
  active: boolean;
  plan: PlanInfo | null;
};

export type LevelRow = {
  id: string;
  name: string;
  level_number: number;
};

export type CellRow = {
  id: string;
  level_id: string;
  code: string;
  status: 'available' | 'occupied' | 'reserved' | 'disabled';
};

export type StaffRow = {
  id: string;
  user_id: string;
  role: StaffRole;
  active: boolean;
};

export type RateRow = {
  id: string;
  vehicle_type: VehicleType;
  hourly_rate: number;
};

export type ActiveTicketRow = {
  id: string;
  plate: string;
  vehicle_type: VehicleType;
  cell_code: string;
  level_name: string;
  entry_time: string;
};

export type PaymentRow = {
  id: string;
  amount: number;
  method: PaymentMethod;
  paid_at: string;
};

export type RevenuePoint = {
  day: string;
  total: number;
};
