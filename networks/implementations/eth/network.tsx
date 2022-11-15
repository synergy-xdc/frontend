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


const chains = [wagmi.chain.goerli];

const { provider, webSocketProvider } = wagmi.configureChains(chains, [
  walletConnectProvider({ projectId: "12647116f49027a9b16f4c0598eb6d74" }),
]);
const wagmiClient = wagmi.createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: "Synergy", chains }),
  provider,
  webSocketProvider
});
const ethereumClient = new EthereumClient(wagmiClient, chains);


const SynergyAddress: string = "0x2f6F4493bb82f00Ed346De9353EF22cA277b7680";

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


// const chains = [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum];

// // Wagmi client
// const { provider } = configureChains(chains, [
//   walletConnectProvider({ projectId: "<YOUR_PROJECT_ID>" }),
// ]);
// const wagmiClient = createClient({
//   autoConnect: true,
//   connectors: modalConnectors({ appName: "web3Moda", chains }),
//   provider,
// });

// // Web3Modal Ethereum Client
// const ethereumClient = new EthereumClient(wagmiClient, chains);

class EthereumNetwork extends BaseNetwork {
    wethApproveState: TXState = TXState.Done;
    mintState: TXState = TXState.Done;
    burnState: TXState = TXState.Done;
    stakeRawState: TXState = TXState.Done;

    showedTxs: string[] = [];

