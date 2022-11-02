import BaseNetwork, { WalletPrimaryData } from "@/networks/base";
import { ReactNode } from "react";
import { Button } from "rsuite";

class WavesEnterpriseNetwork extends BaseNetwork {
    connectButton(): ReactNode {
        return (
            <Button style={{backgroundColor: "linear-gradient(transparent, #089a81)"}} appearance='primary'>Connect Wallet</Button>
        );
    }
    showWallet(): WalletPrimaryData | null {
        throw new Error("Method not implemented.");
    }
}

export default WavesEnterpriseNetwork;
