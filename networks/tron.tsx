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

import { ReactNode, useState, useEffect } from "react";
import { Button } from "rsuite";

// import { TronWeb } from "tronweb"

declare global {
  interface Window {
    tronWeb?: any;
    defaultAccount?: any;
  }
}

const SynergyAddress: string = "TQkDaoJsFuYpj8ZZvhaWdSrPTWUNc2ByQ1";

class TronNetwork extends BaseNetwork {
  connectButton(): ReactNode {
    return (
      <Button
        onClick={this.getTronweb}
        style={{ backgroundColor: "linear-gradient(transparent, #089a81)" }}
        appearance="primary"
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
    console.log("I`m im TRON");
    var { account } = useAccount();

    const tron_address = window.localStorage.getItem("tron_address");

    const { data, error, isLoading, refetch } = useBalance({
      addressOrName: account.address,
    });

    // var account: any = {};

    account.isConnected = false;

    const tronWeb = window.tronWeb;

    const [ballance, setBallance] = useState();
    console.log(ballance);

    var obj = setInterval(async () => {
      if (
        window.tronWeb &&
        window.tronWeb.defaultAddress.base58 &&
        window.tronWeb.ready
      ) {
        let defaultAccount = tronWeb.defaultAddress.base58;
        window.defaultAccount = defaultAccount;

        window.tronWeb.trx.getBalance(defaultAccount).then((data: any) => {
          setBallance(data);
          console.log("Balance", ballance);
          console.log("Balance", data);
        });
        clearInterval(obj);
      }
    }, 10);

    //   const { balance, success } = await this.getTrxBalance();

    // const balance = await tronWeb.trx.getBalance(tron_address);
    // console.log("Balance", balance);

    if (!tron_address) {
      return null;
    }

    // if (data === undefined) {
    //   return null;
    // }

    console.log(ballance);

    const wallet: WalletPrimaryData = {
      address: tron_address,
      network_currency_symbol: "TRX",
      network_currency_amount: ballance,
    };

    return wallet;
  }

  getRusdBalance(): Amount | undefined {
    console.log("getRusdBalance");

    const tronweb = window.tronWeb;
    tronweb.transactionBuilder
      .triggerSmartContract(SynergyAddress, "raw()")
      .then((data: any) => {
        console.log("getRusdBalance");
        console.log(data);
      });

    return undefined;

    // if (!transaction.result || !transaction.result.result) {
    //   throw new Error(
    //     "Unknown trigger error: " + JSON.stringify(transaction.transaction)
    //   );
    // }
    // return transaction;

    // const { account, isReady } = useAccount();
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
    // return undefined;
  }
}

export default TronNetwork;
