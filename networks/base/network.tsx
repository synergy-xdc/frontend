import type { ReactNode } from "react";

import Amount from "@/networks/base/amount";
import TXState from "@/networks/base/txstate";
import { BigNumber } from "ethers";


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

export interface ContractUserInsurance {
    user: string;
    stakedRaw: BigNumber;
    repaidRaw: BigNumber;
    startTime: BigNumber;
    lockTime: BigNumber;
}

export interface FrontendUserInsurance {
    id: string,
    rawLocked: string,
    lockedAt: string,
    availableAt: string,
    rawRepaid: string,
    unstakeButton: ReactNode,
    availableCompensation: Amount
}

// return [
//   {
//     id: 123123,
//     raw_locked: 10,
//     locked_at: 2342134123123,
//     available_at: 1212312312312,
//     raw_repaid: 5,
//   },
// ];

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
    abstract getBurnRusdCallback(
        amount: Amount,
        insuranceId: string, 
        tx_state_changes_callback: (state: TXState) => void
    ): Function
    abstract getUserInssurances(): Array<FrontendUserInsurance>
    abstract stakeRawCallback(
        amountToStake: Amount,
        expireAt: Date,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function
    abstract unstakeCallback(
        insuranceId: string,
        tx_state_changes_callback: (state: TXState) => void,
    ): void

}


export default BaseNetwork;
