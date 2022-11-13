
import BaseNetwork, { ContractUserInsurance, FrontendUserInsurance, Synth, WalletPrimaryData } from "@/networks/base/network";
import Amount from "@/networks/base/amount";
import TXState from "@/networks/base/txstate";

import { ReactNode, useEffect, useState } from "react";
import { BigNumber, Bytes, utils } from "ethers";
import React from "react";
import { Button } from "rsuite";
import {
    triggerSmartContract,
    sign,
    sendRawTransaction,
    // MAX_UINT256,
} from "@/networks/utils/tron-utils";
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
import WethABI from "@/abi/WETH.json";
import InsuranceABI from "@/abi/Insurance.json";

import type { TronWeb } from "tronweb-typings";
import { isUndefined } from "util";

const AbiCoder = utils.AbiCoder;
const ADDRESS_PREFIX = "41";

// // const foo = new TronWeb();
// declare global {
//   interface Window {
//     tronWeb?: (TronWeb & typeof TronWeb) | undefined;
//   }
// }

// const SynergyAddress: string = "0x2f6F4493bb82f00Ed346De9353EF22cA277b7680";
const SynergyTRONAddress: string = "TVmQ81jx8v5jT4u6qKkGdajnBKZTA7UJUg";

const AvailableSynth: Synth[] = [
    {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        full_name: "Gold",
        symbol: "GOLD",
        trading_view_symbol: "GOLD",
    },
    {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        full_name: "Silver",
        symbol: "SILVER",
        trading_view_symbol: "SILVER",
    },
];

class TronNetwork extends BaseNetwork {
    connectButton(): ReactNode {
        return (
        <Button
            style={{ backgroundColor: "linear-gradient(transparent, #089a81)" }}
            appearance="primary"
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

  async decodeParams(types: any, output: any, ignoreMethodHash: any) {
    if (!output || typeof output === "boolean") {
      ignoreMethodHash = output;
      output = types;
    }

    if (ignoreMethodHash && output.replace(/^0x/, "").length % 64 === 8)
      output = "0x" + output.replace(/^0x/, "").substring(8);

    const abiCoder = new AbiCoder();

    if (output.replace(/^0x/, "").length % 64)
      throw new Error(
        "The encoded string is not valid. Its length must be a multiple of 64."
      );
    return abiCoder.decode(types, output).reduce((obj, arg, index) => {
      if (types[index] == "address")
        arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
      obj.push(arg);
      return obj;
    }, []);
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

  getAvailableSynths(): Synth[] {
    return AvailableSynth;
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
    const [amount, setAmount] = useState();

    useEffect(() => {
      const getAmount = async () => {
        const HexSynergyTRONAddress =
          window.tronWeb.address.toHex(SynergyTRONAddress);
        const HexUserAddress = window.tronWeb.address.toHex(
          window.tronWeb.defaultAddress.base58
        );
        const synergyMinCollateralRatioCall =
          await window.tronWeb.transactionBuilder.triggerConstantContract(
            HexSynergyTRONAddress,
            "minCollateralRatio()",
            {},
            [],
            HexUserAddress
          );

        const synergyMinCollateralRatio =
          synergyMinCollateralRatioCall["constant_result"][0];

        const synergyMinCollateralRatioDecoded = await this.decodeParams(
          ["uint32"],
          "0x" + synergyMinCollateralRatio,
          false
        );

        const amount: any =
          (synergyMinCollateralRatioDecoded[0] / 10 ** 8) * 100;
        setAmount(amount);
      };

      getAmount();
    }, []);

    return amount;
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
        console.log(newCratio)

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
        tx_state_changes_callback: (state: TXState) => void
    ): void {
        const cb = useTronContractWrite(
            SynergyTRONAddress,
            SynergyABI,
            "burn",
            () => tx_state_changes_callback(TXState.AwaitWalletConfirmation),
            () => tx_state_changes_callback(TXState.Success),
            [amountToBurn.amount]
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

  getStakeCallback(amount: Amount, date: Date) {
    const today: Date = new Date();

    let lockTime = BigNumber.from(Math.round((date - today) / 1000));

    const stake = async () => {
      const HexInsuranceTRONAddress =
        window.tronWeb.address.toHex(InsuranceTRONAddress);
      const HexUserAddress = window.tronWeb.address.toHex(
        window.tronWeb.defaultAddress.base58
      );
      const stakeCall = await triggerSmartContract(
        HexInsuranceTRONAddress,
        "stakeRaw(uint256,uint256)",
        {},
        [
          {
            type: "uint256",
            value: lockTime,
          },
          {
            type: "uint256",
            value: amount.amount,
          },
        ]
      );
      const signedTransaction = await sign(stakeCall);
      const result = await sendRawTransaction(signedTransaction);
    };

    stake();
  }

  getUserInssurances(): FrontendUserInsurance[] {
    const selfAddress = useSelfTronAddress();

    const [userInsurances, setUserInsurances] = React.useState<FrontendUserInsurance[]>([]);

    const insuranceAddress: string | undefined = useTronContractCall(
        SynergyTRONAddress,
        SynergyABI,
        "insurance"
    );

    const insuranceId: string | undefined = useTronContractCall(
        insuranceAddress,
        InsuranceABI,
        "userInsurances",
        [selfAddress?.base58, userInsurances.length]
    );

    const insurance: ContractUserInsurance = useTronContractCall(
        insuranceAddress,
        InsuranceABI,
        "insurances",
        [insuranceId]
    );

    if (insurance !== undefined) {
        userInsurances.push({
          id: insuranceId,
          rawLocked: new Amount(insurance.stakedRaw, 18).toHumanString(4),
          lockedAt: new Date(insurance.startTime.toNumber() * 1000).toString(),
          availableAt: new Date(insurance.startTime.add(insurance.lockTime) * 1000).toString(),
          rawRepaid: new Amount(insurance.repaidRaw, 18).toHumanString(18),
        });
    }

    return userInsurances;
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

export default TronNetwork;
