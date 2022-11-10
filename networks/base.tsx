import { BigNumber } from "ethers";
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

export enum TXState {
    AwaitWalletConfirmation,
    WalletConfirmationDeclined,
    Broadcasting,
    EVMError,
    Success,
    Done
}

// export interface TokenAmount {
//     amount: BigNumber,
//     decimals: number
// }


export class Amount {
    amount: BigNumber
    decimals: number

    constructor(amount: BigNumber, decimals: number) {
        this.amount = amount;
        this.decimals = decimals;
    }

    toHumanString(roundTo: number): string {
        const wholeStringified = this.amount.toString();
        let floatStringified =
            wholeStringified.slice(0, wholeStringified.length - this.decimals)
            + "."
            + wholeStringified
                .slice(wholeStringified.length - this.decimals, wholeStringified.length)
                .slice(0, roundTo)
        ;
        if (floatStringified.startsWith(".")) {
            floatStringified = "0" + floatStringified;
        }
        while (floatStringified.endsWith("0")) {
            floatStringified = floatStringified.slice(0, floatStringified.length - 1)
        }
        if (floatStringified.endsWith(".")) {
            floatStringified = floatStringified.slice(0, floatStringified.length - 1)
        }
        return floatStringified;
    }

    mulAmount(other: Amount): Amount {
        return new Amount(
            this.amount.mul(other.amount),
            this.decimals + other.decimals
        )
    }

    static fromString(val: string, decimals: number): Amount {
        val = val ? val : "0";
        if (val.includes(".") || val.includes(",")) {
            const [integerStr, decimalStr] = val.includes(".") ? val.split(".") : val.split(",");
            const [integer, decimal] = [parseInt(integerStr), parseInt(decimalStr)];
            return new Amount(
                BigNumber.from(integer).mul(BigNumber.from(10).pow(decimals))
                .add(BigNumber.from(decimal).mul(BigNumber.from(10).pow(decimals - decimalStr.length))),
                decimals
            )
        } else {
            return new Amount(
                BigNumber.from(parseInt(val)).mul(BigNumber.from(10).pow(decimals)),
                decimals
            )
        }
    }
}

abstract class BaseNetwork {
    abstract showWallet(): WalletPrimaryData | null
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
}


export default BaseNetwork;
