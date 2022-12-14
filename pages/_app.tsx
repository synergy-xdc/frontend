import { AppProps } from "next/app";
import { CustomProvider } from "rsuite";

import * as wagmi from "wagmi";

import "@/styles/theme.less";
import "@/styles/globals.css";
import "@/styles/Trading.css";
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { modalConnectors, walletConnectProvider, EthereumClient } from "@web3modal/ethereum";
import { publicProvider } from 'wagmi/providers/public';
import React from "react";
import { EthereumClientContext } from "@/networks/implementations/eth/network";


function MyApp({ Component, pageProps }: AppProps) {
    const defaultChains: wagmi.Chain[] = [
        {
            id: 51,
            name: "XDC Apothem Network",
            network: "XDC Apothem Network",
            nativeCurrency: {
                name: "TXDC",
                symbol: "TXDC",
                decimals: 18
            },
            rpcUrls: {
                default: "https://erpc.apothem.network",
                public: "https://erpc.apothem.network",
            },
            testnet: true
        }
    ];
    const { provider, webSocketProvider, chains } = wagmi.configureChains(defaultChains, [
        // walletConnectProvider({ projectId: "12647116f49027a9b16f4c0598eb6d74" }),
        publicProvider()
    ]);
    const wagmiClient = wagmi.createClient({
        autoConnect: true,
        connectors: [new MetaMaskConnector({ chains })],
        provider,
        webSocketProvider
    });

    return (
        <CustomProvider theme="dark">
            <EthereumClientContext.Provider value={new EthereumClient(wagmiClient, chains)}>
                <wagmi.WagmiConfig client={wagmiClient}>
                <Component {...pageProps} />
                </wagmi.WagmiConfig>
            </EthereumClientContext.Provider>
        </CustomProvider>
    );
  }

export default MyApp;
