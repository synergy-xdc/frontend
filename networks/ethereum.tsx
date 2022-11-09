import BaseNetwork, { Amount, Synth, TXState, WalletPrimaryData } from "@/networks/base";
import { ConnectButton, useAccount, useBalance, useContractRead, Web3Modal, useToken, useContractWrite, useWaitForTransaction, useContractEvent } from "@web3modal/react";
import { ReactNode, useEffect } from "react";
import RawABI from "@/abi/RAW.json";
import RusdABI from "@/abi/RUSD.json";
import SynergyABI from "@/abi/Synergy.json";
import OracleABI from "@/abi/Oracle.json";
import WethABI from "@/abi/WETH.json";
import { chains } from "@web3modal/ethereum";
import { BigNumber, ethers, utils } from "ethers";
import React from "react";


// const SynergyAddress: string = "0x2f6F4493bb82f00Ed346De9353EF22cA277b7680";

const walletConnectConfig = {
    projectId: "12647116f49027a9b16f4c0598eb6d74",
    theme: "dark",
    accentColor: "default",
    ethereum: {
        appName: 'web3Modal',
        autoConnect: true,
        chains: [chains.goerli]
    }
};

// const AvailableSynth: Synth[] = [
//     {
//         address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
//         full_name: "Gold",
//         symbol: "GOLD",
//         trading_view_symbol: "GOLD"
//     },
//     {
//         address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
//         full_name: "Silver",
//         symbol: "SILVER",
//         trading_view_symbol: "SILVER"
//     }
// ]


class EthereumNetwork extends BaseNetwork {

    // wethApproveState: TXState = TXState.Done;
    // mintState: TXState = TXState.Done;

    // showedTxs: string[] = []

    connectButton(): ReactNode {
        return (
            <>
                <Web3Modal config={walletConnectConfig} />
                <div id="ethereum-connect-button" style={{color: "white"}}>
                    <ConnectButton />
                </div>
            </>

        );
    }

    showWallet(): WalletPrimaryData | null {

        const { account } = useAccount();

        console.log(account)
        
        const { data, error, isLoading, refetch } = useBalance({
            addressOrName: account.address
        })

        if (account.isConnected == false) {
            return null;
        }
        if (data === undefined) {
            return null;
        }

        const wallet: WalletPrimaryData = {
            address: account.address,
            network_currency_symbol: "ETH",
            network_currency_amount: data.formatted
        };
        return wallet
        return null
    }

    // getRusdBalance(): Amount | undefined {

    //     const { account, isReady } = useAccount();
    //     const synergyCallResult = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "rUsd",
    //         chainId: chains.goerli.id
    //     });
    //     const rusdContract = useToken({
    //         address: synergyCallResult.data
    //     })
    //     const rusdBalanceOfCall = useContractRead({
    //         address: synergyCallResult.data as string,
    //         abi: RusdABI,
    //         functionName: "balanceOf",
    //         args: [account.address],
    //         chainId: chains.goerli.id
    //     })
    //     useContractEvent({
    //         address: synergyCallResult.data ? synergyCallResult.data : "0x0",
    //         abi: WethABI,
    //         eventName: 'Transfer',
    //         listener: (...event) => {
    //             rusdBalanceOfCall.refetch().then((val) => val)
    //         }
    //     })
    //     if (rusdBalanceOfCall.data !== undefined && rusdContract.data?.decimals !== undefined) {
    //         const balance: BigNumber = rusdBalanceOfCall.data as BigNumber;
    //         return new Amount(balance, rusdContract.data.decimals)
    //     }
    //     return undefined
    // }

    // getRawBalance(): Amount | undefined {
    //     const { account, isReady } = useAccount();
    //     const synergyCallResult = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "raw",
    //         chainId: chains.goerli.id
    //     });
    //     const rawContract = useToken({
    //         address: synergyCallResult.data
    //     })
    //     const rawBalanceOfCall = useContractRead({
    //         address: synergyCallResult.data as string,
    //         abi: RawABI,
    //         functionName: "balanceOf",
    //         args: [account.address],
    //         chainId: chains.goerli.id
    //     })
    //     if (rawBalanceOfCall.data !== undefined && rawContract.data?.decimals !== undefined) {
    //         const balance: BigNumber = rawBalanceOfCall.data as BigNumber;
    //         return new Amount(balance, rawContract.data.decimals)
    //     }
    //     return undefined
    // }

