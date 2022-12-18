import type { NextComponentType } from "next/types";
import HomeIcon from "@rsuite/icons/legacy/Home";
import DragableIcon from "@rsuite/icons/Dragable";
import ScatterIcon from '@rsuite/icons/Scatter';
import TrendIcon from "@rsuite/icons/Trend";
import {
    Navbar,
    Nav,
    Button,
    SelectPicker,
} from "rsuite";
import React, {
    FC,
    ReactNode,
    useEffect,
} from "react";
import * as wagmi from "wagmi";
import AVAILABLE_NETWORKS, { NetworkContext } from "@/networks/all";
import Link from "next/link";


const NavLink = React.forwardRef((props, ref) => {
    const { as, href, ...rest } = props;
    return (
        <Link href={href} as={as} legacyBehavior>
            <a ref={ref} {...rest} />
        </Link>
    );
});

const NavItemStyle = {
    padding: "0 15px 0 15px",
    color: "#FFF",
};

const ConnectedWallet: FC<{
    changeNetworkCallback: (_: any) => void
}> = ({ changeNetworkCallback, ...props}) => {
    const chainsSwitcher = wagmi.useSwitchNetwork();
    const currentChain = wagmi.useNetwork();
    const [network, setNetwork] = React.useState<string>(
        currentChain.chain?.id == 50 ? "mainnet" : "testnet"
    );



    const showWallet = () => {
        const wallet = AVAILABLE_NETWORKS[network].showWallet();

        const connectButtonHook = AVAILABLE_NETWORKS[network].connectButton();
        const [walletInfoText, setWalletInfoText] = React.useState<string>("");
        useEffect(() => {
            setWalletInfoText(
                `${wallet?.network_currency_symbol} ${wallet?.network_currency_amount}
                 (${wallet?.address.slice(0, 5)}..${wallet?.address.slice(
                    wallet?.address.length - 5,
                    wallet?.address.length
                )})
            `
            )
        }, [wallet])
        const connectedViewHook = (
            <Button
                color="green"
                appearance="ghost"
                style={{ borderColor: "#6474a7", color: "rgba(255, 255, 255, 0.9" }}
            >
                {walletInfoText}
            </Button>
        );

        return (
            <div>
                {wallet ? connectedViewHook : connectButtonHook}
            </div>
        );
    };
    console.log("NET", network, currentChain.chain, AVAILABLE_NETWORKS[network]);

    return (
        <>
            <SelectPicker
                size="lg"
                label="Network"
                data={Networks}
                style={{ width: 300, minWidth: 250 }}
                onChange={(val) => {
                    chainsSwitcher.switchNetwork?.(val == "testnet" ? 51 : 50);
                    changeNetworkCallback(AVAILABLE_NETWORKS[val]);
                    console.log("NETC", AVAILABLE_NETWORKS[val])
                    setNetwork(val);
                }}
                cleanable={false}
                defaultValue={network}
                searchable={false}
            />
            &nbsp;
            {showWallet()}
        </>
    );
};
const Networks = [
    {
        label: <span>XDC Apothem</span>,
        value: "testnet",
    },
    {
        label: <span>XDC Mainnet</span>,
        value: "mainnet",
    },
];

const Navigation: FC<{
    active: string;
    children: ReactNode;
}> = ({ children, active, ...props }) => {


    const currentChain = wagmi.useNetwork();
    const [currentNetworkProvider, setCurrentNetworkProvider] = React.useState(
        AVAILABLE_NETWORKS[currentChain.chain?.id == 50 ? "mainnet" : "testnet"]
    );
    console.log("NEWNET", currentChain.chain?.id);

    useEffect(() => {
        setCurrentNetworkProvider(AVAILABLE_NETWORKS[currentChain.chain?.id === 50 ? "mainnet" : "testnet"])
        console.log("NEWNET", AVAILABLE_NETWORKS[currentChain.chain?.id === 50 ? "mainnet" : "testnet"])
    }, [currentChain.chain?.id])

    return (
        <NetworkContext.Provider value={currentNetworkProvider}>
            <Navbar style={{ backgroundColor: "#21273a" }}>
                <Nav activeKey={active}>
                    <Nav.Item
                        as={NavLink}
                        href="/"
                        active={active == "home"}
                        style={NavItemStyle}
                        icon={<HomeIcon />}
                    >
                        Home
                    </Nav.Item>
                    <Nav.Item
                        as={NavLink}
                        href="/trading"
                        active={active == "trading"}
                        style={NavItemStyle}
                        icon={<TrendIcon />}
                    >
                        Trading
                    </Nav.Item>
                    <Nav.Item
                        as={NavLink}
                        href="/rusd"
                        active={active == "rusd"}
                        style={NavItemStyle}
                        icon={<DragableIcon />}
                    >
                        Mint/Burn rUSD
                    </Nav.Item>
                    <Nav.Item
                        as={NavLink}
                        href="/faucet"
                        active={active == "faucet"}
                        style={NavItemStyle}
                        icon={<ScatterIcon />}
                    >
                        Faucet
                    </Nav.Item>
                </Nav>
                <Nav pullRight>
                    <Nav.Item>
                        <ConnectedWallet changeNetworkCallback={setCurrentNetworkProvider} />
                    </Nav.Item>
                </Nav>
            </Navbar>
            {children}
        </NetworkContext.Provider>
    );
};

export default Navigation;
