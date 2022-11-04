import { NetworkContext } from "@/networks/all";
import type { NextComponentType } from "next";
import React from "react";

import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { Button, ButtonGroup, Input, FlexboxGrid, Form, InputGroup, InputNumber, Panel, Progress, SelectPicker, Whisper, Table } from 'rsuite';


const Pairs = ['GOLD', 'SILVER'].map(
  item => ({ label: item, value: item })
);

const Synths = ['GOLD', 'SILVER', 'rUSD'].map(
  item => ({ label: item, value: item })
);

const ActivePositionsPlaceholder = [
    {
        name: "GOLD",
        kind: <span style={{color: "#089a81"}}>Long</span>,
        amount_rusd: "$1223.34",
        amount: "0.2322",
        current_price: <span style={{color: "#089a81"}}>$2545.44 (+0.12%)</span>,
    },
    {
        name: "SILVER",
        kind: <span style={{color: "#f33645"}}>Short</span>,
        amount_rusd: "$232.32",
        amount: "0.34234",
        current_price: <span style={{color: "#089a81"}}>$1545.44 (-1.54%)</span>,
    }
]

const TradeThePair: NextComponentType = () => {

    const [positionRusdValue, setPositionRusdValue] = React.useState<number>(10);
    const networkProvider = React.useContext(NetworkContext);

    const rusdBalance = networkProvider.getRusdBalance();

    return (
        <Panel bordered shaded header="Trade the Synth">
            <div style={{textAlign: "left"}}>
                <Form.Group controlId="_">
                    <Form.ControlLabel>Invest rUSD amount</Form.ControlLabel>
                    <InputGroup style={{marginTop: 5, marginBottom: 5}}>
                        <InputGroup.Button onClick={() => setPositionRusdValue(positionRusdValue + 10)} >-</InputGroup.Button>
                        <InputNumber
                            className='no-arrows-input-number'
                            value={positionRusdValue}
                            onChange={
                                (val) => setPositionRusdValue(parseInt(val)) // @ts-ignore
                            }
                        />
                        <InputGroup.Button onClick={() => setPositionRusdValue(positionRusdValue + 10)}>+</InputGroup.Button>
                    </InputGroup>

                    <Form.HelpText>Balance: {rusdBalance?.toHumanString(4)}</Form.HelpText>
                </Form.Group>
                    <ButtonGroup style={{ marginTop: 12 }} justified>
                        <Button style={{borderColor: "#82363a", backgroundColor: "#f33645", color: "#FFF" }} appearance='primary' color="red"><b>Short</b></Button>
                        <Button style={{borderColor: "#1d5f5e", backgroundColor: "#089a81", color: "#FFF"}} appearance='primary' color="green" ><b>Long</b></Button>
                    </ButtonGroup>
            </div>
        </Panel>
    );
}

const SwapSynthes: NextComponentType = () => {

    const [fromSynth, setFromSynth] = React.useState<string>("GOLD");
    const [toSynth, setToSynth] = React.useState<string>("rUSD");

    return (
        <Panel bordered shaded header="Swap Synthes">
            <Form.Group controlId="_">
                {/* <Form.ControlLabel>From Synth</Form.ControlLabel> */}
                <InputGroup style={{marginBottom: 5}}>
                    <InputNumber placeholder="From"/>
                    <InputGroup.Button className="selector-in-input">
                        <SelectPicker
                            size="sm"
                            label="Synth"
                            data={Synths}
                            // style={{ width: 300, minWidth: 250, }}
                            onChange={(val) => setFromSynth(parseInt(val))}
                            cleanable={false}
                            defaultValue={fromSynth}
                        />
                    </InputGroup.Button>
                </InputGroup>
                <Form.HelpText>Balance: 223.2343</Form.HelpText>
            </Form.Group>
            <br />
            <Form.Group controlId="_">
                <InputGroup style={{marginBottom: 5}}>
                    <InputNumber placeholder="To"/>
                    <InputGroup.Button className="selector-in-input">
                        <SelectPicker
                            size="sm"
                            label="Synth"
                            data={Synths}
                            // style={{ width: 300, minWidth: 250, }}
                            onChange={(val) => setToSynth(parseInt(val))}
                            cleanable={false}
                            defaultValue={toSynth}
                        />
                    </InputGroup.Button>
                </InputGroup>
                <Form.HelpText>Balance: 2342.32</Form.HelpText>
            </Form.Group>

            <br />
            <Button color="yellow" appearance="ghost" block style={{marginBottom: 7, borderWidth: 2}}><b>Swap</b></Button>
            <Form.HelpText>Price: 2323.33 ({toSynth} in {fromSynth})</Form.HelpText>
        </Panel>
    );
}


