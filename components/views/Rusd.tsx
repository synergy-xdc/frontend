import type { NextComponentType } from "next";
import React from "react";

import { InputGroup, Panel, Input, Form, FlexboxGrid, InputNumber, Button, ButtonGroup } from 'rsuite';


const UserRetableView_: NextComponentType = ({purpose, unit, value, ...props}) => {
    return (
        <Panel bordered shaded header={purpose} style={{marginBottom: 20}}>
            <InputGroup>
                <Input readOnly value={value} />
                <InputGroup.Addon>{unit}</InputGroup.Addon>
            </InputGroup>
        </Panel>
    );
}


const UserRelatebleView: NextComponentType = () => {
    return (
        <Panel bordered shaded header="Address relatable">
            <InputGroup>
                <InputGroup.Addon>Balance (RAW)</InputGroup.Addon>
                <Input readOnly value="34532.34" />
            </InputGroup>
            <Form.HelpText style={{marginTop: 5}}>&nbsp;~ 345.34$</Form.HelpText>
            <br/>
            <InputGroup>
                <InputGroup.Addon>Balance (rUSD)</InputGroup.Addon>
                <Input readOnly value="233.56" />
            </InputGroup>
            <br/>
            <InputGroup>
                <InputGroup.Addon>C-Ratio</InputGroup.Addon>
                <Input readOnly value="355%" />
            </InputGroup>
            <Form.HelpText style={{marginTop: 5}}>&nbsp;Min allowed: 150%</Form.HelpText>
            <br/>
            <InputGroup>
                <InputGroup.Addon>Active debt (rUSD)</InputGroup.Addon>
                <Input readOnly value="344.23" />
            </InputGroup>
            <br/>
            <InputGroup>
                <InputGroup.Addon>Compensation (rUSD)</InputGroup.Addon>
                <Input readOnly value="11.32" />
            </InputGroup>
            <br/>
            <InputGroup>
                <InputGroup.Addon>Staked (RAW)</InputGroup.Addon>
                <Input readOnly value="23423.43" />
            </InputGroup>
            <Form.HelpText style={{marginTop: 5}}>&nbsp;~ 3455.34$</Form.HelpText>
        </Panel>
    );
}

const Staking: NextComponentType = () => {

    const [rawValue, setRawValue] = React.useState<number>(100);

    return (
        <Panel bordered shaded header="Staking">
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vitae lorem hendrerit, molestie purus nec, auctor nibh. Ut viverra mollis varius. Donec mollis tincidunt suscipit. Vestibulum in orci at nulla dignissim facilisis. Sed ex augue, cursus vitae odio nec, venenatis sollicitudin metus. Nullam sollicitudin vestibulum ultrices. Praesent diam mauris, pellentesque at ex id, lacinia luctus nisl. Nunc ex nisi, finibus nec tincidunt vitae, viverra nec mauris. Sed porttitor eget tortor id tristique. Integer tortor turpis, ultricies eget nunc et, varius lobortis mi. Mauris quis libero nec est laoreet dignissim ac id ex.
            </p>
            <hr />
            <Form.Group controlId="_">
                <Form.ControlLabel>RAW amount</Form.ControlLabel>
                <InputGroup style={{marginTop: 5, marginBottom: 5}}>
                    <InputGroup.Button onClick={() => setRawValue(rawValue + 10)} >-</InputGroup.Button>
                    <InputNumber
                        className='no-arrows-input-number'
                        value={rawValue}
                        onChange={
                            (val) => setRawValue(parseInt(val)) // @ts-ignore
                        }
                    />
                    <InputGroup.Button onClick={() => setRawValue(rawValue + 10)}>+</InputGroup.Button>
                </InputGroup>
                {/* <Form.HelpText>Balance: 2343.56</Form.HelpText> */}
            </Form.Group>
            <br />
            <ButtonGroup justified>
                <Button style={{borderColor: "#089a81", color: "#089a81", borderWidth: 2}} appearance='ghost' color="green"><b>Stake</b></Button>
                <Button style={{borderColor: "#f33645", color: "#f33645", borderWidth: 2}} appearance='ghost' color="red"><b>Unstake</b></Button>
            </ButtonGroup>
        </Panel>
    );
}

