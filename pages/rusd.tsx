import Navigation from '@/components/Navigation';
import HomeView from '@/components/views/Home';
import RusdView from '@/components/views/Rusd';

export default function Rusd() {
    return (
        <Navigation active="rusd">
            <div style={{padding: 20}}>
                <RusdView />
            </div>
        </Navigation>
    );
}