const ActiveOrdersTable: NextComponentType = () => {
    return (
        <Table rowHeight={60} autoHeight style={{borderRadius: 10, }} cellBordered virtualized data={ActivePositionsPlaceholder}>
            <Table.Column verticalAlign="middle" width={170} align="left" fixed flexGrow={1}>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.Cell dataKey="name" />
            </Table.Column>

            <Table.Column verticalAlign="middle" width={100} flexGrow={1}>
                <Table.HeaderCell>Kind</Table.HeaderCell>
                <Table.Cell dataKey="kind" />
            </Table.Column>


            <Table.Column verticalAlign="middle" width={200} flexGrow={1}>
                <Table.HeaderCell>Current Price</Table.HeaderCell>
                <Table.Cell dataKey="current_price" />
            </Table.Column>

            <Table.Column verticalAlign="middle" width={150} flexGrow={1} >
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.Cell dataKey="amount" />
            </Table.Column>

            <Table.Column verticalAlign="middle" width={150} flexGrow={1} >
                <Table.HeaderCell>Amount rUSD</Table.HeaderCell>
                <Table.Cell dataKey="amount_rusd" />
            </Table.Column>

            <Table.Column verticalAlign="middle" width={150} flexGrow={1} >
                <Table.HeaderCell>#</Table.HeaderCell>
                <Table.Cell dataKey="amount_rusd"><Button style={{borderWidth: 2}} color="red" appearance="ghost" block>Sell</Button></Table.Cell>
            </Table.Column>
        </Table>
    );
}

const TradingView: NextComponentType = () => {

    const [tradingSymbol, setTradingSymbol] = React.useState<string>("GOLD");

    return (
        <>
            <FlexboxGrid justify="space-between">
                <FlexboxGrid.Item colspan={18}>
                    <FlexboxGrid style={{flexDirection: "column", alignItems: "center"}} justify="space-between">
                        <FlexboxGrid.Item colspan={23}>
                            <FlexboxGrid >
                                <FlexboxGrid.Item colspan={8}>
                                    <SelectPicker
                                        size="lg"
                                        label="Synth"
                                        data={Pairs}
                                        style={{ width: 300, minWidth: 250, }}
                                        onChange={setTradingSymbol}
                                        cleanable={false}
                                        defaultValue={tradingSymbol}
                                    />
                                </FlexboxGrid.Item>
                                <FlexboxGrid.Item colspan={16} >
                                    <FlexboxGrid style={{paddingTop: 5, paddingLeft: 25}} justify="space-between">
                                        <FlexboxGrid.Item style={{paddingTop: 4}} colspan={1}>
                                            <h5>Skew:</h5>
                                        </FlexboxGrid.Item>
                                        <FlexboxGrid.Item colspan={21}>
                                            <Progress.Line percent={30} strokeColor="#1d5f5e" trailColor="#82363a" />
                                        </FlexboxGrid.Item>
                                    </FlexboxGrid>
                                </FlexboxGrid.Item>
                            </FlexboxGrid>
                        </FlexboxGrid.Item>

                        <br/>
                        <FlexboxGrid.Item colspan={23}>
                            <AdvancedRealTimeChart
                                height={780}
                                width="auto"
                                theme="dark"
                                symbol={tradingSymbol}
                                allow_symbol_change={false}
                                container_id={"tradingview_aaab4"}
                                // toolbar_bg="#282c34"
                            ></AdvancedRealTimeChart>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>
                </FlexboxGrid.Item>

                <FlexboxGrid.Item colspan={6}>
                    <TradeThePair />
                    <br />
                    <SwapSynthes />
                    <br />
                <Panel bordered shaded header="Investment Portfolio">
                    <InputGroup>
                        <InputGroup.Addon>
                            Total $
                        </InputGroup.Addon>
                        <Input readOnly value="1823.32" />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>
                            Found Synth
                        </InputGroup.Addon>
                        <Input readOnly value="2" />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>
                            C-ratio
                        </InputGroup.Addon>
                        <Input readOnly value="214%" />
                    </InputGroup>
                    <Form.HelpText style={{marginTop: 5}}>Min allowed: 150%</Form.HelpText>
                </Panel>
                </FlexboxGrid.Item>

            </FlexboxGrid>
            <Panel style={{ marginLeft: 23 }} shaded bordered header="Your synth">
                <ActiveOrdersTable />
                <br />
            </Panel>
            <br />
        </>
    );
}


export default TradingView;
