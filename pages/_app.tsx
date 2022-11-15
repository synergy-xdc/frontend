import { AppProps } from "next/app";
import { CustomProvider } from "rsuite";

import * as wagmi from "wagmi";

import "@/styles/theme.less";
import "@/styles/globals.css";
import "@/styles/Trading.css";
import { modalConnectors, walletConnectProvider, EthereumClient } from "@web3modal/ethereum";
import React from "react";
import { EthereumClientContext } from "@/networks/implementations/eth/network";





function MyApp({ Component, pageProps }: AppProps) {

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