const Mint: NextComponentType = () => {
    const [rawValue, setRawValue] = React.useState<number>(100);

    return (
        <Panel bordered shaded header="Mint rUSD">
            <p>
                In molestie sem est, vitae blandit justo vestibulum in. Quisque lacinia quam et erat pellentesque iaculis. Cras fermentum sagittis nisl, vel dignissim arcu accumsan ut. Ut ipsum nulla, convallis at arcu ut, aliquam lobortis mauris. Nunc tristique lacinia tortor, ac volutpat tortor. Proin ullamcorper posuere blandit. Nam ut lobortis massa. Aliquam a vestibulum mi, in tincidunt ex. Phasellus viverra, tellus ac ullamcorper eleifend, est enim condimentum felis, sit amet bibendum purus nisl eget sapien.
            </p>
            <hr />
            <Form.Group controlId="_">
                <Form.ControlLabel>RAW amount</Form.ControlLabel>
                <InputGroup style={{marginTop: 5, marginBottom: 5}}>
                    <InputGroup.Button onClick={() => setRawValue(rawValue + 10)} >-</InputGroup.Button>
                    <InputNumber
                        className='no-arrows-input-number'
                        value={rawValue}
                        onChange={
                            (val) => setRawValue(parseInt(val)) // @ts-ignore
                        }
                    />
                    <InputGroup.Button onClick={() => setRawValue(rawValue + 10)}>+</InputGroup.Button>
                </InputGroup>
                <Form.HelpText>Recieve rUSD amount: 2343.56</Form.HelpText>
            </Form.Group>
            <br />
            <Button appearance="ghost" block style={{marginBottom: 7, borderWidth: 2}}><b>Mint</b></Button>
        </Panel>
    );
}

const Burn: NextComponentType = () => {
    const [rusdValue, setRusdValue] = React.useState<number>(100);

    return (
        <Panel bordered shaded header="Burn rUSD">
            <p>
                In molestie sem est, vitae blandit justo vestibulum in. Quisque lacinia quam et erat pellentesque iaculis. Cras fermentum sagittis nisl, vel dignissim arcu accumsan ut. Ut ipsum nulla, convallis at arcu ut, aliquam lobortis mauris. Nunc tristique lacinia tortor, ac volutpat tortor. Proin ullamcorper posuere blandit. Nam ut lobortis massa. Aliquam a vestibulum mi, in tincidunt ex. Phasellus viverra, tellus ac ullamcorper eleifend, est enim condimentum felis, sit amet bibendum purus nisl eget sapien.
            </p>
            <hr />
            <Form.Group controlId="_">
                <Form.ControlLabel>rUSD amount</Form.ControlLabel>
                <InputGroup style={{marginTop: 5, marginBottom: 5}}>
                    <InputGroup.Button onClick={() => setRusdValue(rusdValue + 10)} >-</InputGroup.Button>
                    <InputNumber
                        className='no-arrows-input-number'
                        value={rusdValue}
                        onChange={
                            (val) => setRusdValue(parseInt(val)) // @ts-ignore
                        }
                    />
                    <InputGroup.Button onClick={() => setRusdValue(rusdValue + 10)}>+</InputGroup.Button>
                </InputGroup>
                <Form.HelpText>Recieve RAW amount: 1232.33</Form.HelpText>
            </Form.Group>
            <br />
            <Button color="yellow" appearance="ghost" block style={{marginBottom: 7, borderWidth: 2}}><b>Burn</b></Button>
        </Panel>
    );
}

const RusdView: NextComponentType = () => {
    return (
        <>
            <FlexboxGrid justify="space-around">
                <FlexboxGrid.Item colspan={11}>
                    <UserRelatebleView />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={11}>
                    <Staking />
                </FlexboxGrid.Item>
            </FlexboxGrid>
            <br/>
            <FlexboxGrid justify="space-around">
                <FlexboxGrid.Item  colspan={11}>
                    <Mint />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item  colspan={11}>
                    <Burn />
                </FlexboxGrid.Item>
            </FlexboxGrid>
        </>
    );
}


export default RusdView;
