declare module 'midtrans-client' {
  export interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }

  export interface ItemDetails {
    id?: string;
    price: number;
    quantity: number;
    name: string;
  }

  export interface TransactionParameter {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
    item_details?: ItemDetails[];
    enabled_payments?: string[];
  }

  export interface TransactionResult {
    token: string;
    redirect_url?: string;
  }

  export class Snap {
    constructor(config: SnapConfig);
    createTransaction(parameter: TransactionParameter): Promise<TransactionResult>;
  }

  const midtransClient: {
    Snap: typeof Snap;
  };

  export default midtransClient;
}
