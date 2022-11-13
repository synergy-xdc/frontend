import { TXState } from "@/networks/base_old";
import { Notification, useToaster, useToaster } from "rsuite";


const WalletNotification = ({type, header, content}) => (
    <Notification type={type} header={header} closable>
        {content}
    </Notification>
);

export const NotificationAwaitWalletConfirmation
    = <WalletNotification
        type="info"
        header="Confirm broadcasting"
        content="Please, confirm TX in your wallet."
    />;

export const NotificationTXBroadcasting
    = <WalletNotification
        type="info"
        header="Broadcasting TX"
        content="TX is broadcasting..."
    />;

export const NotificationTXSuccessfullyBroadcasted
    = <WalletNotification
        type="success"
        header="TX broadcasted!"
        content="Done!"
    />;



export const WalletTXSuccessfullyBroadcasted = ({...props}) => {
    return (
        <Notification type="success" header="TX boradcasted" closable>
            Please, confirm the transaction in your wallet
        </Notification>
    );
}


export const getStateHandlingCallback = (toaster: ReturnType<typeof useToaster>) => {
    return (state: TXState) => {
        switch (state) {
            case TXState.AwaitWalletConfirmation:
                toaster.push(NotificationAwaitWalletConfirmation, { placement: "topStart"})
                break
            case TXState.Broadcasting:
                toaster.push(NotificationTXBroadcasting, { placement: "topStart"})
                break
            case TXState.Success:
                toaster.push(NotificationTXSuccessfullyBroadcasted, { placement: "topStart"})
                setTimeout(() => toaster.clear(), 5*1000)
                break
        }
    }
}