    // getRawPrice(): Amount | undefined {
    //     const { account, isReady } = useAccount();
    //     const oracleContractAddressCall = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "oracle",
    //         chainId: chains.goerli.id
    //     });
    //     const rawContractAddressCall = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "raw",
    //         chainId: chains.goerli.id
    //     });
    //     const rawPriceCall = useContractRead({
    //         address: oracleContractAddressCall.data as string,
    //         abi: OracleABI,
    //         functionName: "getPrice",
    //         args: [rawContractAddressCall.data],
    //         chainId: chains.goerli.id
    //     })
    //     if (rawPriceCall.data !== undefined) {
    //         const rawPrice = rawPriceCall.data[0] as BigNumber;
    //         const rawPriceDecimals = rawPriceCall.data[1];
    //         return new Amount(rawPrice, rawPriceDecimals);
    //     } else {
    //         return undefined;
    //     }
    // }

    // getWethPrice(): number | undefined {
    //     const { account, isReady } = useAccount();
    //     const oracleContractAddressCall = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "oracle",
    //         chainId: chains.goerli.id
    //     });
    //     const rawContractAddressCall = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "wEth",
    //         chainId: chains.goerli.id
    //     });
    //     const rawPriceCall = useContractRead({
    //         address: oracleContractAddressCall.data as string,
    //         abi: OracleABI,
    //         functionName: "getPrice",
    //         args: [rawContractAddressCall.data],
    //         chainId: chains.goerli.id
    //     })
    //     if (rawPriceCall.data !== undefined) {
    //         const rawPrice = rawPriceCall.data[0] as BigNumber;
    //         const rawPriceDecimals = rawPriceCall.data[1] as BigNumber;
    //         return rawPrice.div(BigNumber.from(10).pow(rawPriceDecimals)).toNumber();
    //     } else {
    //         return undefined;
    //     }
    // }

    // getWethBalance(): Amount | undefined {
    //     const { account, isReady } = useAccount();
    //     const synergyCallResult = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "wEth",
    //         chainId: chains.goerli.id
    //     });
    //     const wethContract = useToken({
    //         address: synergyCallResult.data
    //     })
    //     const wethBalanceOfCall = useContractRead({
    //         address: synergyCallResult.data as string,
    //         abi: RawABI,
    //         functionName: "balanceOf",
    //         args: [account.address],
    //         chainId: chains.goerli.id
    //     })
    //     if (wethBalanceOfCall.data !== undefined && wethContract.data?.decimals !== undefined) {
    //         const balance: BigNumber = wethBalanceOfCall.data as BigNumber;
    //         return new Amount(balance, wethContract.data.decimals);
    //     }
    //     return undefined
    // }

    // getWethAllowance(): Amount | undefined {
    //     const { account, isReady } = useAccount();
    //     const synergyCallResult = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "wEth",
    //         chainId: chains.goerli.id
    //     });
    //     const wethContract = useToken({
    //         address: synergyCallResult.data
    //     })
    //     const wethAllowanceCall = useContractRead({
    //         address: synergyCallResult.data as string,
    //         abi: WethABI,
    //         functionName: "allowance",
    //         args: [account.address, SynergyAddress],
    //         chainId: chains.goerli.id
    //     })
    //     useContractEvent({
    //         address: synergyCallResult.data ? synergyCallResult.data : "0x0",
    //         abi: WethABI,
    //         eventName: 'Approval',
    //         listener: (...event) => {
    //             wethAllowanceCall.refetch().then((val) => val)
    //         }
    //     })
    //     useContractEvent({
    //         address: synergyCallResult.data ? synergyCallResult.data : "0x0",
    //         abi: WethABI,
    //         eventName: 'Transfer',
    //         listener: (...event) => {
    //             wethAllowanceCall.refetch().then((val) => val)
    //         }
    //     })
    //     // useEffect(() => {
    //     //     async function update() {
    //     //         console.log(1)
    //     //         await wethAllowanceCall.refetch()
    //     //     }
    //     //     update();
    //     // }, [])
    //     if (wethAllowanceCall.data !== undefined && wethContract.data?.decimals !== undefined) {
    //         const balance: BigNumber = wethAllowanceCall.data as BigNumber;
    //         return new Amount(balance, wethContract.data.decimals)
    //     }
    //     return undefined
    // }


