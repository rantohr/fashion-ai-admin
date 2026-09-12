export interface BusinessProfile {
  id: string;
  shopName: string;
  // Prisma's Decimal fields serialize to strings over JSON.
  monthlyRevenue: string;
  monthlyCosts: string;
  monthlyCustomers: number;
  monthlySalesVolume: number;
  marketingBudget: string;
  updatedAt: string;
}

export interface BusinessProfilePayload {
  shopName?: string;
  monthlyRevenue?: number;
  monthlyCosts?: number;
  monthlyCustomers?: number;
  monthlySalesVolume?: number;
  marketingBudget?: number;
}
