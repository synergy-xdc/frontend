import type { NextComponentType } from "next";

import { Placeholder } from 'rsuite';
import YoutubeEmbed from "../Youtube";

const HomeView: NextComponentType = () => {
    return (
        <YoutubeEmbed embedId="r2hlTCYfyY8" />
    );
}


export default HomeView;
