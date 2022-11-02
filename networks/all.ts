import BaseNetwork from "./base";
import EthereumNetwork from "./ethereum";
import WavesEnterpriseNetwork from "./wavesenterprise";


interface AvailableNetworks {
    [key: string]: BaseNetwork;
}

const AVAILABLE_NETWORKS: AvailableNetworks = {
    "ethereum": new EthereumNetwork(),
    "waves-enterprise": new WavesEnterpriseNetwork()
}

export default AVAILABLE_NETWORKS;
