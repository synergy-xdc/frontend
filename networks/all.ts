import React, { Context } from "react";
import BaseNetwork from "./base";
import EthereumNetwork from "./ethereum";

interface AvailableNetworks {
    [key: string]: BaseNetwork;
}

const AVAILABLE_NETWORKS: AvailableNetworks = {
    "ethereum": new EthereumNetwork(),
}

export const NetworkContext: Context<BaseNetwork> = React.createContext(AVAILABLE_NETWORKS["ethereum"]);

export default AVAILABLE_NETWORKS;
