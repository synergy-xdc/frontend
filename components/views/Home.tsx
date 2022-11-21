import type { NextComponentType } from "next";

import { Placeholder } from 'rsuite';
import YoutubeEmbed from "../Youtube";

const HomeView: NextComponentType = () => {
    return (
        <YoutubeEmbed embedId="TZZEZcyzYpk" />
    );
}


export default HomeView;
