import type { ColumnsType } from "antd/es/table";
import React, { useState } from "react";
import Entitylist from "./entitylist";
interface Entity {
    key: React.Key;
    id: number;
    name: string;
    admin: string;
}

const Page_0 = () => {


    return (
        <>
            <Entitylist></Entitylist>
        </>
    );
};

export default Page_0;