    connectButton(): ReactNode {
        return (
            <>
                <wagmi.WagmiConfig client={wagmiClient} />
                <Web3Modal
                    projectId="12647116f49027a9b16f4c0598eb6d74"
                    theme="dark"
                    accentColor="magenta"
                    ethereumClient={ethereumClient}
                />
                <div id="ethereum-connect-button" style={{ color: "white" }}>
                    <Web3Button />
                </div>
            </>
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
            address: rusdAddress.data as `0x${string}`,
        });
        const rusdBalanceOfCall = wagmi.useContractRead({
            address: rusdAddress.data as string,
            abi: RusdABI,
            functionName: "balanceOf",
            args: [account.address],
        });
        wagmi.useContractEvent({
            address: (rusdAddress.data ? rusdAddress.data : "0x0") as `0x${string}`,
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
        const { account, isReady } = wagmi.useAccount();
        const synergyCallResult = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "raw",
            chainId: chains.goerli.id,
        });
        const rawContract = wagmi.useToken({
            address: synergyCallResult.data,
        });
        const rawBalanceOfCall = wagmi.useContractRead({
            address: synergyCallResult.data as string,
            abi: RawABI,
            functionName: "balanceOf",
            args: [account.address],
            chainId: chains.goerli.id,
        });
        if (
            rawBalanceOfCall.data !== undefined &&
            rawContract.data?.decimals !== undefined
        ) {
            const balance: BigNumber = rawBalanceOfCall.data as BigNumber;
            return new Amount(balance, rawContract.data.decimals);
        }
        return undefined;
    }

    getRawPrice(): Amount | undefined {
        const { account, isReady } = wagmi.useAccount();
        const oracleContractAddressCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "oracle",
            chainId: chains.goerli.id,
        });
        const rawContractAddressCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "raw",
            chainId: chains.goerli.id,
        });
        const rawPriceCall = wagmi.useContractRead({
            address: oracleContractAddressCall.data as string,
            abi: OracleABI,
            functionName: "getPrice",
            args: [rawContractAddressCall.data],
            chainId: chains.goerli.id,
        });
        if (rawPriceCall.data !== undefined) {
            const rawPrice = rawPriceCall.data[0] as BigNumber;
            const rawPriceDecimals = rawPriceCall.data[1];
            return new Amount(rawPrice, rawPriceDecimals);
        } else {
            return undefined;
        }
    }

    getWethPrice(): number | undefined {
        const { account, isReady } = wagmi.useAccount();
        const oracleContractAddressCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "oracle",
            chainId: chains.goerli.id,
        });
        const rawContractAddressCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            chainId: chains.goerli.id,
        });
        const rawPriceCall = wagmi.useContractRead({
            address: oracleContractAddressCall.data as string,
            abi: OracleABI,
            functionName: "getPrice",
            args: [rawContractAddressCall.data],
            chainId: chains.goerli.id,
        });
        if (rawPriceCall.data !== undefined) {
            const rawPrice = rawPriceCall.data[0] as BigNumber;
            const rawPriceDecimals = rawPriceCall.data[1] as BigNumber;
            return rawPrice.div(BigNumber.from(10).pow(rawPriceDecimals)).toNumber();
        } else {
            return undefined;
        }
    }

    getWethBalance(): Amount | undefined {
        const { account, isReady } = wagmi.useAccount();
        const synergyCallResult = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            chainId: chains.goerli.id,
        });
        const wethContract = wagmi.useToken({
            address: synergyCallResult.data,
        });
        const wethBalanceOfCall = wagmi.useContractRead({
            address: synergyCallResult.data as string,
            abi: RawABI,
            functionName: "balanceOf",
            args: [account.address],
            chainId: chains.goerli.id,
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
        const { account, isReady } = wagmi.useAccount();
        const synergyCallResult = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            chainId: chains.goerli.id,
        });
        const wethContract = wagmi.useToken({
            address: synergyCallResult.data,
        });
        const wethAllowanceCall = wagmi.useContractRead({
            address: synergyCallResult.data as string,
            abi: WethABI,
            functionName: "allowance",
            args: [account.address, SynergyAddress],
            chainId: chains.goerli.id,
        });
        wagmi.useContractEvent({
            address: synergyCallResult.data ? synergyCallResult.data : "0x0",
            abi: WethABI,
            eventName: "Approval",
            listener: (...event) => {
                wethAllowanceCall.refetch().then((val) => val);
            },
        });
        wagmi.useContractEvent({
            address: synergyCallResult.data ? synergyCallResult.data : "0x0",
            abi: WethABI,
            eventName: "Transfer",
            listener: (...event) => {
                wethAllowanceCall.refetch().then((val) => val);
            },
        });
        // wagmi.useEffect(() => {
        //     async function update() {
        //         console.log(1)
        //         await wethAllowanceCall.refetch()
        //     }
        //     update();
        // }, [])
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
        const { account, isReady } = wagmi.useAccount();
        const synergyCollateralRatioCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "collateralRatio",
            args: [account.address],
            chainId: chains.goerli.id,
        });
        const wethCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            chainId: chains.goerli.id,
        });
        wagmi.useContractEvent({
            address: wethCall.data ? wethCall.data : "0x0",
            abi: WethABI,
            eventName: "Approval",
            listener: (...event) => {
                synergyCollateralRatioCall.refetch().then((val) => val);
            },
        });
        wagmi.useContractEvent({
            address: wethCall.data ? wethCall.data : "0x0",
            abi: WethABI,
            eventName: "Transfer",
            listener: (...event) => {
                synergyCollateralRatioCall.refetch().then((val) => val);
            },
        });
        if (synergyCollateralRatioCall.data !== undefined) {
            return synergyCollateralRatioCall.data / 10 ** 6;
        }

        return undefined;
    }

    getMinCRatio(): number | undefined {
        const synergyMinCollateralRatioCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "minCollateralRatio",
            chainId: chains.goerli.id,
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
        const { account } = wagmi.useAccount();
        const synergyWethCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            chainId: chains.goerli.id,
        });
        const wethContract = wagmi.useToken({
            address: synergyWethCall.data,
        });
        const setWethAllowanceSign = wagmi.useContractWrite({
            address: synergyWethCall.data,
            abi: WethABI,
            functionName: "approve",
            args: [SynergyAddress, amount.amount],
            chainId: chains.goerli.id,
        });
        wagmi.useContractEvent({
            address: synergyWethCall.data ? synergyWethCall.data : "0x0",
            abi: WethABI,
            eventName: "Approval",
            listener: (...event) => {
                console.log(event, this.wethApproveState);
                if (
                    event[3].transactionHash == setWethAllowanceSign.data?.hash &&
                    this.wethApproveState == TXState.Broadcasting
                ) {
                    // this.showedTxs.push(setWethAllowanceSign.data?.hash);
                    this.wethApproveState = TXState.Done;
                    tx_state_changes_callback(TXState.Success);
                }
            },
        });
        const signWait = wagmi.useWaitForTransaction({
            hash: setWethAllowanceSign.data?.hash,
        });
        const wethApproveNewState = this._defineStateChangesCallback(
            signWait.isWaiting,
            setWethAllowanceSign.isLoading,
            this.wethApproveState
        );

        if (this.wethApproveState !== wethApproveNewState) {
            console.log(
                signWait.isWaiting,
                setWethAllowanceSign.isLoading,
                this.wethApproveState,
                wethApproveNewState
            );
            this.wethApproveState = wethApproveNewState;
            tx_state_changes_callback(wethApproveNewState);
        }
        return setWethAllowanceSign.write;
    }

    predictCollateralRatio(
        amountToMint: Amount,
        amountToPledge: Amount,
        increase: boolean
    ): number | undefined {
        const { account, isReady } = wagmi.useAccount();
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
            chainId: chains.goerli.id,
        });
        const wethCall = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth",
            chainId: chains.goerli.id,
        });
        wagmi.useContractEvent({
            address: wethCall.data ? wethCall.data : "0x0",
            abi: WethABI,
            eventName: "Approval",
            listener: (...event) => {
                predictCollateralRatioCall.refetch().then((val) => val);
            },
        });
        wagmi.useContractEvent({
            address: wethCall.data ? wethCall.data : "0x0",
            abi: WethABI,
            eventName: "Transfer",
            listener: (...event) => {
                predictCollateralRatioCall.refetch().then((val) => val);
            },
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
        const { account } = wagmi.useAccount();
        const mintSign = wagmi.useContractWrite({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "mint",
            args: [amountToMint.amount, amountToPledge.amount],
            chainId: chains.goerli.id,
        });
        wagmi.useContractEvent({
            address: SynergyAddress,
            abi: SynergyABI,
            eventName: "Minted",
            listener: (...event) => {
                console.log(event);
                if (
                    event[2].transactionHash == mintSign.data?.hash &&
                    this.mintState == TXState.Broadcasting
                ) {
                    this.mintState = TXState.Done;
                    tx_state_changes_callback(TXState.Success);
                }
            },
        });
        const signWait = wagmi.useWaitForTransaction({ hash: mintSign.data?.hash });
        const newMintState = this._defineStateChangesCallback(
            signWait.isWaiting,
            mintSign.isLoading,
            this.mintState
        );

        if (this.mintState !== newMintState) {
            console.log(
                signWait.isWaiting,
                mintSign.isLoading,
                this.mintState,
                newMintState
            );
            this.mintState = newMintState;
            tx_state_changes_callback(newMintState);
        }
        return mintSign.write;
    }

    getBurnRusdCallback(
        amount: Amount,
        insuranceId: string,
        tx_state_changes_callback: (state: TXState) => void
    ): Function {
        const burnSign = wagmi.useContractWrite({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "burn",
            args: [amount.amount, insuranceId],
            chainId: chains.goerli.id,
        });
        wagmi.useContractEvent({
            address: SynergyAddress,
            abi: SynergyABI,
            eventName: "Burned",
            listener: (...event) => {
                console.log(event);
                if (
                    event[1].transactionHash == burnSign.data?.hash &&
                    this.burnState == TXState.Broadcasting
                ) {
                    this.burnState = TXState.Done;
                    tx_state_changes_callback(TXState.Success);
                }
            },
        });
        const signWait = wagmi.useWaitForTransaction({ hash: burnSign.data?.hash });
        const newBurnState = this._defineStateChangesCallback(
            signWait.isWaiting,
            burnSign.isLoading,
            this.burnState
        );

        if (this.burnState !== newBurnState) {
            console.log(
                signWait.isWaiting,
                burnSign.isLoading,
                this.burnState,
                newBurnState
            );
            this.burnState = newBurnState;
            tx_state_changes_callback(newBurnState);
        }
        return burnSign.write;
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
            chainId: chains.goerli.id,
        });

        const timeDelta = expireAt.getTime() - Date.now();
        const stakeRawSign = wagmi.useContractWrite({
            address: insuranceAddress,
            abi: InsuranceABI,
            functionName: "stakeRaw",
            args: [Math.round(timeDelta / 1000), amountToStake.amount],
            chainId: chains.goerli.id,
        });
        wagmi.useContractEvent({
            address: insuranceAddress,
            abi: InsuranceABI,
            eventName: "CreatedInsurance",
            listener: (...event) => {
                console.log(event);
                if (
                    event[4].transactionHash == stakeRawSign.data?.hash &&
                    this.stakeRawState == TXState.Broadcasting
                ) {
                    this.stakeRawState = TXState.Done;
                    tx_state_changes_callback(TXState.Success);
                }
            },
        });
        const signWait = wagmi.useWaitForTransaction({ hash: stakeRawSign.data?.hash });
        const newStakeRawState = this._defineStateChangesCallback(
            signWait.isWaiting,
            stakeRawSign.isLoading,
            this.stakeRawState
        );

        if (this.stakeRawState !== newStakeRawState) {
            console.log(
                signWait.isWaiting,
                stakeRawSign.isLoading,
                this.stakeRawState,
                newStakeRawState
            );
            this.stakeRawState = newStakeRawState;
            tx_state_changes_callback(newStakeRawState);
        }
        return stakeRawSign.write;
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
        currentState: TXState
    ): TXState {
        switch ([isWaiting, isLoading, currentState].toString()) {
            case [false, true, TXState.Done].toString():
                return TXState.AwaitWalletConfirmation;
            case [false, true, TXState.AwaitWalletConfirmation].toString():
                return TXState.AwaitWalletConfirmation;
            case [false, false, TXState.AwaitWalletConfirmation].toString():
                return TXState.Broadcasting;
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
