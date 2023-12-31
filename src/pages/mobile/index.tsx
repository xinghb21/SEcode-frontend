import { ProDescriptions } from "@ant-design/pro-components";
import { useEffect, useState } from "react";
import React from "react";
import { useRouter } from "next/router";
import { request } from "../../utils/network";
import { Spin, message } from "antd";

type AssetDisplayType = {
    //table数据的格式
    key: React.Key;//资产的编号
    id: number;//资产的id
    parent?: string;//父资产的名称
    category: string;//资产的类型
    name: string;//资产的名称
    description: string;//资产描述
    create_time: number;//创建时间
    price: number;//资产原始价值
    life: number;//资产使用年限
    belonging: string;//挂账人
    number_idle?: number;//闲置数量
    number?: number;//总数数量
    new_price?: number;//资产现价值
}


const DisplayModel = () => {

    const router = useRouter();
    const query = router.query;
    const [loading, setLoading] = useState<boolean>(true);//是否加载中
    const [assetDisplay, setassetDisplay] = useState<AssetDisplayType>();

    useEffect(() => {
        if(router.isReady === false) return;
        request("/api/asset/fulldetail/" + query.id, "GET")
            .then((res) => {
                setassetDisplay(res.data);
                setLoading(false);
            })
            .catch((err) => {
                message.error(err.message);
            });
    }, [router, query]);

    return (
        loading ? <Spin tip="Loading..."></Spin> :
            <ProDescriptions<AssetDisplayType>
                column={2}
                title="资产详情"
                dataSource={assetDisplay}
                bordered
                columns={[
                    {
                        title: "资产编号",
                        dataIndex: "id",
                        key: "id",
                        valueType: "text",
                        editable: false,
                    },
                    {
                        title: "资产名称",
                        dataIndex: "name",
                        key: "name",
                        valueType: "text",
                        editable: false,
                    },
                    {
                        title: "父资产",
                        dataIndex: "parent",
                        key: "parent",
                        valueType: "text",
                        editable: false,
                    },
                    {
                        title: "挂账人",
                        dataIndex: "belonging",
                        key: "belonging",
                        valueType: "text",
                        editable: false,
                    },
                    {
                        title: "资产使用年限",
                        dataIndex: "life",
                        key: "life",
                        valueType: "digit",
                        editable: false,
                    },
                    {
                        title: "资产类型",
                        dataIndex: "category",
                        key: "category",
                        valueType: "text",
                        editable: false,
                    },
                    {
                        title: "资产总数",
                        dataIndex: "number",
                        key: "number",
                        valueType: "digit",
                        editable: false,
                    },
                    {
                        title: "可用资产数量",
                        dataIndex: "number_idle",
                        key: "number_idle",
                        valueType: "digit",
                        editable: false,
                    },
                    {
                        title: "资产描述",
                        dataIndex: "description",
                        key: "description",
                        valueType: "text",
                        editable: false,
                    },
                    {
                        title: "创建时间",
                        dataIndex: "create_time",
                        key: "create_time",
                        valueType: "dateTime",
                        editable: false,
                    },
                    {
                        title: "资产原始价值",
                        dataIndex: "price",
                        key: "price",
                        valueType: "money",
                        editable: false,
                    },
                    {
                        title: "资产现价值",
                        dataIndex: "new_price",
                        key: "new_price",
                        valueType: "money",
                        editable: false,
                    },
                ]}
            />
    );
};
export default DisplayModel;