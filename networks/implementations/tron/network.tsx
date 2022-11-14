
import BaseNetwork, { ContractUserInsurance, FrontendUserInsurance, FrontendSynth, WalletPrimaryData } from "@/networks/base/network";
import Amount from "@/networks/base/amount";
import TXState from "@/networks/base/txstate";

import { ReactNode, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import React from "react";
import { Button, useToaster } from "rsuite";
import {
    getExtension,
    useSelfTronAddress,
    useSelfTronBalance,
    useTronContractCall,
    useTronContractWrite,
    useTronEvents
} from "@/networks/implementations/tron/states";
import RawABI from "@/abi/RAW.json";
import RusdABI from "@/abi/RUSD.json";
import SynergyABI from "@/abi/Synergy.json";
import OracleABI from "@/abi/Oracle.json";
import SynterABI from "@/abi/Synter.json";
import WethABI from "@/abi/WETH.json";
import InsuranceABI from "@/abi/Insurance.json";
import SyntABI from "@/abi/Synt.json";

import { getStateHandlingCallback } from "@/components/WalletNotification";


const tradingViewSymbols = {
    rGLD: "GOLD",
    rGAS: "GAS"
}


const SynergyTRONAddress: string = "TVmQ81jx8v5jT4u6qKkGdajnBKZTA7UJUg";

class TronNetwork extends BaseNetwork {

    connectButton(): ReactNode {
        return (
        <Button
            style={{ backgroundColor: "linear-gradient(transparent, #089a81)" }}
            appearance="primary"
            onClick={() => this.getRusdBalance()}
        >
            Connect Wallet
        </Button>
        );
    }

    showWallet(): WalletPrimaryData | undefined {
        const balance = useSelfTronBalance();
        const selfAddress = useSelfTronAddress();

        if (
            balance === undefined ||
            selfAddress === undefined ||
            !selfAddress.base58
        ) {
            return undefined;
        } else {
            return {
                address: selfAddress?.base58,
                network_currency_symbol: "TRX",
                network_currency_amount: balance.toHumanString(3),
            };
        }
    }

    getRusdBalance(): Amount | undefined {
        const selfAddress = useSelfTronAddress();
        const extension = getExtension();

        const rusdAddress: string | undefined = useTronContractCall(
            SynergyTRONAddress,
            SynergyABI,
            "rUsd"
        );
        const rusdBalance: BigNumber | undefined = useTronContractCall(
            rusdAddress,
            RusdABI,
            "balanceOf",
            [selfAddress?.base58]
        );

        if (rusdBalance !== undefined) {
            return new Amount(rusdBalance, 18);
        }
        return undefined;
    }

  getRawBalance(): Amount | undefined {
    const selfAddress = useSelfTronAddress();
    const extension = getExtension();

    const rusdAddress: string | undefined = useTronContractCall(
        SynergyTRONAddress,
        SynergyABI,
        "raw"
    );
    const rusdBalance: BigNumber | undefined = useTronContractCall(
        rusdAddress,
        RusdABI,
        "balanceOf",
        [selfAddress?.base58]
    );

    if (rusdBalance !== undefined) {
      return new Amount(rusdBalance, 18);
    }
    return undefined;
  }

  getWethPrice(): number | undefined {
    return undefined;
  }

  getWethBalance(): Amount | undefined {
    const selfAddress = useSelfTronAddress();
    const wtrxAddress: string | undefined = useTronContractCall(
        SynergyTRONAddress,
        SynergyABI,
        "wEth"
    );
    const wtrxBalance: BigNumber | undefined = useTronContractCall(
        wtrxAddress,
        WethABI,
        "balanceOf",
        [selfAddress?.base58]
    );

    if (wtrxBalance !== undefined) {
        return new Amount(wtrxBalance, 18)
    }
    return undefined;
  }

  getWethAllowance(): Amount | undefined {
    const [amount, setAmount] = useState(undefined);

    const selfAddress = useSelfTronAddress();
    const wtrxAddress: string | undefined = useTronContractCall(
        SynergyTRONAddress,
        SynergyABI,
        "wEth"
    );
    const wtrxAllowance: BigNumber | undefined = useTronContractCall(
        wtrxAddress,
        WethABI,
        "allowance",
        [selfAddress?.base58, SynergyTRONAddress]
    );

    if (wtrxAllowance !== undefined) {
        return new Amount(wtrxAllowance, 18)
    }
    return undefined;
  }

    getCurrentCRatio(): number | undefined {
        const selfAddress = useSelfTronAddress();
        const cration: number | undefined = useTronContractCall(
            SynergyTRONAddress,
            SynergyABI,
            "collateralRatio",
            [selfAddress?.hex]
        );

        if (cration !== undefined) {
            return cration / 10 ** 6
        }
        return cration
    }

  getMinCRatio(): number | undefined {
        const selfAddress = useSelfTronAddress();
        const cration: number | undefined = useTronContractCall(
            SynergyTRONAddress,
            SynergyABI,
            "minCollateralRatio",
        );

        if (cration !== undefined) {
            return cration / 10 ** 6
        }
        return cration
  }

  getNewWethAllowanceCallback(
    amount: Amount,
    tx_state_changes_callback: (state: TXState) => void
  ): Function {
    const wtrxContract: string | undefined = useTronContractCall(
        SynergyTRONAddress,
        SynergyABI,
        "wEth"
    );
    const cb = useTronContractWrite(
        wtrxContract,
        WethABI,
        "approve",
        () => tx_state_changes_callback(TXState.AwaitWalletConfirmation),
        () => tx_state_changes_callback(TXState.Success),
        [SynergyTRONAddress, amount.amount]
    );
    useTronEvents(
        SynergyTRONAddress,
        SynergyABI,
        "Approval",
        (err: any, event: any) => {
            console.log(err, event);
        }
    );
    return cb;
  }

    predictCollateralRatio(
        amountToMint: Amount,
        amountToPledge: Amount,
        increase: boolean
    ): number | undefined {
        const selfAddress = useSelfTronAddress();
        const newCratio: BigNumber | undefined = useTronContractCall(
            SynergyTRONAddress,
            SynergyABI,
            "predictCollateralRatio",
            [selfAddress?.base58, amountToMint.amount, amountToPledge.amount, increase]
        );
        console.log("NEW CRATIO", newCratio)

        if (newCratio !== undefined) {
            return newCratio.div(BigNumber.from(10).pow(6)).toNumber()
        }
        return undefined
    }

    getMintCallback(
        amountToMint: Amount,
        amountToPledge: Amount,
        tx_state_changes_callback: (state: TXState) => void
    ): Function {
        const cb = useTronContractWrite(
            SynergyTRONAddress,
            SynergyABI,
            "mint",
            () => tx_state_changes_callback(TXState.AwaitWalletConfirmation),
            () => tx_state_changes_callback(TXState.Success),
            [amountToMint.amount, amountToPledge.amount]
        );
        useTronEvents(
            SynergyTRONAddress,
            SynergyABI,
            "Minted",
            (err: any, event: any) => {
                console.log(err, event);
            }
        );
        return cb;
    }

    getBurnRusdCallback(
        amountToBurn: Amount,
        insuranceId: string,
        tx_state_changes_callback: (state: TXState) => void
    ): Function {
        const cb = useTronContractWrite(
            SynergyTRONAddress,
            SynergyABI,
            "burn",
            () => tx_state_changes_callback(TXState.AwaitWalletConfirmation),
            () => tx_state_changes_callback(TXState.Success),
            [amountToBurn.amount, insuranceId]
        );
        useTronEvents(
            SynergyTRONAddress,
            SynergyABI,
            "Burned",
            (err: any, event: any) => {
                console.log(err, event);
            }
        );
        return cb;
    }


  getUserInssurances(): FrontendUserInsurance[] {
    const selfAddress = useSelfTronAddress();
    const extension = getExtension();

    const [userInsurances, setUserInsurances] = React.useState<FrontendUserInsurance[]>([]);
    const [userInsurancesIndex, setUserInsurancesIndex] = React.useState<number>(0);
    const [userInsurancesFetched, setUserInsurancesFetched] = React.useState<boolean>(false);

    const insuranceAddress: string | undefined = useTronContractCall(
        SynergyTRONAddress,
        SynergyABI,
        "insurance"
    );

    const toaster = useToaster();

    useEffect(() => {
        const fetchInsurances = async () => {
            if (insuranceAddress !== undefined && !userInsurancesFetched) {
                const insuranceContract = await extension?.contract(InsuranceABI).at(insuranceAddress);
                while (true) {
                    try {
                        const insuranceId: string = await insuranceContract.userInsurances(selfAddress?.base58, userInsurancesIndex).call();
                        const insurance: ContractUserInsurance = await insuranceContract.insurances(insuranceId).call();
                        const availableCompensation = await insuranceContract.availableCompensation(insuranceId).call();
                        if (!userInsurances.find(obj => obj.id === insuranceId)) {
                            console.log(insuranceId, typeof insuranceId)
                            userInsurances.push({
                                id: insuranceId,
                                rawLocked: new Amount(insurance.stakedRaw, 18).toHumanString(4),
                                lockedAt: new Date(insurance.startTime.toNumber() * 1000).toString(),
                                availableAt: new Date(insurance.startTime.add(insurance.lockTime) * 1000).toString(),
                                rawRepaid: new Amount(insurance.repaidRaw, 18).toHumanString(18),
                                availableCompensation: new Amount(availableCompensation, 18),
                                unstakeButton: <Button
                                    style={{ borderWidth: 2 }}
                                    color="red"
                                    appearance="ghost"
                                    block
                                    disabled={Date.now() / 1000 < insurance.startTime.toNumber() + insurance.lockTime.toNumber()}
                                    onClick={async (event) => await this.unstakeCallback(insuranceId, getStateHandlingCallback(toaster))}
                                >
                                    Unstake
                                </Button>
                            });
                        }
                        setUserInsurancesIndex(userInsurancesIndex + 1);
                    } catch (err) {
                        console.error(err)
                        setUserInsurancesFetched(true)
                        break
                    }
                }
            }
        }
        fetchInsurances()
    }, [userInsurancesIndex, insuranceAddress])


    return userInsurances;
  }

    getAvailableSynths(): FrontendSynth[] {
        // const selfAddress = useSelfTronAddress();
        // const extension = getExtension();

        // const [availableSynths, setAvailableSynths] = React.useState<FrontendSynth[]>([]);
        // const [availableSynthIndex, setAvailableSynthIndex] = React.useState<number>(0);
        // const [synthsFetched, setSynthsFetched] = React.useState<boolean>(false);
        // const synterAddress: string | undefined = useTronContractCall(
        //     SynergyTRONAddress,
        //     SynergyABI,
        //     "synter"
        // )
        // console.log("SYNTER", synterAddress)

        // useEffect(() => {
        //     const fetchSynths = async () => {
        //         if (synterAddress !== undefined && !synthsFetched) {
        //             console.log("syntaddres", 1)
        //             const synterContract = await extension?.contract(SynterABI).at(synterAddress);

        //             while (true) {
        //                 try {
        //                     const synthContractAddress: string = await synterContract.syntList(availableSynthIndex).call();
        //                     console.log("syntaddres", synthContractAddress)
        //                     const synthContract = await extension?.contract(SyntABI).at(synthContractAddress);
        //                     const synthName: string = await synthContract.name().call();
        //                     const synthSymbol: string = await synterContract.symbol().call();
        //                     console.log("syntaddres", synthContractAddress)
        //                     if (!availableSynths.find(obj => obj.address === synthContractAddress)) {
        //                         availableSynths.push({
        //                             address: synthContractAddress,
        //                             fullName: synthName,
        //                             symbol: synthSymbol,
        //                             tradingViewSymbol: tradingViewSymbols[synthSymbol]
        //                         });
        //                     }
        //                     setAvailableSynthIndex(availableSynthIndex + 1)
        //                 } catch (err) {
        //                     console.error(err)
        //                     setSynthsFetched(true)
        //                     break
        //                 }
        //             }
        //         }
        //     }
        //     fetchSynths()
        // }, [availableSynths, availableSynthIndex])


        // return availableSynths;

        return [
            {
                address: "TJ9acewm9Li9utY6GxK7e4qDvaRMY72uGk",
                fullName: "rGOLD",
                symbol: "rGOLD",
                tradingViewSymbol: "GOLD"
            },
            {
                address: "TPnsQ24CqjY5ZkQ9Qy1i6jhwNLbxDcct2w",
                fullName: "rGAS",
                symbol: "rGAS",
                tradingViewSymbol: "NATURALGAS"
            }
        ]
    }

    getSynthBalance(synthAddress: string): Amount | undefined {
        const selfAddress = useSelfTronAddress();
        const balance: BigNumber | undefined = useTronContractCall(
            synthAddress,
            SyntABI,
            "balanceOf",
            [selfAddress?.base58]
        )

        console.log(synthAddress, balance);

        if (balance !== undefined) {
            return new Amount(balance, 18)
        }
        return undefined;
    }

    stakeRawCallback(
        amountToStake: Amount,
        expireAt: Date,
        tx_state_changes_callback: (state: TXState) => void
    ): Function {
        const insuranceContractAddress: string | undefined = useTronContractCall(
            SynergyTRONAddress,
            SynergyABI,
            "insurance"
        )

        const timeDelta = expireAt.getTime() - Date.now();

        const cb = useTronContractWrite(
            insuranceContractAddress,
            InsuranceABI,
            "stakeRaw",
            () => tx_state_changes_callback(TXState.AwaitWalletConfirmation),
            () => tx_state_changes_callback(TXState.Success),
            [Math.round(timeDelta / 1000), amountToStake.amount]
        );
        useTronEvents(
            SynergyTRONAddress,
            SynergyABI,
            "Staked",
            (err: any, event: any) => {
                console.log(err, event);
            }
        );
        return cb;

    }

    async unstakeCallback(
        insuranceId: string,
        tx_state_changes_callback: (state: TXState) => void,
    ): Promise<any> {
        const extension = getExtension();
        tx_state_changes_callback(TXState.AwaitWalletConfirmation)
        const synerdyContract = await extension?.contract(SynergyABI).at(SynergyTRONAddress);
        const insuranceContractAddress = await synerdyContract.insurance().call();
        const insuranceContract = await extension?.contract(InsuranceABI).at(insuranceContractAddress);
        await insuranceContract.unstakeRaw(
            insuranceId
        ).send({
            feeLimit: 100_000_000,
            callValue: 0,
            shouldPollResponse: false
        })
        tx_state_changes_callback(TXState.Success)
    }

    unlockWethCallback(
      amount: Amount,
      tx_state_changes_callback: (state: TXState) => void,
    ): Function {
        const cb = useTronContractWrite(
            SynergyTRONAddress,
            SynergyABI,
            "withdraw",
            () => tx_state_changes_callback(TXState.AwaitWalletConfirmation),
            () => tx_state_changes_callback(TXState.Success),
            [amount.amount]
        );
        useTronEvents(
            SynergyTRONAddress,
            SynergyABI,
            "Withdrawed",
            (err: any, event: any) => {
                console.log(err, event);
            }
        );
        return cb;
    }
}

export default TronNetwork;
