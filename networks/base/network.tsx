import type { ReactNode } from "react";

import Amount from "@/networks/base/amount";
import TXState from "@/networks/base/txstate";
import { BigNumber } from "ethers";


export interface WalletPrimaryData {
    address: string,
    network_currency_symbol: string,
    network_currency_amount?: string
}

export interface FrontendSynth {
    address: string
    fullName: string,
    symbol: string,
    tradingViewSymbol: string
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
    availableCompensation: Amount,
    availableCompensationString: string,
}

export interface FrontendLoan {
    borrowId: string,
    borrowedAt: Date,
    synthAddress: string,
    synthSymbol: string,
    borrowedSynthAmount: Amount,
    collateralRation: number,
    collateral: Amount,
    minCollateralRatio: number
}

export interface ContractLoan {
    user: string,
    syntAddress: string,
    borrowed: BigNumber,
    collateral: BigNumber,
    timestamp: BigNumber,
    minCollateralRatio: number,
    liquidationCollateralRatio : number,
    liquidationPenalty: number,
    treasuryFee: number,
    loanIndex: number
}


abstract class BaseNetwork {
    abstract showWallet(): WalletPrimaryData | undefined
    abstract connectButton(): ReactNode
    abstract getRusdBalance(): Amount | undefined
    abstract getAvailableSynths(): FrontendSynth[] | undefined
    abstract getRawBalance(): Amount | undefined
    abstract getWethBalance(): Amount | undefined
    abstract getRawPrice(): Amount | undefined
    abstract getWethPrice(): number | undefined
    abstract getWethAllowance(): Amount | undefined
    abstract getCurrentCRatio(): number | undefined
    abstract getMinCRatio(): number | undefined
    abstract getRawInsuranceAllowance(): Amount | undefined
    abstract getRusdLoanAllowance(): Amount | undefined
    abstract getNewWethAllowanceCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void
    ): Function
    abstract predictCollateralRatio(amountToMint: Amount, amountToPledge: Amount, increase: boolean): number | undefined
    abstract predictBorrowCollateralRatio(
        borrowId: string | undefined,
        synthAddress: string,
        amountToBorrow: Amount,
        amountToPledge: Amount,
        increase: boolean
    ): number | undefined
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
    abstract unlockWethCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function

    abstract getSynthBalance(
        synthAddress: string
    ): Amount | undefined
    abstract getNewRawAllowanceCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void
    ): Function

    abstract wethLocked(): Amount | undefined
    abstract rawRepay(): Amount | undefined
    abstract userDebt(): Amount | undefined
    abstract synthPrice(synthAddress: string): Amount | undefined
    abstract swapSynthCallback(
        methodName: "swapFrom" | "swapTo",
        synthFromAddress: string,
        synthToAddress: string,
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function
    abstract borrowSynthCallback(
        synthAddress: string,
        amountToBorrrow: Amount,
        amountToPledge: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function
    abstract setRusdLoanAllowanceCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function
    abstract minLoanColateralRatio(): number | undefined
    abstract mintWethCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function
    abstract mintRawCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function
    abstract totalLongs(synthAddress: string): Amount | undefined
    abstract totalShorts(synthAddress: string) : Amount | undefined
    abstract userLoans(): FrontendLoan[] | undefined
    abstract withdrawLoanCallback(
        borrowId: string,
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function
    abstract depositLoanCallback(
        borrowId: string,
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function
    abstract repayLoanCallback(
        borrowId: string,
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function
}


export default BaseNetwork;