    // getAvailableSynths(): Synth[] {
    //     return AvailableSynth
    // }

    // getCurrentCRatio(): number | undefined {
    //     const { account, isReady } = useAccount();
    //     const synergyCollateralRatioCall = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "collateralRatio",
    //         args: [account.address],
    //         chainId: chains.goerli.id
    //     });
    //     const wethCall = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "wEth",
    //         chainId: chains.goerli.id
    //     });
    //     useContractEvent({
    //         address: wethCall.data ? wethCall.data : "0x0",
    //         abi: WethABI,
    //         eventName: 'Approval',
    //         listener: (...event) => {
    //             synergyCollateralRatioCall.refetch().then((val) => val)
    //         }
    //     })
    //     useContractEvent({
    //         address: wethCall.data ? wethCall.data : "0x0",
    //         abi: WethABI,
    //         eventName: 'Transfer',
    //         listener: (...event) => {
    //             synergyCollateralRatioCall.refetch().then((val) => val)
    //         }
    //     })
    //     if (synergyCollateralRatioCall.data !== undefined) {
    //         return synergyCollateralRatioCall.data / (10 ** 6)
    //     }

    //     return undefined
    // }

    // getMinCRatio(): number | undefined {
    //     const synergyMinCollateralRatioCall = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "minCollateralRatio",
    //         chainId: chains.goerli.id
    //     });
    //     if (synergyMinCollateralRatioCall.data !== undefined) {
    //         const ratio: number = synergyMinCollateralRatioCall.data as number;
    //         return ratio / (10 ** 8) * 100
    //     }
    //     return undefined
    // }

    // getNewWethAllowanceCallback(
    //     amount: Amount,
    //     tx_state_changes_callback: (state: TXState) => void,
    // ): Function {
    //     const { account } = useAccount();
    //     const synergyWethCall = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "wEth",
    //         chainId: chains.goerli.id
    //     });
    //     const wethContract = useToken({
    //         address: synergyWethCall.data
    //     })
    //     const setWethAllowanceSign = useContractWrite({
    //         address: synergyWethCall.data,
    //         abi: WethABI,
    //         functionName: 'approve',
    //         args: [SynergyAddress, amount.amount],
    //         chainId: chains.goerli.id,
    //     })
    //     useContractEvent({
    //         address: synergyWethCall.data ? synergyWethCall.data : "0x0",
    //         abi: WethABI,
    //         eventName: 'Approval',
    //         listener: (...event) => {
    //             console.log(event, this.wethApproveState);
    //             if (event[3].transactionHash == setWethAllowanceSign.data?.hash && this.wethApproveState == TXState.Broadcasting) {
    //                 // this.showedTxs.push(setWethAllowanceSign.data?.hash);
    //                 this.wethApproveState = TXState.Done;
    //                 tx_state_changes_callback(TXState.Success);
    //             }

    //         }
    //     })
    //     const signWait = useWaitForTransaction({ hash: setWethAllowanceSign.data?.hash });
    //     const wethApproveNewState = this._defineStateChangesCallback(signWait.isWaiting, setWethAllowanceSign.isLoading, this.wethApproveState);

    //     if (this.wethApproveState !== wethApproveNewState) {
    //         console.log(signWait.isWaiting, setWethAllowanceSign.isLoading, this.wethApproveState, wethApproveNewState);
    //         this.wethApproveState = wethApproveNewState;
    //         tx_state_changes_callback(wethApproveNewState);
    //     }
    //     return setWethAllowanceSign.write

    // }

