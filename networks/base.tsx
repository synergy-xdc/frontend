import { ReactNode } from "react";

export interface WalletPrimaryData {
    address: string,
    network_currency_symbol: string,
    network_currency_amount?: string
}

abstract class BaseNetwork {
    abstract showWallet(): WalletPrimaryData | null
    abstract connectButton(): ReactNode
}


export default BaseNetwork;
