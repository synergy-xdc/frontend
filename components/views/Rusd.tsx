import type { NextComponentType } from "next";

import { Placeholder } from 'rsuite';

const RusdView: NextComponentType = () => {
    return (
        <Placeholder.Paragraph style={{ marginTop: 30 }} rows={5} graph="image" active />
    );
}


export default RusdView;
