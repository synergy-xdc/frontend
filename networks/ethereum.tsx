import BaseNetwork, {
  Amount,
  Synth,
  TXState,
  WalletPrimaryData,
} from "@/networks/base";
import {
  ConnectButton,
  useAccount,
  useBalance,
  useContractRead,
  Web3Modal,
  useToken,
  useContractWrite,
  useWaitForTransaction,
  useContractEvent,
} from "@web3modal/react";
import { ReactNode, useEffect, useState } from "react";
import RawABI from "@/abi/RAW.json";
import RusdABI from "@/abi/RUSD.json";
import SynergyABI from "@/abi/Synergy.json";
import OracleABI from "@/abi/Oracle.json";
import WethABI from "@/abi/WETH.json";
import { chains } from "@web3modal/ethereum";
import { BigNumber, ethers, utils } from "ethers";
import React from "react";
import { Button } from "rsuite";
const TronWeb = require("tronweb");

const AbiCoder = ethers.utils.AbiCoder;
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = "41";

declare global {
  interface Window {
    tronWeb?: any;
  }
}

const SynergyAddress: string = "0x2f6F4493bb82f00Ed346De9353EF22cA277b7680";
const SynergyTRONAddress: string = "TQkDaoJsFuYpj8ZZvhaWdSrPTWUNc2ByQ1";

const walletConnectConfig = {
  projectId: "12647116f49027a9b16f4c0598eb6d74",
  theme: "dark",
  accentColor: "default",
  ethereum: {
    appName: "web3Modal",
    autoConnect: true,
    chains: [chains.goerli],
  },
};

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

class EthereumNetwork extends BaseNetwork {
  wethApproveState: TXState = TXState.Done;
  mintState: TXState = TXState.Done;

  showedTxs: string[] = [];

  connectButton(): ReactNode {
    return (
      <Button
        style={{ backgroundColor: "linear-gradient(transparent, #089a81)" }}
        appearance="primary"
        onClick={this.getTronweb}
      >
        Connect Wallet
      </Button>
    );
  }

