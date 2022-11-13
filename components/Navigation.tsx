import type { NextComponentType } from "next/types";
import CodeIcon from "@rsuite/icons/Code";
import HomeIcon from "@rsuite/icons/legacy/Home";
import DragableIcon from "@rsuite/icons/Dragable";
import TrendIcon from "@rsuite/icons/Trend";
import {
  useToaster,
  Navbar,
  Nav,
  Button,
  Modal,
  ButtonGroup,
  SelectPicker,
} from "rsuite";
import React, {
  Component,
  FC,
  ForwardedRef,
  FunctionComponent,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react";
import HomeView from "@/components/views/Home";
import TradingView from "./views/Trading";
import RusdView from "./views/Rusd";
import Link from "next/link";
import {
  Web3Modal,
  Web3Button,
  useAccount,
  ConnectButton,
  useConnectModal,
} from "@web3modal/react";
import AVAILABLE_NETWORKS, { NetworkContext } from "@/networks/all";
import Icon from "react-crypto-icons";
import { WalletPrimaryData } from "@/networks/base_old";

const homeLabel = "home";
const tradingLabel = "trading";
const rusdLabel = "rusd";

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

const ConnectedWallet: NextComponentType = () => {
  const [network, setNetwork] = React.useState<string>("tron");

  const showWallet = () => {
    const wallet = AVAILABLE_NETWORKS[network].showWallet();

    return (
      <div>
        {wallet ? (
          <Button
            color="green"
            appearance="ghost"
            style={{ borderColor: "#6474a7", color: "rgba(255, 255, 255, 0.9" }}
          >
            {wallet.network_currency_symbol}
            &nbsp;{wallet.network_currency_amount}
            &nbsp;({wallet.address.slice(0, 5)}..
            {wallet.address.slice(
              wallet.address.length - 5,
              wallet.address.length
            )}
            )
          </Button>
        ) : (
          AVAILABLE_NETWORKS[network].connectButton()
        )}
      </div>
    );
  };

  return (
    <>
      <NetworkContext.Provider value={AVAILABLE_NETWORKS[network]}>
        <SelectPicker
          size="lg"
          label="Network"
          data={Networks}
          style={{ width: 300, minWidth: 250 }}
          onChange={setNetwork}
          cleanable={false}
          defaultValue={network}
          searchable={false}
        />
        &nbsp;
        {showWallet()}
      </NetworkContext.Provider>
    </>
  );
};
const Networks = [
  {
    label: <span>TRON</span>,
    value: "tron",
  },
];

const Navigation: FC<{
  active: string;
  children: ReactNode;
}> = ({ children, active, ...props }) => {
  return (
    <>
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
        </Nav>
        <Nav pullRight>
          <Nav.Item>
            <ConnectedWallet />
          </Nav.Item>
        </Nav>
      </Navbar>
      {children}
    </>
  );
};

export default Navigation;
