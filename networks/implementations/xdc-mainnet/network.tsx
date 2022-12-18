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
import LoanABI from "@/abi/Loan.json";

import { BigNumber, ethers, utils } from "ethers";

import React from "react";
import Amount from "@/networks/base/amount";
import BaseNetwork, { ContractLoan, ContractUserInsurance, FrontendLoan, FrontendSynth, FrontendUserInsurance, WalletPrimaryData } from "@/networks/base/network";
import TXState, { ContractWriteAccess } from "@/networks/base/txstate";
import { sign } from "crypto";
import { Button, toaster, useToaster } from "rsuite";
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected'
import { NotificationTXRevertError } from "@/components/WalletNotification";

wagmi.chain.arbitrum

const defaultChains: wagmi.Chain[] = [
    {
        id: 50,
        name: "XDC Network",
        network: "XDC Network",
        nativeCurrency: {
            name: "XDC",
            symbol: "XDC",
            decimals: 18
        },
        rpcUrls: {
            default: "https://rpc1.xinfin.network",
            public: "https://rpc1.xinfin.network",
        },
        testnet: false
    }
];
const { provider, webSocketProvider, chains } = wagmi.configureChains(defaultChains, [
    // walletConnectProvider({ projectId: "12647116f49027a9b16f4c0598eb6d74" }),
    publicProvider()
]);
const wagmiClient = wagmi.createClient({
    autoConnect: true,
    connectors: [new InjectedConnector({ chains })],
    provider,
    webSocketProvider
});

type DynAddress = `0x${string}` | undefined;


const SynergyAddress: string = "0xE0fd1bb6d8FB34daeFF08021Fa0752Ff061D4b4F";
const InsuranceAddress: string = "0xcB8ADE5a0122D2Ee4fD91b0d533d4d7c63044ce7";


const tradingViewSymbols = {
    rGLD: "GOLD",
    rGAS: "NATURALGAS"
}


export const EthereumClientContext = React.createContext<EthereumClient | undefined>(undefined);


class XDCMainnetNetwork extends BaseNetwork {
    wethApproveState: TXState = TXState.Done;
    rawApproveState: TXState = TXState.Done;
    unlockWethState: TXState = TXState.Done;
    mintState: TXState = TXState.Done;
    burnState: TXState = TXState.Done;
    stakeRawState: TXState = TXState.Done;
    swapState: TXState = TXState.Done;
    borrowSynthState: TXState = TXState.Done;
    rusdLoanAllowance: TXState = TXState.Done;
    mintWethState: TXState = TXState.Done;
    mintRawState: TXState = TXState.Done;
    withdrawLoanState: TXState = TXState.Done;
    depositLoanState: TXState = TXState.Done;
    repayLoanState: TXState = TXState.Done;

    showedTxs: string[] = [];

