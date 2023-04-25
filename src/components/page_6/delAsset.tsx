import { Button, Descriptions, message, Modal } from "antd";
import React from "react";
import { ProFormDateRangePicker, ProFormDigitRange, ProList } from "@ant-design/pro-components";
import { useState } from "react";
import { useEffect } from "react";
import { request } from "../../utils/network";
import {
    ProForm,
    ProFormSelect,
    ProFormText,
    QueryFilter,
} from "@ant-design/pro-components";
import DisplayModel from "./displayModel";

interface Asset {

    key: React.Key;
    name: string;
    person?: string;
    department?: string;
    parent?: string;
    child?: string;
    assetclass: string;
    description?: string;
    number?: Number;
    addtion?: Object;
    status?: Number;
    type?: boolean;

}

type customfeature = {
    //自定义属性的格式
    name: string;//名称
    content: string;//具体内容
}

type AssetDisplayType = {
    //table数据的格式
    key: React.Key;//资产的编号
    name: string;//资产的名称
    username: string[];//使用者的名字
    assetclass: string;//资产的类型
    assetcount: number[];//资产数量
    description: string;//资产描述
    type: boolean;
    custom: customfeature[];//自定义属性
    date: string;//创建时间
    oriprice: number;//资产原始价值
}

const ddata: AssetDisplayType = { key: 0, name: "", username: [], assetclass: "", assetcount: [], description: "", type: true, custom: [], date: "", oriprice: 0 };

const DelAsset = (() => {

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [customfeatureList, setcustomFeature] = useState<string[]>();
    const [chosenname, setCname] = useState<string>();
    const [assetclasslist, setac] = useState<string[]>([]);
    const [displaydata, setDisplay] = useState<AssetDisplayType>(ddata);

    useEffect(() => {
        //获取当下部门所有的资产
        request("/api/asset/get", "GET")
            .then((res) => {
                setAssets(res.data);
            })
            .catch((err) => {
                message.warning(err.message);
            });
        //获取部门下的自定义属性
        request("/api/asset/attributes", "GET")
            .then((res) => {
                setcustomFeature(res.info);
            }).catch((err) => {
                message.warning(err.message);
            });
        //获取部门下的资产类别
        request("/api/asset/assetclass", "GET")
            .then((res) => {
                setac(res.data);
            }).catch((err) => {
                message.warning(err.message);
            });
    }, []);

    const showModal = () => {
        setIsDetailOpen(true);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    };

    const handleCancel = () => {
        setIsDetailOpen(false);
    };

    //给后端发请求删除对应的asset
    const delete_asset = (() => {

        const newAssets = assets.filter(item => !selectedRowKeys.includes(item.key));

        const selectedNames = selectedRowKeys.map(key => {
            const item = assets.find(data => data.key === key);
            return item ? item.name : "";
        });

        request("/api/asset/delete", "DELETE", selectedNames)
            .then(() => {
                setAssets(newAssets);
                message.success("删除成功");
                setSelectedRowKeys([]);
            })
            .catch((err) => {
                message.warning(err.message);
            });
    });

    const hasSelected = selectedRowKeys.length > 0;

    return (
        <>
            <div
                style={{
                    margin: 20,
                }}
            >
                <QueryFilter
                    labelWidth="auto"
                    onFinish={async (values) => {
                        //发送查询请求，注意undefined的情况
                        request("/api/user/ep/queryasset", "POST",
                            {
                                parent: (values.parent != undefined) ? values.parent : "",
                                assetclass: (values.assetclass != undefined) ? values.assetclass : "",
                                name: (values.name != undefined) ? values.name : "",
                                belonging: (values.belonging != undefined) ? values.belonging : "",
                                from: (values.date != undefined) ? Date.parse(values.date[0]) / 1000 : 0,
                                to: (values.date != undefined) ? Date.parse(values.date[1]) / 1000 : 0,
                                user: (values.user != undefined) ? values.user : "",
                                status: (values.status != undefined) ? values.status : -1,
                                pricefrom: (values.price != undefined) ? values.price[0] : 0,
                                priceto: (values.price != undefined) ? values.price[1] : 0,
                                custom: (values.cusfeature != undefined) ? values.cusfeature : "",
                                content: (values.cuscontent != undefined) ? values.cuscontent : "",
                            })
                            .then((res) => {
                                setAssets(res.data);
                                message.success("查询成功");
                            }).catch((err) => {
                                message.warning(err.message);
                            });
                    }
                    }
                >
                    <ProForm.Group>
                        <ProFormText
                            width="md"
                            name="name"
                            label="资产名称"
                            placeholder="请输入名称"
                        />
                        <ProFormSelect
                            options={[
                                {
                                    value: 0,
                                    label: "全部闲置",
                                },
                                {
                                    value: 1,
                                    label: "被全部占用",
                                },
                                {
                                    value: 2,
                                    label: "全部维保中",
                                },
                                {
                                    value: 3,
                                    label: "需要清退",
                                },
                                {
                                    value: 4,
                                    label: "被部分占用",
                                },
                                {
                                    value: 5,
                                    label: "部分维保中",
                                },
                            ]}
                            width="xs"
                            name="status"
                            label="资产状态"
                        />
                        <ProFormDateRangePicker
                            width="md"
                            name="date"
                            label="资产创建时间"
                        />
                        <ProFormText
                            width="md"
                            name="parent"
                            label="上级资产名称"
                            initialValue={""}
                        />
                        <ProFormSelect
                            options={assetclasslist}
                            width="md"
                            name="assetclass"
                            label="资产类别"
                        />

                        <ProFormText
                            width="md"
                            name="belonging"
                            label="资产挂账人"
                        />
                        <ProFormText
                            width="md"
                            name="user"
                            label="当前使用者"
                        />
                        <ProFormDigitRange
                            width="xs"
                            name="price"
                            label="资产价值区间"
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <div>
                            <ProFormSelect
                                options={customfeatureList}
                                width="xs"
                                name="cusfeature"
                                label="自定义属性"
                            />
                            <ProFormText
                                width="md"
                                name="cuscontent"
                                placeholder="请输入属性详细"
                            />
                        </div>
                    </ProForm.Group>
                </QueryFilter>
            </div>
            <ProList<Asset>

                pagination={{ pageSize: 10 }}
                metas={{
                    title: { dataIndex: "name" },
                    description: {
                        render: (_, row) => {
                            return (
                                <div>
                                    {row.description == "" ? "暂无描述" : row.description}
                                </div>
                            );
                        }
                    },
                    avatar: {},
                    extra: {},
                    actions: {
                        render: (_, row) => {
                            return (
                                <Button type="link" onClick={() => {
                                    // setCname(row.name);
                                    // request("/api/asset/getdetail", "GET", {
                                    //     id: chosenname
                                    // }).then((res) => {
                                    // });
                                    // showModal();
                                    // setIsDetailOpen(true);
                                }}>
                                    查看详情
                                </Button>
                            );
                        },
                    },
                }}
                rowKey="key"
                headerTitle="资产列表"
                rowSelection={rowSelection}
                dataSource={assets}
                toolBarRender={() => {
                    return [
                        <Button key="2" type="default" danger={true} onClick={delete_asset} disabled={!hasSelected}>
                            删除选中资产
                        </Button>
                    ];
                }}
            />
            <DisplayModel isOpen={isDetailOpen} onClose={() => { setIsDetailOpen(false); }} content={displaydata} />
        </>
    );
}
);

export default DelAsset;