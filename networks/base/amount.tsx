import { BigNumber, utils } from "ethers";


export default class Amount {
    amount: BigNumber
    decimals: number

    constructor(amount: BigNumber, decimals: number) {
        this.amount = amount;
        this.decimals = decimals;
    }

    toHumanString(roundTo: number): string {
        let numberStringified = utils.formatUnits(this.amount?.toString() ?? "0", this.decimals);
        const dotIndex = numberStringified.indexOf(".");
        numberStringified = numberStringified.slice(0, dotIndex) + "." + numberStringified.slice(dotIndex + 1, dotIndex + 1 + roundTo)
        if (numberStringified.endsWith(".0")) {
            numberStringified = numberStringified.slice(0, numberStringified.length - 2)
        }
        return numberStringified
    }

    mulAmount(other: Amount): Amount {
        return new Amount(
            this.amount.mul(other.amount),
            this.decimals + other.decimals
        )
    }

    divAmount(other: Amount): Amount {
        return new Amount(
            this.amount.div(other.amount),
            this.decimals - other.decimals
        )
    }

    static fromString(val: string, decimals: number): Amount {
        return new Amount(utils.parseUnits(isNaN(parseInt(val)) ? "0" : val, decimals), decimals)
    }
}
