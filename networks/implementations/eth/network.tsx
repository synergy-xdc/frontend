import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { Web3Modal, Web3Button } from "@web3modal/react";
import * as wagmi from "wagmi";

import { ReactNode, useEffect } from "react";

import RawABI from "@/abi/RAW.json";
import RusdABI from "@/abi/RUSD.json";
import SynergyABI from "@/abi/Synergy.json";
import OracleABI from "@/abi/Oracle.json";
import SynterABI from "@/abi/Synter.json";
import WethABI from "@/abi/WETH.json";
import InsuranceABI from "@/abi/Insurance.json";
import SyntABI from "@/abi/Synt.json";

import { BigNumber, ethers, utils } from "ethers";

import React from "react";
import Amount from "@/networks/base/amount";
import BaseNetwork, { FrontendSynth, FrontendUserInsurance, WalletPrimaryData } from "@/networks/base/network";
import TXState from "@/networks/base/txstate";
import { sign } from "crypto";

const CHAIN = wagmi.chain.goerli;
const chains = [wagmi.chain.goerli];

const { provider, webSocketProvider } = wagmi.configureChains(chains, [
  walletConnectProvider({ projectId: "12647116f49027a9b16f4c0598eb6d74" }),
]);
export const wagmiClient = wagmi.createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: "Synergy", chains }),
  provider,
  webSocketProvider
});
const ethereumClient = new EthereumClient(wagmiClient, chains);

type DynAddress = `0x${string}` | undefined;


const SynergyAddress: string = "0x2ECa37c63F732d05E9F4Ae31e6A7229598EaEe26";

// const walletConnectConfig = {
//     projectId: "12647116f49027a9b16f4c0598eb6d74",
//     theme: "dark",
//     accentColor: "default",
//     ethereum: {
//         appName: "Synergy",
//         autoConnect: true,
//         chains: [chains.goerli],
//     },
// };

const AvailableSynth: FrontendSynth[] = [
    {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        fullName: "Gold",
        symbol: "GOLD",
        tradingViewSymbol: "GOLD",
    },
    {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        fullName: "Silver",
        symbol: "SILVER",
        tradingViewSymbol: "SILVER",
    },
];


export const EthereumClientContext: React.Context<EthereumClient | undefined> = React.createContext(undefined);


class EthereumNetwork extends BaseNetwork {
    wethApproveState: TXState = TXState.Done;
    mintState: TXState = TXState.Done;
    burnState: TXState = TXState.Done;
    stakeRawState: TXState = TXState.Done;

    showedTxs: string[] = [];

    connectButton(): ReactNode {
        const ethereumClient = React.useContext(EthereumClientContext);
        return (
            <div>
                <Web3Modal
                    projectId="12647116f49027a9b16f4c0598eb6d74"
                    theme="dark"
                    accentColor="magenta"
                    ethereumClient={ethereumClient}
                />
                <div id="ethereum-connect-button" style={{ color: "white" }}>
                    <Web3Button />
                </div>
            </div>
        );
    }
    showWallet(): WalletPrimaryData | undefined {
        const account = wagmi.useAccount();
        const balance = wagmi.useBalance({
            address: account.address,
        });
        if (account.isConnected == false) {
            return undefined;
        }
        if (balance.data === undefined) {
            return undefined;
        }

        const wallet: WalletPrimaryData = {
            address: account.address as string,
            network_currency_symbol: "ETH",
            network_currency_amount: balance.data.formatted,
        };
        return wallet;
    }

