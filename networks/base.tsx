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
    abstract getRawBalance(): number | undefined
    abstract getWethBalance(): number | undefined
    abstract getRawPrice(): number | undefined
    abstract getWethPrice(): number | undefined
    abstract getWethAllowance(): number | undefined
    abstract getCurrentCRatio(): number | undefined
    abstract getMinCRatio(): number | undefined
    abstract getNewWethAllowanceCallback(human_amount: number): Function
}


export default BaseNetwork;
