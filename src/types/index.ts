export type AttributionModel = 'equal' | 'role-based' | 'first-touch' | 'last-touch' | 'time-decay';

export type TouchpointType = 'referral' | 'demo' | 'intro' | 'support' | 'closer' | 'other';

export interface Partner {
  id: string;
  name: string;
  email: string;
  payout_details: Record<string, any>;
  created_at: string;
}

export interface Event {
  id: string;
  partner_id: string;
  deal_id: string;
  timestamp: string;
  touchpoint_type: TouchpointType;
  metadata: Record<string, any>;
}

export interface Deal {
  id: string;
  amount: number;
  closed_date: string;
  attribution_model: AttributionModel;
  created_at: string;
}

export interface AttributionResult {
  id: string;
  deal_id: string;
  partner_id: string;
  attribution_percentage: number;
  payout_amount: number;
  calculated_at: string;
}

export interface AttributionBreakdown {
  deal_id: string;
  total_amount: number;
  model: AttributionModel;
  attributions: Array<{
    partner_id: string;
    partner_name: string;
    percentage: number;
    payout: number;
    touchpoints: number;
    role?: string;
  }>;
  calculated_at: string;
}

export interface RoleWeights {
  referral: number;
  demo: number;
  intro: number;
  support: number;
  closer: number;
  other: number;
}
