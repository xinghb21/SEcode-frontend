import React, { useState } from "react";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import AssetStat from "./assetStat";
import AssetWarn from "./assetWarn";
import AssetHistory from "./assetHistory";


const items: MenuProps["items"] = [
    {
        label: "资产统计",
        key: 0,
    },
    {
        label: "资产告警",
        key: 1,
    },
    {
        label: "资产历史",
        key: 2,
    },
];

const PageList: any[] = [
    <div key={0}><AssetStat/></div>, <div key={1}><AssetWarn/></div>, <div key={2}><AssetHistory /></div>,
];

const App: React.FC = () => {

    const [current, setCurrent] = useState("0");
    const [page, setPage] = useState(0);

    const onClick: MenuProps["onClick"] = (e) => {
        setCurrent(e.key);
        setPage(Number(e.key));
    };

    return( 
        <>
            <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
            <div style={{ paddingLeft: 10, paddingRight: 24, paddingTop: 15, paddingBottom: 5, minHeight: 600}}>
                {PageList[page]}
            </div>
        </>
    );
};

export default App;