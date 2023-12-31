import React, { useState } from "react";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import Applyasset from "./Applyasset";
import Returnasset from "./assetsreturn/Returnasset";
import Exchangeasset from "./exchange/Exchangeasset";
import Mentainasset from "./assetsmentain/Mentain";
import Lookup from "./assetslookup/Lookup";
const items: MenuProps["items"] = [
    {
        label: "资产查看",
        key: 0,
    },
    {
        label: "资产领用",
        key: 1,
    },
    {
        label: "资产转移",
        key: 2,
    },
    {
        label:"资产维保",
        key:3,
    },
    {
        label:"资产退库",
        key:4,
    }
];

const PageList: any[] = [
    <div key={0}><Lookup/></div>,<div key={1}> <Applyasset /></div>, <div key={2}><Exchangeasset/></div>,<div key={3}><Mentainasset/></div>,<div key={4}><Returnasset /></div>  
];

const Page_8:React.FC = () => {

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

export default Page_8;