    connectButton(): ReactNode {
        const ethereumClient = React.useContext(EthereumClientContext);
        const { connect, connectors } = wagmi.useConnect();
        return (
            <div>
                <div id="ethereum-connect-button" style={{ color: "white" }}>
                    <Button
                        appearance="primary"
                        color="cyan"
                        onClick={() => connect({ connector: connectors[0] })}
                    ><b>Connect Injected</b></Button>
                </div>
            </div>
        );
    }
    showWallet(): WalletPrimaryData | undefined {
        const account = wagmi.useAccount();
        const balance = wagmi.useBalance({
            address: account.address,
        });
        console.log("WAL", balance.error)
        if (account.isConnected == false) {
            return undefined;
        }
        if (balance.data === undefined) {
            return undefined;
        }

        const wallet: WalletPrimaryData = {
            address: account.address as string,
            network_currency_symbol: "XDC",
            network_currency_amount: new Amount(balance.data.value, 18).toHumanString(6),
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

            watch: true
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
            watch: true
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
        const oracleAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "oracle",
        });
        const rawAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "raw",
        });
        const rawPrice = wagmi.useContractRead({
            address: oracleAddress.data as DynAddress,
            abi: OracleABI,
            functionName: "getPrice",
            args: [rawAddress.data],
        });
        if (rawPrice.data !== undefined) {
            const rawPriceBN = rawPrice.data[0] as BigNumber;
            const rawPriceDecimals = rawPrice.data[1];
            return new Amount(rawPriceBN, rawPriceDecimals);
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
            address: wethAddress.data,
            abi: WethABI,
            functionName: "balanceOf",
            args: [account.address],
            watch: true
        });
        console.log("WETHB", wethBalanceOfCall.error)
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

    getAvailableSynths(): undefined | FrontendSynth[] {
        // const synterAddress = wagmi.useContractRead({
        //     address: SynergyAddress,
        //     abi: SynergyABI,
        //     functionName: "synter"
        // })
        // const totalSynths = wagmi.useContractRead({
        //     address: synterAddress.data,
        //     abi: SynterABI,
        //     functionName: "totalSynts",
        // })
        // const availableSynthsAddresses = wagmi.useContractInfiniteReads({
        //     cacheKey: "synths",
        //     ...wagmi.paginatedIndexesConfig(
        //         (index) => {
        //             return [
        //                 {
        //                     address: synterAddress.data,
        //                     abi: SynterABI,
        //                     functionName: "syntList",
        //                     args: [BigNumber.from(index)] as const,
        //                 }
        //             ]
        //         },
        //         { start: 0, perPage: 20, direction: 'increment' },
        //     ),
        // })
        // availableSynthsAddresses.refetch()
        // console.log("SYNTHSLIST", availableSynthsAddresses.data?.pages[0]);

        // const synthsSymbols = wagmi.useContractReads({
        //     contracts: availableSynthsAddresses.data?.pages[0].filter(address => address).map((address) => {
        //         return {
        //             address: address,
        //             abi: SyntABI,
        //             functionName: "symbol",
        //         }
        //     }),
        // })
        // synthsSymbols.refetch()
        // const rusdAddress = wagmi.useContractRead({
        //     address: SynergyAddress,
        //     abi: SynergyABI,
        //     functionName: "rUsd"
        // })
        // const [availableSynths, setAvailableSynth] = React.useState<undefined | FrontendSynth[]>([]);
        // useEffect(() => {
        //     setAvailableSynth([
        //         {
        //             address: rusdAddress.data,
        //             fullName: "rUSD",
        //             symbol: "rUSD",
        //             tradingViewSymbol: "-"
        //         },
        //         ...synthsSymbols.data?.map((symbol) => {
        //             const index = synthsSymbols.data?.indexOf(symbol) ?? 0;
        //             return {
        //                 address: availableSynthsAddresses.data?.pages[0][index],
        //                 fullName: symbol,
        //                 symbol: symbol,
        //                 tradingViewSymbol: tradingViewSymbols[symbol],
        //             }
        //         }) ?? []
        //     ])
        // }, [availableSynthsAddresses.data, synthsSymbols.data])
        // return availableSynths;
        // console.log("SYMBOLS", synthsSymbols.data);
        // console.log("SYNTHS", synths)
        return [
            {
                address: "0x4d19BC4b07F97926544CEAC7CaAA6023F942A720",
                fullName: "rUSD",
                symbol: "rUSD",
                tradingViewSymbol: "-"
            },
            {
                address: "0x1FA0c70dD4A072eF4F21dFbD98c708889eFF5f59",
                fullName: "rGLD",
                symbol: "rGLD",
                tradingViewSymbol: tradingViewSymbols["rGLD"],
            },
            // {
            //     address: "0xae29c62Af11ce718d7bE506e2d04806164263a29",
            //     fullName: "rHPI",
            //     symbol: "rHPI",
            //     tradingViewSymbol: "-",
            // },
            {
                address: "0x18Cd2C6dD35EED4c06226618A2717F61A7FDAa0e",
                fullName: "rGAS",
                symbol: "rGAS",
                tradingViewSymbol: tradingViewSymbols["rGAS"],
            }
        ];
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
            return synergyCollateralRatio.data as number / 10 ** 6;
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
    ): ContractWriteAccess {
        const toaster = useToaster();
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
        return this._writeContractOrShowErrorFunction(
            setWethAllowanceSignConfig.error,
            setWethAllowanceSign.write,
            toaster
        )
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
        const allowance = this.getWethAllowance();
        const mintSignConfig = wagmi.usePrepareContractWrite({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "mint",
            args: [amountToMint.amount, amountToPledge.amount],
        })
        const toaster = useToaster();
        const mintSign = wagmi.useContractWrite(mintSignConfig.config);
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
        return this._writeContractOrShowErrorFunction(
            mintSignConfig.error,
            mintSign.write,
            toaster
        )
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
        const toaster = useToaster();
        const burnSign = wagmi.useContractWrite(burnSignConfig.config);
        const signWait = wagmi.useWaitForTransaction({ hash: burnSign.data?.hash });
        const newBurnState = this._defineStateChangesCallback(
            signWait.isFetching,
            burnSign.isLoading,
            signWait.status,
            this.burnState
        );

        if (this.burnState !== newBurnState) {
            this.burnState = newBurnState;
            tx_state_changes_callback(newBurnState);
        }
        return this._writeContractOrShowErrorFunction(
            burnSignConfig.error,
            burnSign.write,
            toaster
        );
    }

    getUserInssurances(): FrontendUserInsurance[] {
        const account = wagmi.useAccount();
        const insuranceCount = wagmi.useContractRead({
            address: InsuranceAddress,
            abi: InsuranceABI,
            functionName: "totalInsurances",
            args: [account.address]
        })
        const userInsurancesHashes = wagmi.useContractInfiniteReads({
            cacheKey: "userInsurances",
            ...wagmi.paginatedIndexesConfig(
                (index) => {
                    return [
                        {
                            address: InsuranceAddress,
                            abi: InsuranceABI,
                            functionName: "userInsurances",
                            args: [account.address, BigNumber.from(index)] as const,
                        }
                    ]
                },
                { start: 0, perPage: 20, direction: 'increment' },
            ),
        })
        const insurancesDetail = wagmi.useContractReads({
            contracts: userInsurancesHashes.data?.pages[0].filter(hash => hash).map((hash) => {
                return {
                    address: InsuranceAddress,
                    abi: InsuranceABI,
                    functionName: "insurances",
                    args: [hash]
                }
            }),
        })
        const insurancesCompensation = wagmi.useContractReads({
            contracts: userInsurancesHashes.data?.pages[0].filter(hash => hash).map((hash) => {
                return {
                    address: InsuranceAddress,
                    abi: InsuranceABI,
                    functionName: "availableCompensation",
                    args: [hash]
                }
            }),
        })
        const userInsurances: FrontendUserInsurance[] = insurancesDetail.data?.filter(elem => elem).map((insurance: ContractUserInsurance) => {
            const compensation = new Amount(
                insurancesCompensation.data?.[insurancesDetail.data?.indexOf(insurance) as number],
                18
            );
            return {
                id: userInsurancesHashes.data?.pages[0][insurancesDetail.data?.indexOf(insurance) as number],
                rawLocked: new Amount(insurance.stakedRaw, 18).toHumanString(4),
                lockedAt: new Date(insurance.startTime.toNumber() * 1000).toString(),
                availableAt: new Date(insurance.startTime.add(insurance.lockTime) * 1000).toString(),
                rawRepaid: new Amount(insurance.repaidRaw, 18).toHumanString(18),
                availableCompensation: compensation,
                availableCompensationString: compensation.toHumanString(3),
                unstakeButton: (
                    <Button
                        style={{ borderWidth: 2 }}
                        color="red"
                        appearance="ghost"
                        block
                        disabled={Date.now() / 1000 < insurance.startTime.toNumber() + insurance.lockTime}
                        // onClick={async (event) => await this.unstakeCallback(insuranceId, getStateHandlingCallback(toaster))}
                    >
                        Unstake
                    </Button>
                )
            }
        }) ?? []
        return userInsurances;
    }


    rawRepay(): Amount| undefined {
        const account = wagmi.useAccount();
        const userShares = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "userDebt",
            args: [account.address]
        })
        const userDebt = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "userDebts",
            args: [account.address]
        })

        if (
            userShares.data !== undefined && userDebt.data !== undefined
            && userShares.data !== null && userDebt.data !== null
        ) {
            let repay: BigNumber = userShares.data.sub(userDebt.data.minted);
            if (repay.lt(BigNumber.from(0))) {
                repay = BigNumber.from(0)
            }
            return new Amount(repay, 18)
        }
        return undefined;
    }

    stakeRawCallback(
        amountToStake: Amount,
        expireAt: Date,
        tx_state_changes_callback: (state: TXState) => void
    ): Function {
        const toaster = useToaster();
        const timeDelta = expireAt.getTime() - Date.now();
        const allowance = this.getRawInsuranceAllowance();
        console.log(expireAt.getTime(), Date.now());
        const stakeRawSignConfig = wagmi.usePrepareContractWrite({
            address: InsuranceAddress,
            abi: InsuranceABI,
            functionName: "stakeRaw",
            args: [Math.round(timeDelta / 1000), amountToStake.amount],
        });
        const stakeRawSign = wagmi.useContractWrite(stakeRawSignConfig.config);
        const signWait = wagmi.useWaitForTransaction({ hash: stakeRawSign.data?.hash });
        const newStakeRawState = this._defineStateChangesCallback(
            signWait.isFetching,
            stakeRawSign.isLoading,
            stakeRawSignConfig.status,
            this.stakeRawState
        );

        if (this.stakeRawState !== newStakeRawState) {
            this.stakeRawState = newStakeRawState;
            tx_state_changes_callback(newStakeRawState);
        }
        return this._writeContractOrShowErrorFunction(
            stakeRawSignConfig.error,
            stakeRawSign.write,
            toaster
        )
    }

    getRawInsuranceAllowance(): Amount | undefined {
        const account = wagmi.useAccount();
        const rawAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "raw",
        });
        const rawContract = wagmi.useToken({
            address: rawAddress.data as DynAddress,
        });
        const rawAllowance = wagmi.useContractRead({
            address: rawAddress.data as string,
            abi: RawABI,
            functionName: "allowance",
            args: [account.address, InsuranceAddress],
            watch: true
        });
        if (
            rawAllowance.data !== undefined &&
            rawContract.data?.decimals !== undefined
        ) {
            const balance: BigNumber = rawAllowance.data as BigNumber;
            return new Amount(balance, rawContract.data.decimals);
        }
        return undefined;
    }

    userDebt(): Amount | undefined {
        const account = wagmi.useAccount();
        const debt = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "userDebt",
            args: [account.address],
            watch: true
        })

        if (debt.data !== undefined && debt.data !== null) {
            const debtRusd = new Amount(debt.data, 18)
            return debtRusd;
        }
        return undefined;
    }

    predictBorrowCollateralRatio(
        borrowId: string | undefined,
        synthAddress: string,
        amountToBorrow: Amount,
        amountToPledge: Amount,
        increase: boolean
    ): number | undefined {
        const loanAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan"
        })
        const prediction = wagmi.useContractRead({
            address: loanAddress.data,
            abi: LoanABI,
            functionName: "predictCollateralRatio",
            args: [
                borrowId ?? ethers.constants.HashZero,
                synthAddress,
                amountToBorrow.amount,
                amountToPledge.amount,
                increase
            ]
        })
        if (prediction.data !== undefined && prediction.data !== null) {
            const newCratio = new Amount(prediction.data, 6);
            return parseFloat(newCratio.toHumanString(2))
        }
        return undefined
    }

    depositLoanCallback(
        borrowId: string,
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function {
        const toaster = useToaster();
        const loanAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan"
        })
        const allowance = this.getRusdLoanAllowance();
        const broadcastConfig = wagmi.usePrepareContractWrite({
            address: loanAddress.data,
            abi: LoanABI,
            functionName: "deposit",
            args: [borrowId, amount.amount],
        });
        const txSign = wagmi.useContractWrite(broadcastConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: txSign.data?.hash,
        });
        const newState = this._defineStateChangesCallback(
            signWait.isFetching,
            txSign.isLoading,
            signWait.status,
            this.depositLoanState,
        );
        if (this.depositLoanState !== newState) {
            this.depositLoanState = newState;
            tx_state_changes_callback(newState);
        }
        return this._writeContractOrShowErrorFunction(
            broadcastConfig.error,
            txSign.write,
            toaster
        )
    }

    borrowSynthCallback(
        synthAddress: string,
        amountToBorrrow: Amount,
        amountToPledge: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function {
        const toaster = useToaster();
        const loanAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan",
        });
        const allowance = this.getRusdLoanAllowance();
        const borrowSynthConfig = wagmi.usePrepareContractWrite({
            address: loanAddress.data as DynAddress,
            abi: LoanABI,
            functionName: "borrow",
            args: [synthAddress, amountToBorrrow.amount, amountToPledge.amount],
        });
        const borrowSynthSign = wagmi.useContractWrite(borrowSynthConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: borrowSynthSign.data?.hash,
        });

        const borrowSynthNewState = this._defineStateChangesCallback(
            signWait.isFetching,
            borrowSynthSign.isLoading,
            signWait.status,
            this.borrowSynthState,
        );
        if (this.borrowSynthState !== borrowSynthNewState) {
            this.borrowSynthState = borrowSynthNewState;
            tx_state_changes_callback(borrowSynthNewState);
        }
        return this._writeContractOrShowErrorFunction(
            borrowSynthConfig.error,
            borrowSynthSign.write,
            toaster
        )
    }

    getRusdLoanAllowance(): Amount | undefined {
        const account = wagmi.useAccount();
        const rusdAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "rUsd",
        });
        const loanAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan",
        });
        const rusdAllowance = wagmi.useContractRead({
            address: rusdAddress.data as string,
            abi: RawABI,
            functionName: "allowance",
            args: [account.address, loanAddress.data],
            watch: true
        });
        if (
            rusdAllowance.data !== undefined
        ) {
            const balance: BigNumber = rusdAllowance.data as BigNumber;
            return new Amount(balance, 18);
        }
        return undefined;
    }

    getNewRawAllowanceCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void
    ): Function {
        const toaster = useToaster();
        const rawAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "raw",
        });
        const setRawAllowanceSignConfig = wagmi.usePrepareContractWrite({
            address: rawAddress.data as DynAddress,
            abi: RawABI,
            functionName: "approve",
            args: [InsuranceAddress, amount.amount],
        });
        const setRawAllowanceSign = wagmi.useContractWrite(setRawAllowanceSignConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: setRawAllowanceSign.data?.hash,
        });
        console.log(
                        signWait.isFetching,
            setRawAllowanceSign.isLoading,
            signWait.status,
            this.rawApproveState,
        )
        const rawApproveNewState = this._defineStateChangesCallback(
            signWait.isFetching,
            setRawAllowanceSign.isLoading,
            signWait.status,
            this.rawApproveState,
        );
        if (this.rawApproveState !== rawApproveNewState) {
            this.rawApproveState = rawApproveNewState;
            tx_state_changes_callback(rawApproveNewState);
        }
        return this._writeContractOrShowErrorFunction(
            setRawAllowanceSignConfig.error,
            setRawAllowanceSign.write,
            toaster
        )
    }
    unstakeCallback(
        insuranceId: string,
        tx_state_changes_callback: (state: TXState) => void
    ): void {
        console.log("TODO");
    }

    synthPrice(synthAddress: string): Amount | undefined {
        const oralce = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "oracle"
        })
        const price = wagmi.useContractRead({
            address: oralce.data,
            abi: OracleABI,
            functionName: "getPrice",
            args: [synthAddress]
        })

        if (price.data !== undefined && price.data !== null) {
            const priceAmount = new Amount(price.data[0], price.data[1]);
            return priceAmount
        }
        return undefined

    }

    swapSynthCallback(
        methodName: "swapFrom" | "swapTo",
        synthFromAddress: string,
        synthToAddress: string,
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function {
        const toaster = useToaster();
        const synterAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "synter",
        });
        const swapConfig = wagmi.usePrepareContractWrite({
            address: synterAddress.data as DynAddress,
            abi: SynterABI,
            functionName: methodName,
            args: [synthFromAddress, synthToAddress, amount.amount],
        });
        const swapSign = wagmi.useContractWrite(swapConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: swapSign.data?.hash,
        });
        const swapNewState = this._defineStateChangesCallback(
            signWait.isFetching,
            swapSign.isLoading,
            signWait.status,
            this.swapState,
        );
        if (this.swapState !== swapNewState) {
            this.swapState = swapNewState;
            tx_state_changes_callback(swapNewState);
        }
        return this._writeContractOrShowErrorFunction(
            swapConfig.error,
            swapSign.write,
            toaster
        )
    }

    wethLocked(): Amount | undefined {
        const account = wagmi.useAccount();
        const userDebt = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "userDebts",
            args: [account?.address],
            watch: true
        })

        if (userDebt.data?.collateral !== undefined) {
            const wethAmount = new Amount(
                userDebt.data?.collateral,
                18
            )
            return wethAmount;
        }
        return undefined
    }

    unlockWethCallback(amount: Amount, tx_state_changes_callback: (state: TXState) => void): Function {
        const toaster = useToaster();
        const unlockWethConfig = wagmi.usePrepareContractWrite({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "withdraw",
            args: [amount.amount],
        });
        const unclockWethSign = wagmi.useContractWrite(unlockWethConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: unclockWethSign.data?.hash,
        });
        const unlockWethNewState = this._defineStateChangesCallback(
            signWait.isFetching,
            unclockWethSign.isLoading,
            signWait.status,
            this.unlockWethState,
        );
        if (this.unlockWethState !== unlockWethNewState) {
            this.unlockWethState = unlockWethNewState;
            tx_state_changes_callback(unlockWethNewState);
        }
        return this._writeContractOrShowErrorFunction(
            unlockWethConfig.error,
            unclockWethSign.write,
            toaster
        )
    }

    mintWethCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function {
        const toaster = useToaster();
        const account = wagmi.useAccount();
        const wethAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "wEth"
        })
        const broadcastConfig = wagmi.usePrepareContractWrite({
            address: wethAddress.data,
            abi: WethABI,
            functionName: "mint",
            args: [account.address, amount.amount],
        });
        const txSign = wagmi.useContractWrite(broadcastConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: txSign.data?.hash,
        });
        const newState = this._defineStateChangesCallback(
            signWait.isFetching,
            txSign.isLoading,
            signWait.status,
            this.mintWethState,
        );
        if (this.mintWethState !== newState) {
            this.mintWethState = newState;
            tx_state_changes_callback(newState);
        }
        return this._writeContractOrShowErrorFunction(
            broadcastConfig.error,
            txSign.write,
            toaster
        )
    }
    mintRawCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function {
        const toaster = useToaster();
        const account = wagmi.useAccount();
        const rawAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "raw"
        })
        const broadcastConfig = wagmi.usePrepareContractWrite({
            address: rawAddress.data,
            abi: RawABI,
            functionName: "mintTest",
            args: [amount.amount],
        });
        const txSign = wagmi.useContractWrite(broadcastConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: txSign.data?.hash,
        });
        const newState = this._defineStateChangesCallback(
            signWait.isFetching,
            txSign.isLoading,
            signWait.status,
            this.mintRawState,
        );
        if (this.mintRawState !== newState) {
            this.mintRawState = newState;
            tx_state_changes_callback(newState);
        }
        return this._writeContractOrShowErrorFunction(
            broadcastConfig.error,
            txSign.write,
            toaster
        )
    }

    getSynthBalance(synthAddress: string): Amount | undefined {
        const account = wagmi.useAccount();
        const balance = wagmi.useContractRead({
            address: synthAddress,
            abi: RusdABI,
            functionName: "balanceOf",
            args: [account.address],
            watch: true
        })

        if (balance.data !== undefined && balance.data !== null) {
            const amount = new Amount(balance.data, 18);
            return amount
        }
        return undefined
    }

    setRusdLoanAllowanceCallback(
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function {
        const toaster = useToaster();
        const rusdAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "rUsd"
        })
        const loadAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan"
        })
        const approveRusdForLoanConfig = wagmi.usePrepareContractWrite({
            address: rusdAddress.data,
            abi: RusdABI,
            functionName: "approve",
            args: [loadAddress.data, amount.amount],
        });
        const approveRusdForLoanSign = wagmi.useContractWrite(approveRusdForLoanConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: approveRusdForLoanSign.data?.hash,
        });
        const approveRusdForLoanNewState = this._defineStateChangesCallback(
            signWait.isFetching,
            approveRusdForLoanSign.isLoading,
            signWait.status,
            this.rusdLoanAllowance,
        );
        if (this.rusdLoanAllowance !== approveRusdForLoanNewState) {
            this.rusdLoanAllowance = approveRusdForLoanNewState;
            tx_state_changes_callback(approveRusdForLoanNewState);
        }
        return this._writeContractOrShowErrorFunction(
            approveRusdForLoanConfig.error,
            approveRusdForLoanSign.write,
            toaster
        )
    }

    minLoanColateralRatio(): number | undefined {
        const loadAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan"
        })
        const minLoanCRatio = wagmi.useContractRead({
            address: loadAddress.data,
            abi: LoanABI,
            functionName: "minCollateralRatio"
        })

        if (minLoanCRatio.data !== undefined && minLoanCRatio.data !== null) {
            const humanCRatio = new Amount(BigNumber.from(minLoanCRatio.data), 6);
            return parseFloat(humanCRatio.toHumanString(2))
        }
        return undefined
    }

    totalLongs(synthAddress: string): Amount | undefined {
        const loanAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan",
        })
        const totalLongs = wagmi.useContractRead({
            address: loanAddress.data,
            abi: LoanABI,
            functionName: "totalLongs",
            args: [synthAddress],
            watch: true
        })
        if (totalLongs.data !== undefined && totalLongs.data !== null) {
            const amount = new Amount(totalLongs.data, 18);
            return amount;
        }
        return undefined;
    }

    totalShorts(synthAddress: string): Amount | undefined {
        const loanAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan",
        })
        const totalShorts = wagmi.useContractRead({
            address: loanAddress.data,
            abi: LoanABI,
            functionName: "totalShorts",
            args: [synthAddress],
            watch: true
        })
        if (totalShorts.data !== undefined && totalShorts.data !== null) {
            const amount = new Amount(totalShorts.data, 18);
            return amount;
        }
        return undefined;
    }

    userLoans(): FrontendLoan[] | undefined {
        const [frontendLoans, setFrontendLoans] = React.useState<undefined | FrontendLoan[]>([]);
        const account = wagmi.useAccount();
        const loanAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan"
        });
        const userLoansHashes = wagmi.useContractInfiniteReads({
            cacheKey: "userLoans",
            ...wagmi.paginatedIndexesConfig(
                (index) => {
                    return [
                        {
                            address: loanAddress.data,
                            abi: LoanABI,
                            functionName: "userLoans",
                            args: [account.address, BigNumber.from(index)] as const,
                        }
                    ]
                },
                { start: 0, perPage: 20, direction: 'increment' },
            ),
        })
        if (!frontendLoans) {
            userLoansHashes.refetch()
        }

        const loansDetail = wagmi.useContractReads({
            contracts: userLoansHashes.data?.pages[0].filter(hash => hash).map((hash) => {
                return {
                    address: loanAddress.data,
                    abi: LoanABI,
                    functionName: "loans",
                    args: [hash]
                }
            }),
        })
        if (!frontendLoans) {
            loansDetail.refetch()
        }
        const loansCollateralRatio = wagmi.useContractReads({
            contracts: userLoansHashes.data?.pages[0].filter(hash => hash).map((hash) => {
                return {
                    address: loanAddress.data,
                    abi: LoanABI,
                    functionName: "collateralRatio",
                    args: [hash]
                }
            }),
        })
        if (!frontendLoans) {
            loansCollateralRatio.refetch()
        }
        const loansSynthSymbol = wagmi.useContractReads({
            contracts: loansDetail?.data?.filter(loan => loan).map((loan: ContractLoan) => {
                return {
                    address: loan.syntAddress,
                    abi: SyntABI,
                    functionName: "symbol",
                }
            }) ?? [],
        })
        if (!frontendLoans) {
            loansSynthSymbol.refetch()
        }
        useEffect(() => {
            setFrontendLoans(
                userLoansHashes.data?.pages[0].filter(hash => hash).map((hash) => {
                    const index = userLoansHashes.data?.pages[0].indexOf(hash);
                    const detail: ContractLoan = loansDetail.data?.[index ?? 0] ?? {};
                    const collateralRation: number = loansCollateralRatio.data?.[index ?? 0] ?? 0;
                    return {
                        borrowId: userLoansHashes.data?.pages[0][index],
                        borrowedAt: new Date(detail.timestamp?.toNumber() * 1000),
                        synthAddress: detail.syntAddress,
                        synthSymbol: loansSynthSymbol?.data?.[index],
                        borrowedSynthAmount: new Amount(detail.borrowed, 18),
                        collateral: new Amount(detail.collateral, 18),
                        collateralRation: Math.round(collateralRation / 10**6),
                        minCollateralRatio: Math.round(detail.minCollateralRatio / 10**6)
                    }
                })
            )
        }, [loansDetail.data, loansSynthSymbol.data])
        return frontendLoans;

    }

    withdrawLoanCallback(
        borrowId: string,
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function {
        const toaster = useToaster();
        const loanAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan"
        })
        const broadcastConfig = wagmi.usePrepareContractWrite({
            address: loanAddress.data,
            abi: LoanABI,
            functionName: "withdraw",
            args: [borrowId, amount.amount],
        });
        const txSign = wagmi.useContractWrite(broadcastConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: txSign.data?.hash,
        });
        const newState = this._defineStateChangesCallback(
            signWait.isFetching,
            txSign.isLoading,
            signWait.status,
            this.withdrawLoanState,
        );
        if (this.withdrawLoanState !== newState) {
            this.withdrawLoanState = newState;
            tx_state_changes_callback(newState);
        }
        return this._writeContractOrShowErrorFunction(
            broadcastConfig.error,
            txSign.write,
            toaster
        )
    }

    repayLoanCallback(
        borrowId: string,
        amount: Amount,
        tx_state_changes_callback: (state: TXState) => void,
    ): Function {
        const toaster = useToaster();
        const loanAddress = wagmi.useContractRead({
            address: SynergyAddress,
            abi: SynergyABI,
            functionName: "loan"
        })
        const broadcastConfig = wagmi.usePrepareContractWrite({
            address: loanAddress.data,
            abi: LoanABI,
            functionName: "repay",
            args: [borrowId, amount.amount],
        });
        const txSign = wagmi.useContractWrite(broadcastConfig.config);
        const signWait = wagmi.useWaitForTransaction({
            hash: txSign.data?.hash,
        });
        const newState = this._defineStateChangesCallback(
            signWait.isFetching,
            txSign.isLoading,
            signWait.status,
            this.repayLoanState,
        );
        if (this.repayLoanState !== newState) {
            this.repayLoanState = newState;
            tx_state_changes_callback(newState);
        }
        return this._writeContractOrShowErrorFunction(
            broadcastConfig.error,
            txSign.write,
            toaster
        )
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

    _writeContractOrShowErrorFunction(
        error: any | null,
        writeCallback: Function | undefined,
        toaster: ReturnType<typeof useToaster>
    ): Function {
        return () => {
            if (error) {
                console.error(error)
                toaster.push(
                    <NotificationTXRevertError message={error.reason} />,
                    { placement: "topStart"}
                )
                setTimeout(() => {
                    toaster.clear()
                }, 10*1000)
            } else {
                writeCallback?.()
            }
        }

    }
}

export default XDCMainnetNetwork;