  getTronweb() {
    console.log("connect wallet operation");
    var obj = setInterval(async () => {
      if (window.tronWeb && !window.tronWeb.defaultAddress.base58) {
        clearInterval(obj);
        console.log("TronLink extension is installed but user not logged it");
      }

      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        clearInterval(obj);
        const tron_address = window.tronWeb.defaultAddress.base58;

        window.localStorage.setItem("tron_address", tron_address);
        console.log(`set localStorage item tron_address: ${tron_address}`);
      }
    }, 10);
  }

  showWallet(): WalletPrimaryData | null {
    const [wallet, setWalet] = useState(null);

    useEffect(() => {
      var obj = setInterval(async () => {
        const tronWeb = window.tronWeb;

        if (tronWeb && tronWeb.defaultAddress.base58 && tronWeb.ready) {
          let defaultAccount = tronWeb.defaultAddress.base58;

          tronWeb.trx.getBalance(defaultAccount).then((data: any) => {
            const wallet: any = {
              address: defaultAccount,
              network_currency_symbol: "TRX",
              network_currency_amount: data,
            };

            setWalet(wallet);
          });

          clearInterval(obj);
        }
      }, 10);
    });
    return wallet;
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

  async decode() {
    //Must start with 0x
    let outputs =
      "0x000000000000000000000000000000000000000000000000000196ca228159aa";
    //
    //['uint256 '] is a list of return value types. If there are multiple return values, fill in the types in order
    let result = await this.decodeParams(["uint256"], outputs, false);
    return result;
  }

  getRusdBalance(): Amount | undefined {
    // const parameter1 = [
    //   { type: "address", value: "TV3nb5HYFe2xBEmyb3ETe93UGkjAhWyzrs" },
    //   { type: "uint256", value: 100 },
    // ];

    const [amount, setAmount] = useState(undefined);

    useEffect(() => {
      console.log(
        "Contract synegry address: ",
        window.tronWeb.address.toHex(SynergyTRONAddress)
      );
      window.tronWeb.transactionBuilder
        .triggerConstantContract(
          window.tronWeb.address.toHex(SynergyTRONAddress),
          "rUsd()",
          {},
          [],
          window.tronWeb.address.toHex("TR2NPXjAX82cU2soLnUCjG77WE9oMj49uk")
        )
        .then(async (data: any) => {
          const synergyCallResult = data["constant_result"][0];

          console.log("Received address from rUsd()-function", data);

          let result = await this.decodeParams(
            ["address"],
            "0x" + data["constant_result"][0],
            false
          );

          console.log("Received address from rUsd()-function", result);

          console.log(
            "To hex ",
            window.tronWeb.address.toHex("TSnPWXoB2gUVcHsnhax4CY8jeU3VSbePo6")
          );

          window.tronWeb.transactionBuilder
            .triggerConstantContract(
              result[0],
              "balanceOf(address)",
              {},
              [
                {
                  type: "address",
                  value: window.tronWeb.address.toHex(
                    "TR2NPXjAX82cU2soLnUCjG77WE9oMj49uk"
                  ),
                },
              ],
              window.tronWeb.address.toHex("TR2NPXjAX82cU2soLnUCjG77WE9oMj49uk")
            )
            .then(async (data: any) => {
              console.log("Got second result: ", data);
              let result = await this.decodeParams(
                ["uint256"],
                "0x" + data["constant_result"][0],
                false
              );

              // setAmount(result[0]);
              // console.log("Final result: ", result[0]);

              const balance: BigNumber = result[0] as BigNumber;
              console.log("Final result: ", balance);

              setAmount(balance);
              // const balance: BigNumber = rusdBalanceOfCall.data as BigNumber;
            });
        });
    });

    // const synergyCallResult = useContractRead({
    //   address: SynergyAddress,
    //   abi: SynergyABI,
    //   functionName: "rUsd",
    //   chainId: chains.goerli.id,
    // });
    // const rusdContract = useToken({
    //   address: synergyCallResult.data,
    // });
    // const rusdBalanceOfCall = useContractRead({
    //   address: synergyCallResult.data as string,
    //   abi: RusdABI,
    //   functionName: "balanceOf",
    //   args: [account.address],
    //   chainId: chains.goerli.id,
    // });
    // useContractEvent({
    //   address: synergyCallResult.data ? synergyCallResult.data : "0x0",
    //   abi: WethABI,
    //   eventName: "Transfer",
    //   listener: (...event) => {
    //     rusdBalanceOfCall.refetch().then((val) => val);
    //   },
    // });
    // if (
    //   rusdBalanceOfCall.data !== undefined &&
    //   rusdContract.data?.decimals !== undefined
    // ) {
    //   const balance: BigNumber = rusdBalanceOfCall.data as BigNumber;
    //   return new Amount(balance, rusdContract.data.decimals);
    // }
    return amount;
  }

  getRawBalance(): Amount | undefined {
    const { account, isReady } = useAccount();
    const synergyCallResult = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "raw",
      chainId: chains.goerli.id,
    });
    const rawContract = useToken({
      address: synergyCallResult.data,
    });
    const rawBalanceOfCall = useContractRead({
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
    const { account, isReady } = useAccount();
    const oracleContractAddressCall = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "oracle",
      chainId: chains.goerli.id,
    });
    const rawContractAddressCall = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "raw",
      chainId: chains.goerli.id,
    });
    const rawPriceCall = useContractRead({
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
    const { account, isReady } = useAccount();
    const oracleContractAddressCall = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "oracle",
      chainId: chains.goerli.id,
    });
    const rawContractAddressCall = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "wEth",
      chainId: chains.goerli.id,
    });
    const rawPriceCall = useContractRead({
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
    const { account, isReady } = useAccount();
    const synergyCallResult = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "wEth",
      chainId: chains.goerli.id,
    });
    const wethContract = useToken({
      address: synergyCallResult.data,
    });
    const wethBalanceOfCall = useContractRead({
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
    const { account, isReady } = useAccount();
    const synergyCallResult = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "wEth",
      chainId: chains.goerli.id,
    });
    const wethContract = useToken({
      address: synergyCallResult.data,
    });
    const wethAllowanceCall = useContractRead({
      address: synergyCallResult.data as string,
      abi: WethABI,
      functionName: "allowance",
      args: [account.address, SynergyAddress],
      chainId: chains.goerli.id,
    });
    useContractEvent({
      address: synergyCallResult.data ? synergyCallResult.data : "0x0",
      abi: WethABI,
      eventName: "Approval",
      listener: (...event) => {
        wethAllowanceCall.refetch().then((val) => val);
      },
    });
    useContractEvent({
      address: synergyCallResult.data ? synergyCallResult.data : "0x0",
      abi: WethABI,
      eventName: "Transfer",
      listener: (...event) => {
        wethAllowanceCall.refetch().then((val) => val);
      },
    });
    // useEffect(() => {
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

  getAvailableSynths(): Synth[] {
    return AvailableSynth;
  }

  getCurrentCRatio(): number | undefined {
    const { account, isReady } = useAccount();
    const synergyCollateralRatioCall = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "collateralRatio",
      args: [account.address],
      chainId: chains.goerli.id,
    });
    const wethCall = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "wEth",
      chainId: chains.goerli.id,
    });
    useContractEvent({
      address: wethCall.data ? wethCall.data : "0x0",
      abi: WethABI,
      eventName: "Approval",
      listener: (...event) => {
        synergyCollateralRatioCall.refetch().then((val) => val);
      },
    });
    useContractEvent({
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
    const synergyMinCollateralRatioCall = useContractRead({
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
    const { account } = useAccount();
    const synergyWethCall = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "wEth",
      chainId: chains.goerli.id,
    });
    const wethContract = useToken({
      address: synergyWethCall.data,
    });
    const setWethAllowanceSign = useContractWrite({
      address: synergyWethCall.data,
      abi: WethABI,
      functionName: "approve",
      args: [SynergyAddress, amount.amount],
      chainId: chains.goerli.id,
    });
    useContractEvent({
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
    const signWait = useWaitForTransaction({
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
    const { account, isReady } = useAccount();
    const predictCollateralRatioCall = useContractRead({
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
    const wethCall = useContractRead({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "wEth",
      chainId: chains.goerli.id,
    });
    useContractEvent({
      address: wethCall.data ? wethCall.data : "0x0",
      abi: WethABI,
      eventName: "Approval",
      listener: (...event) => {
        predictCollateralRatioCall.refetch().then((val) => val);
      },
    });
    useContractEvent({
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
    const { account } = useAccount();
    const mintSign = useContractWrite({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "mint",
      args: [amountToMint.amount, amountToPledge.amount],
      chainId: chains.goerli.id,
    });
    useContractEvent({
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
    const signWait = useWaitForTransaction({ hash: mintSign.data?.hash });
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

  getBurnRusdCallback(amount: Amount): Function {
    const { account } = useAccount();
    const mintSign = useContractWrite({
      address: SynergyAddress,
      abi: SynergyABI,
      functionName: "mint",
      args: [amountToMint.amount, amountToPledge.amount],
      chainId: chains.goerli.id,
    });
    useContractEvent({
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
    const signWait = useWaitForTransaction({ hash: mintSign.data?.hash });
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
