import BaseNetwork, { Amount, Synth, TXState, WalletPrimaryData } from "@/networks/base";

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
            <Button  onClick={this.getTronweb} style={{backgroundColor: "linear-gradient(transparent, #089a81)"}} appearance='primary'>Connect Wallet</Button>
        );
    }

    getTronweb() {
        console.log("connect wallet operation")
        var obj = setInterval(async () => {
            if (window.tronWeb) {
                console.log("TronLink extension is installed")
            } 

            if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
                clearInterval(obj)
                console.log("Yes, catch it:" ,window.tronWeb.defaultAddress.base58)
            }
        }, 10)
    }

    showWallet(): WalletPrimaryData | null | any {

        // const { account } = useAccount();
        // const { data, error, isLoading, refetch } = useBalance({
        //     addressOrName: account.address
        // })

        const account: any = { "isConnected": false }
        const data: any = {}

        if (account.isConnected == false) {
            return null;
        }
        // if (data === undefined) {
        //     return null;
        // }

        const wallet: WalletPrimaryData = {
            address: account.address,
            network_currency_symbol: "ETH",
            network_currency_amount: data.formatted
        };
        return wallet
    }
}

export default TronNetwork;
