import Head from 'next/head'
import Image from 'next/image'
import Navigation from '@/components/Navigation';
import HomeView from '@/components/views/Home';

export default function Home() {
    return (
        <Navigation active="home">
            <HomeView />
        </Navigation>
    );
}
