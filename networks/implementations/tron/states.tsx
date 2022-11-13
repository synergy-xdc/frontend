import type { TronWeb } from "tronweb-typings";

import React, { useEffect } from "react";
import { BigNumber } from "ethers";

import Amount from "@/networks/base/amount";


export const getExtension = (): (TronWeb & typeof TronWeb) | undefined  => {
    return globalThis.tronWeb;
}

export const useSelfTronBalance = (): Amount | undefined => {
    const [balance, setBalance] = React.useState<Amount | undefined>(undefined);
    const extension = getExtension();

    extension?.trx.getBalance(extension?.defaultAddress.hex).then((data: any) => {
        setBalance(new Amount(BigNumber.from(data), 16));
    }).catch((err: any) => console.log(err));
    return balance;

}


export const useTronContractCall = (
    address: string | undefined,
    abi: any,
    functionName: string,
    args: any[] = []
): any | undefined => {
    const [response, setResponse] = React.useState<any>(undefined);
    const extension = getExtension();

    // const interval = setInterval(async () => {
    //     try {
    //         console.log(args);
    //         const contract = await extension?.contract(abi).at(address);
    //         setResponse(contract[functionName](...args).call());
    //         clearInterval(interval)
    //     } catch (err) {}
    // }, 1000)

    for (const arg of args) {
        if (arg === undefined) {
            return response;
        }
    }
    useEffect(() => {
        extension?.contract(abi).at(address).then((contract: any) => {
            contract[functionName](...args).call().then((result: any) => {
                setResponse(result);
            }).catch((err: any) => console.log(err))
        }).catch((err: any) => console.log(err));
    }, [response])


    return response;
}

export const useSelfTronAddress = (): {
    hex: string | false;
    base58: string | false;
} | undefined => {
    const extension = getExtension();

    return extension?.defaultAddress;
}
