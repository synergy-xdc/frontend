import { BigNumber } from "ethers";

export default class Amount {
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
