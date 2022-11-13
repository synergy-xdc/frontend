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
    const [isFirstFetch, setIsFirstFetch] = React.useState<boolean>(true);
    const extension = getExtension();

    if (address !== undefined && isFirstFetch) {
        extension?.contract(abi).at(address).then((contract: any) => {
            contract[functionName](...args).call().then((result: any) => {
                setIsFirstFetch(false);
                setResponse(result);
            }).catch((err: any) => console.log(err))
        }).catch((err: any) => console.log(err));
    }

    return response;
}

export const useTronContractWrite = (
    address: string | undefined,
    abi: any,
    functionName: string,
    cbBefore: Function,
    cbAfter: Function,
    args: any[] = [],
): () => void => {
    const extension = getExtension();

    return () => {
        console.log("trigger wallet", args);
        cbBefore()
        if (address !== undefined) {
            extension?.contract(abi).at(address).then((contract: any) => {
                contract[functionName](...args).send({
                    feeLimit: 100_000_000,
                    callValue: 0,
                    shouldPollResponse: false
                }).then((result: any) => {
                    console.log("write", result);
                    cbAfter()
                }).catch((err: any) => console.log(err))
            }).catch((err: any) => console.log(err));
        }
    }
}

export const useTronEvents  = (
    address: string | undefined,
    abi: any,
    eventName: string,
    cb: (err: any, event: any) => void
): void => {
    const extension = getExtension();
    extension?.contract(abi).at(address).then((contract: any) => {
        contract[eventName]().watch((err, event) => {
            console.log("EVENT", err, event)
            cb(err, event)
        }).then((res) => console.log("EVENT PROMISE", res));
    }).catch((err: any) => console.log(err));
}

export const useSelfTronAddress = (): {
    hex: string | false;
    base58: string | false;
} | undefined => {
    const extension = getExtension();

    return extension?.defaultAddress;
}
