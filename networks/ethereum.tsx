import BaseNetwork, { WalletPrimaryData } from "@/networks/base";
import { ConnectButton, useAccount, useBalance, Web3Modal } from "@web3modal/react";
import { ReactNode } from "react";


const walletConnectConfig = {
    projectId: "12647116f49027a9b16f4c0598eb6d74",
    theme: "dark",
    accentColor: "default",
    ethereum: {
        appName: 'web3Modal',
        autoConnect: true
    }
};

class EthereumNetwork extends BaseNetwork {
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
    }
}

export default EthereumNetwork;
