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

import { ReactNode } from "react";
import { Button } from "rsuite";

// import { TronWeb } from "tronweb"

declare global {
  interface Window {
    tronWeb?: any;
  }
}

class TronNetwork extends BaseNetwork {
  getRusdBalance(): number {
    throw new Error("Method not implemented.");
  }
  getAvailableSynths(): Synth[] {
    throw new Error("Method not implemented.");
  }
  getRusdAddress(): string {
    throw new Error("Method not implemented.");
  }

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
    var { account } = useAccount();

    const { data, error, isLoading, refetch } = useBalance({
      addressOrName: account.address,
    });

    account.isConnected = false;

    const tron_address = window.localStorage.getItem("tron_address");
    //   const { balance, success } = await this.getTrxBalance();

    const tronWeb = window.tronWeb;
    // const balance = await tronWeb.trx.getBalance(tron_address);
    // console.log("Balance", balance);

    if (!tron_address) {
      return null;
    }

    // if (data === undefined) {
    //   return null;
    // }

    const wallet: WalletPrimaryData = {
      address: tron_address,
      network_currency_symbol: "ETH",
      network_currency_amount: "10",
    };

    return wallet;
  }

  //   getTrxBalance = async (address: string, isDappTronWeb = false) => {
  //     try {
  //       const tronWeb = window.tronWeb;
  //       const balance = await tronWeb.trx.getBalance(address);
  //       return {
  //         balance: BigNumber(balance),
  //         success: true,
  //       };
  //     } catch (err) {
  //       console.log(`getPairBalance: ${err}`, address);
  //       return {
  //         balance: BigNumber(0),
  //         success: false,
  //       };
  //     }
  //   };
}

export default TronNetwork;