    getRusdBalance(): Amount | undefined {
        const account = wagmi.useAccount();
        const rusdAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "rUsd",
        });
        const rusdContract = wagmi.useToken({
            address: rusdAddress.data as DynAddress,
        });
        const rusdBalanceOfCall = wagmi.useContractRead({
            address: rusdAddress.data as string,
            abi: RusdABI,
            functionName: "balanceOf",
            args: [account.address],
        });
        wagmi.useContractEvent({
            address: (rusdAddress.data ? rusdAddress.data : "0x0") as DynAddress,
            abi: WethABI,
            eventName: "Transfer",
            listener: (...event) => {
                rusdBalanceOfCall.refetch().then((val) => val);
            },
        });
        if (
            rusdBalanceOfCall.data !== undefined &&
            rusdContract.data?.decimals !== undefined
        ) {
            const balance: BigNumber = rusdBalanceOfCall.data as BigNumber;
            return new Amount(balance, rusdContract.data.decimals);
        }
        return undefined;
    }

    getRawBalance(): Amount | undefined {
        const account = wagmi.useAccount();
        const rawAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "raw",
        });
        const rawContract = wagmi.useToken({
            address: rawAddress.data as DynAddress,
        });
        const rawBalance = wagmi.useContractRead({
            address: rawAddress.data as DynAddress,
            abi: RawABI,
            functionName: "balanceOf",
            args: [account.address],
        });
        if (
            rawBalance.data !== undefined &&
            rawContract.data?.decimals !== undefined
        ) {
            const balance: BigNumber = rawBalance.data as BigNumber;
            return new Amount(balance, rawContract.data.decimals);
        }
        return undefined;
    }

    getRawPrice(): Amount | undefined {
        const account = wagmi.useAccount();
        const oracleContractAddressCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "oracle",
        });
        const rawContractAddressCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "raw",
        });
        const rawPrice = wagmi.useContractRead({
            address: oracleContractAddressCall.data as DynAddress,
            abi: OracleABI,
            functionName: "getPrice",
            args: [rawContractAddressCall.data],
        });
        if (rawPrice.data !== undefined) {
            const rawPrice = rawPrice.data[0] as BigNumber;
            const rawPriceDecimals = rawPrice.data[1];
            return new Amount(rawPrice, rawPriceDecimals);
        } else {
            return undefined;
        }
    }

    getWethPrice(): number | undefined {
        const account = wagmi.useAccount();
        const oracleContractAddressCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "oracle",
        });
        const rawContractAddressCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
        });
        const wethPrice = wagmi.useContractRead({
            address: oracleContractAddressCall.data as string,
            abi: OracleABI,
            functionName: "getPrice",
            args: [rawContractAddressCall.data],
        });
        if (wethPrice.data !== undefined) {
            const rawPrice = wethPrice.data[0] as BigNumber;
            const rawPriceDecimals = wethPrice.data[1] as BigNumber;
            return rawPrice.div(BigNumber.from(10).pow(rawPriceDecimals)).toNumber();
        } else {
            return undefined;
        }
    }

    getWethBalance(): Amount | undefined {
        const account = wagmi.useAccount();
        const wethAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
        });
        const wethContract = wagmi.useToken({
            address: wethAddress.data,
        });
        const wethBalanceOfCall = wagmi.useContractRead({
            address: wethAddress.data as string,
            abi: RawABI,
            functionName: "balanceOf",
            args: [account.address],
        });
        if (
            wethBalanceOfCall.data !== undefined &&
            wethContract.data?.decimals !== undefined
        ) {
            const balance: BigNumber = wethBalanceOfCall.data as BigNumber;
            return new Amount(balance, wethContract.data.decimals);
        }
        return undefined;
    }

    getWethAllowance(): Amount | undefined {
        const account = wagmi.useAccount();
        const wethAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
        });
        const wethContract = wagmi.useToken({
            address: wethAddress.data as DynAddress,
        });
        const wethAllowanceCall = wagmi.useContractRead({
            address: wethAddress.data as string,
            abi: WethABI,
            functionName: "allowance",
            args: [account.address, SynergyAddress],
            watch: true
        });
        if (
            wethAllowanceCall.data !== undefined &&
            wethContract.data?.decimals !== undefined
        ) {
            const balance: BigNumber = wethAllowanceCall.data as BigNumber;
            return new Amount(balance, wethContract.data.decimals);
        }
        return undefined;
    }

    getAvailableSynths(): FrontendSynth[] {
        return AvailableSynth;
    }

    getCurrentCRatio(): number | undefined {
        const account = wagmi.useAccount();
        const synergyCollateralRatio = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "collateralRatio",
            args: [account.address],
            watch: true
        });
        if (synergyCollateralRatio.data !== undefined) {
            return synergyCollateralRatio.data / 10 ** 6;
        }

        return undefined;
    }

    getMinCRatio(): number | undefined {
        const synergyMinCollateralRatioCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "minCollateralRatio",
        });
        if (synergyMinCollateralRatioCall.data !== undefined) {
            const ratio: number = synergyMinCollateralRatioCall.data as number;
            return (ratio / 10 ** 8) * 100;
        }
        return undefined;
    }

    getNewWethAllowanceCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void
    ): Function {
        const account = wagmi.useAccount();
        const wethAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            watch: true
        });
        const setWethAllowanceSignConfig = wagmi.usePrepareContractWrite({
            address: wethAddress.data as DynAddress,
            abi: WethABI,
            functionName: "approve",
            args: [SynergyAddress, amount.amount],
        });
        const setWethAllowanceSign = wagmi.useContractWrite(setWethAllowanceSignConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: setWethAllowanceSign.data?.hash,
        });
        const wethApproveNewState = this._defineStateChangesCallback(
            signWait.isFetching,
            setWethAllowanceSign.isLoading,
            signWait.status,
            this.wethApproveState,
        );
        if (this.wethApproveState !== wethApproveNewState) {
            this.wethApproveState = wethApproveNewState;
            tx_state_changes_callback(wethApproveNewState);
        }
        console.log(signWait.status);
        return setWethAllowanceSign.write ? setWethAllowanceSign.write : () => {};
    }

    predictCollateralRatio(
        amountToMint: Amount,
        amountToPledge: Amount,
        increase: boolean
    ): number | undefined {
        const account = wagmi.useAccount();
        const predictCollateralRatioCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "predictCollateralRatio",
            args: [
                account.address,
                amountToMint.amount,
                amountToPledge.amount,
                increase,
            ],
            watch: true
        });
        if (predictCollateralRatioCall.data !== undefined) {
            const cratio = predictCollateralRatioCall.data as BigNumber;
            const cratioAmount = new Amount(cratio, 6);
            return parseFloat(cratioAmount.toHumanString(2));
        } else {
            return undefined;
        }
    }

    getMintCallback(
        amountToMint: Amount,
        amountToPledge: Amount,
        tx_state_changes_callback: (state: TXState) => void
    ): Function {
        const mintSignConfig = wagmi.usePrepareContractWrite({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "mint",
            args: [amountToMint.amount, amountToPledge.amount],
        })
        const mintSign = wagmi.useContractWrite(mintSignConfig.config);
        console.log("MINT", mintSignConfig.error);
        const signWait = wagmi.useWaitForTransaction({ hash: mintSign.data?.hash });
        const newMintState = this._defineStateChangesCallback(
            signWait.isFetching,
            mintSign.isLoading,
            signWait.status,
            this.mintState,

        );
        if (this.mintState !== newMintState) {
            this.mintState = newMintState;
            tx_state_changes_callback(newMintState);
        }
        return mintSign.write ? mintSign.write : () => {};
    }

    getBurnRusdCallback(
        amount: Amount,
        insuranceId: string,
        tx_state_changes_callback: (state: TXState) => void
    ): Function {
        const burnSignConfig = wagmi.usePrepareContractWrite({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "burn",
            args: [amount.amount, insuranceId],
        });
        const burnSign = wagmi.useContractWrite(burnSignConfig.config);
        const signWait = wagmi.useWaitForTransaction({ hash: burnSign.data?.hash });
        const newBurnState = this._defineStateChangesCallback(
            signWait.isFetching,
            burnSign.isLoading,
            signWait.status,
            this.burnState
        );

        if (this.burnState !== newBurnState) {
            console.log(
                signWait.isFetching,
                burnSign.isLoading,
                this.burnState,
                newBurnState
            );
            this.burnState = newBurnState;
            tx_state_changes_callback(newBurnState);
        }
        return burnSign.write ? burnSign.write : () => {};
    }

    getUserInssurances(): FrontendUserInsurance[] {
        return [];
    }
    stakeRawCallback(
        amountToStake: Amount,
        expireAt: Date, tx_state_changes_callback: (state: TXState) => void
    ): Function {
        const insuranceAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "insurance",
        });

        const timeDelta = expireAt.getTime() - Date.now();
        const stakeRawSignConfig = wagmi.usePrepareContractWrite({
            address: insuranceAddress,
            abi: InsuranceABI,
            functionName: "stakeRaw",
            args: [Math.round(timeDelta / 1000), amountToStake.amount],
        });
        const stakeRawSign = wagmi.useContractWrite(stakeRawSignConfig.config);
        // wagmi.useContractEvent({
        //     address: insuranceAddress,
        //     abi: InsuranceABI,
        //     eventName: "CreatedInsurance",
        //     listener: (...event) => {
        //         console.log(event);
        //         if (
        //             event[4].transactionHash == stakeRawSign.data?.hash &&
        //             this.stakeRawState == TXState.Broadcasting
        //         ) {
        //             this.stakeRawState = TXState.Done;
        //             tx_state_changes_callback(TXState.Success);
        //         }
        //     },
        // });
        const signWait = wagmi.useWaitForTransaction({ hash: stakeRawSign.data?.hash });
        const newStakeRawState = this._defineStateChangesCallback(
            signWait.isFetching,
            stakeRawSign.isLoading,
            this.stakeRawState
        );

        if (this.stakeRawState !== newStakeRawState) {
            console.log(
                signWait.isFetching,
                stakeRawSign.isLoading,
                this.stakeRawState,
                newStakeRawState
            );
            this.stakeRawState = newStakeRawState;
            tx_state_changes_callback(newStakeRawState);
        }
        return stakeRawSign.write ? stakeRawSign.write : () => {};
    }
    unstakeCallback(insuranceId: string, tx_state_changes_callback: (state: TXState) => void): void {
        console.log(1);
    }
    unlockWethCallback(amount: Amount, tx_state_changes_callback: (state: TXState) => void): Function {
        console.log(1);
    }
    getSynthBalance(synthAddress: string): Amount | undefined {
        console.log(1);
    }

    _defineStateChangesCallback(
        isWaiting: boolean,
        isLoading: boolean,
        status: string,
        currentState: TXState
    ): TXState {
        if (status === "loading" && currentState === TXState.AwaitWalletConfirmation) {
            return TXState.Broadcasting;
        } else if (status == "success" && currentState === TXState.Broadcasting) {
            return TXState.Success
        }
        switch ([isWaiting, isLoading, currentState].toString()) {
            case [false, true, TXState.Done].toString():
                return TXState.AwaitWalletConfirmation;
            case [false, true, TXState.AwaitWalletConfirmation].toString():
                return TXState.AwaitWalletConfirmation;
            case [true, false, TXState.Success].toString():
                return TXState.Done;
            case [false, false, TXState.Done].toString():
                return TXState.Done;
            default:
                return currentState;
        }
    }
}

export default EthereumNetwork;
