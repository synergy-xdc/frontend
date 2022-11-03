import { ReactNode } from "react";

export interface WalletPrimaryData {
    address: string,
    network_currency_symbol: string,
    network_currency_amount?: string
}

export interface Synth {
    address: string
    full_name: string,
    symbol: string,
    trading_view_symbol: string
}

abstract class BaseNetwork {
    abstract showWallet(): WalletPrimaryData | null
    abstract connectButton(): ReactNode
    abstract getRusdBalance(): number | undefined
    abstract getAvailableSynths(): Synth[]
    abstract getRusdAddress(): string
}


export default BaseNetwork;