    // predictCollateralRatio(amountToMint: Amount, amountToPledge: Amount, increase: boolean): number | undefined {
    //     const { account, isReady } = useAccount();
    //     const predictCollateralRatioCall = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "predictCollateralRatio",
    //         args: [account.address, amountToMint.amount, amountToPledge.amount, increase],
    //         chainId: chains.goerli.id
    //     });
    //     const wethCall = useContractRead({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: "wEth",
    //         chainId: chains.goerli.id
    //     });
    //     useContractEvent({
    //         address: wethCall.data ? wethCall.data : "0x0",
    //         abi: WethABI,
    //         eventName: 'Approval',
    //         listener: (...event) => {
    //             predictCollateralRatioCall.refetch().then((val) => val)
    //         }
    //     })
    //     useContractEvent({
    //         address: wethCall.data ? wethCall.data : "0x0",
    //         abi: WethABI,
    //         eventName: 'Transfer',
    //         listener: (...event) => {
    //             predictCollateralRatioCall.refetch().then((val) => val)
    //         }
    //     })
    //     if (predictCollateralRatioCall.data !== undefined) {
    //         const cratio = predictCollateralRatioCall.data as BigNumber;
    //         const cratioAmount = new Amount(cratio, 6)
    //         return parseFloat(cratioAmount.toHumanString(2))
    //     } else {
    //         return undefined;
    //     }
    // }

    // getMintCallback(
    //     amountToMint: Amount,
    //     amountToPledge: Amount,
    //     tx_state_changes_callback: (state: TXState) => void,
    // ): Function {
    //     const { account } = useAccount();
    //     const mintSign = useContractWrite({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: 'mint',
    //         args: [amountToMint.amount, amountToPledge.amount],
    //         chainId: chains.goerli.id,
    //     })
    //     useContractEvent({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         eventName: 'Minted',
    //         listener: (...event) => {
    //             console.log(event);
    //             if (event[2].transactionHash == mintSign.data?.hash && this.mintState == TXState.Broadcasting) {
    //                 this.mintState = TXState.Done;
    //                 tx_state_changes_callback(TXState.Success);
    //             }
    //         }
    //     })
    //     const signWait = useWaitForTransaction({ hash: mintSign.data?.hash });
    //     const newMintState = this._defineStateChangesCallback(signWait.isWaiting, mintSign.isLoading, this.mintState);

    //     if (this.mintState !== newMintState) {
    //         console.log(signWait.isWaiting, mintSign.isLoading, this.mintState, newMintState);
    //         this.mintState = newMintState;
    //         tx_state_changes_callback(newMintState);
    //     }
    //     return mintSign.write

    // }

    // getBurnRusdCallback(amount: Amount): Function {
    //     const { account } = useAccount();
    //     const mintSign = useContractWrite({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         functionName: 'mint',
    //         args: [amountToMint.amount, amountToPledge.amount],
    //         chainId: chains.goerli.id,
    //     })
    //     useContractEvent({
    //         address: SynergyAddress,
    //         abi: SynergyABI,
    //         eventName: 'Minted',
    //         listener: (...event) => {
    //             console.log(event);
    //             if (event[2].transactionHash == mintSign.data?.hash && this.mintState == TXState.Broadcasting) {
    //                 this.mintState = TXState.Done;
    //                 tx_state_changes_callback(TXState.Success);
    //             }
    //         }
    //     })
    //     const signWait = useWaitForTransaction({ hash: mintSign.data?.hash });
    //     const newMintState = this._defineStateChangesCallback(signWait.isWaiting, mintSign.isLoading, this.mintState);

    //     if (this.mintState !== newMintState) {
    //         console.log(signWait.isWaiting, mintSign.isLoading, this.mintState, newMintState);
    //         this.mintState = newMintState;
    //         tx_state_changes_callback(newMintState);
    //     }
    //     return mintSign.write
    // }


    // _defineStateChangesCallback(
    //     isWaiting: boolean,
    //     isLoading: boolean,
    //     currentState: TXState
    // ): TXState {
    //     switch ([isWaiting, isLoading, currentState].toString()) {
    //         case [false, true, TXState.Done].toString():
    //             return TXState.AwaitWalletConfirmation
    //         case [false, true, TXState.AwaitWalletConfirmation].toString():
    //             return TXState.AwaitWalletConfirmation
    //         case [false, false, TXState.AwaitWalletConfirmation].toString():
    //             return TXState.Broadcasting
    //         case [true, false, TXState.Success].toString():
    //             return TXState.Done
    //         case [false, false, TXState.Done].toString():
    //             return TXState.Done
    //         default:
    //             return currentState
    //     }
    // }
}

export default EthereumNetwork;
