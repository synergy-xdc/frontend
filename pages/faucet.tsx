import Navigation from '@/components/Navigation';
import FaucetView from '@/components/views/Faucet'

export default function Faucet() {
    return (
        <Navigation active="faucet">
            <div style={{padding: 20}}>
                <FaucetView />
            </div>
        </Navigation>
    );
}
