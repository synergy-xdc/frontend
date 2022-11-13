import type { ReactNode } from "react";

import Amount from "@/networks/base/amount";
import TXState from "@/networks/base/txstate";


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
    abstract showWallet(): WalletPrimaryData | undefined
    abstract connectButton(): ReactNode
    abstract getRusdBalance(): Amount | undefined
    abstract getAvailableSynths(): Synth[]
    abstract getRawBalance(): Amount | undefined
    abstract getWethBalance(): Amount | undefined
    abstract getRawPrice(): Amount | undefined
    abstract getWethPrice(): number | undefined
    abstract getWethAllowance(): Amount | undefined
    abstract getCurrentCRatio(): number | undefined
    abstract getMinCRatio(): number | undefined
    abstract getNewWethAllowanceCallback(amount: Amount, tx_state_changes_callback: (state: TXState) => void): Function
    abstract predictCollateralRatio(amountToMint: Amount, amountToPledge: Amount, increase: boolean): number | undefined
    abstract getMintCallback(
        amountToMint: Amount,
        amountToPledge: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function
    abstract getBurnRusdCallback(amount: Amount): Function
    abstract getUserInssurances(): Array<any>
}


export default BaseNetwork;
