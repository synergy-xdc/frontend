import React, { Context } from "react";
import BaseNetwork from "./base";
import EthereumNetwork from "./ethereum";
import TronNetwork from "./tron";
import WavesEnterpriseNetwork from "./wavesenterprise";


interface AvailableNetworks {
    [key: string]: BaseNetwork;
}

const AVAILABLE_NETWORKS: AvailableNetworks = {
    "ethereum": new EthereumNetwork(),
    "waves-enterprise": new WavesEnterpriseNetwork(),
    "tron": new TronNetwork()
}

export const NetworkContext: Context<BaseNetwork> = React.createContext(AVAILABLE_NETWORKS["ethereum"]);

export default AVAILABLE_NETWORKS;
