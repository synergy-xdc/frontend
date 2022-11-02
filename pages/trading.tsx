import Navigation from "@/components/Navigation";
import TradingView from "@/components/views/Trading";

export default function Trading() {
    return (
        <Navigation active="trading" >
            <div style={{paddingTop: 25, paddingRight: 25}}>
                <TradingView />
            </div>
        </Navigation>
    );
}
