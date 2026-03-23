export interface Package {
  id: string;
  name: string;
  region: "bd" | "ind";
  price: number;
  credit_cost: number;
  target_glory: number;
  glory_per_5min: number;
  bot_count: number;
}

export interface Instance {
  id: string;
  guild_name: string;
  guild_id: string;
  region: "bd" | "ind";
  bot_count: number;
  status: "running" | "stopped";
  target_glory: number;
  earned_glory: number;
  glory_per_5min: number;
  started_at: string;
}

export interface UserData {
  id: string;
  email: string;
  credits: number;
  region: "bd" | "ind";
  isAdmin: boolean;
}

export const mockPackages: Package[] = [
  { id: "1", name: "Starter BD", region: "bd", price: 50, credit_cost: 50, target_glory: 1000, glory_per_5min: 50, bot_count: 5 },
  { id: "2", name: "Pro BD", region: "bd", price: 150, credit_cost: 150, target_glory: 5000, glory_per_5min: 100, bot_count: 15 },
  { id: "3", name: "Ultimate BD", region: "bd", price: 350, credit_cost: 350, target_glory: 15000, glory_per_5min: 200, bot_count: 30 },
  { id: "4", name: "Starter IND", region: "ind", price: 60, credit_cost: 60, target_glory: 1200, glory_per_5min: 60, bot_count: 5 },
  { id: "5", name: "Pro IND", region: "ind", price: 180, credit_cost: 180, target_glory: 6000, glory_per_5min: 120, bot_count: 15 },
  { id: "6", name: "Ultimate IND", region: "ind", price: 400, credit_cost: 400, target_glory: 18000, glory_per_5min: 250, bot_count: 35 },
];

export const mockInstances: Instance[] = [
  { id: "i1", guild_name: "Dragon Warriors", guild_id: "GLD001", region: "bd", bot_count: 15, status: "running", target_glory: 5000, earned_glory: 3200, glory_per_5min: 100, started_at: "2024-03-20T10:00:00Z" },
  { id: "i2", guild_name: "Phoenix Rising", guild_id: "GLD002", region: "ind", bot_count: 5, status: "stopped", target_glory: 1200, earned_glory: 1200, glory_per_5min: 60, started_at: "2024-03-19T08:00:00Z" },
];

export const mockUser: UserData = {
  id: "user-001",
  email: "demo@example.com",
  credits: 500,
  region: "bd",
  isAdmin: false,
};
