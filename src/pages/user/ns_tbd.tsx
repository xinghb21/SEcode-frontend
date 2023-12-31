import React, { useEffect, useState } from "react";
import { Drawer, Space, Button, Table, Tag, message, Modal, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { request } from "../../utils/network";
import { MessageTwoTone} from "@ant-design/icons";

import { Badge, Tooltip } from "antd";

type Asset = {
    key: React.Key;
    assetname: string;
    number: number;
}

type Message = {
    key: React.Key;
    id: number;
    message: string;
    type: number;
    status: number;
    read: boolean;
    info: Asset[];
}

const Assetcolumns: ColumnsType<Asset> = [
    {
        title: "资产名称",
        dataIndex: "assetname",
    },
    {
        title: "资产数量",
        dataIndex: "number",
    }
];

type assetType = {
    assetname: string;
    label: string;
}

const NSTbdDrawer = () => {

    const [messages, setMessage] = useState<Message[]>([]);
    const [open, setOpen] = useState(false);
    const [assetdisdata, setassetdisData] = useState<Message>();
    const [labels, setLabels] = useState<string[]>([]);
    const [isTBD, setTBD] = useState(false);//true即有待办任务，false相反
    const [dopen, setDOpen] = useState(false);
    const [assetTypes, setAssetTypes] = useState<assetType[]>([]);
    const [loading, setLoading] = useState(false);

    const showDrawer = () => {
        setDOpen(true);
    };

    const onClose = () => {
        setTBD(checkTBD());
        setDOpen(false);
    };
    
    useEffect((() => {
        request("/api/user/ns/getmessage", "GET")
            .then((res) => {
                let data: Message[] = res.info;
                if(data.length != 0){
                    data.forEach((item) => {
                        item.key = item.id; 
                        if(item.info != null){
                            item.info.forEach((item) => {
                                item.key = item.assetname;
                                return item;
                            });
                        }
                        return item;
                    });
                }
                setMessage(data);
                request("/api/asset/assetclass", "GET").then((res) => {
                    let label_data: string[] = res.data;
                    setLabels(label_data);
                }).catch((err) => {
                    message.warning(err.message);
                });
            })
            .catch((err) => {
                message.warning(err.message);
            });
        fetchtbd();
    }), []);
    
    const column: ColumnsType<Asset> = [
        {
            title: "资产名称",
            dataIndex: "assetname",
        },
        {
            title: "资产数量",
            dataIndex: "number",
        },
        {
            title: "指定类别",
            dataIndex: "operation",
            render: (_, record) => {
                return (
                    <Space>
                        <Select style={{ width: 120 }} placeholder="请选择"
                            options={labels.map((item) => {return {label: item, value: item};})}
                            onChange={(value) => {
                                let data = assetTypes;
                                if(data.filter((item) => item.assetname === record.assetname).length > 0)
                                    data.filter((item) => item.assetname === record.assetname)[0].label = value;
                                else
                                    data.push({assetname: record.assetname, label: value});
                                setAssetTypes(data);
                            }}
                        />
                    </Space>
                );
            },
        },
    ];

    const showModal = () => {
        setOpen(true);
    };

    const fetchtbd=()=>{
        request("/api/user/ns/hasmessage", "GET").then((res) => {
            setTBD(res.info);
        }).catch((err) => {
            message.warning(err.message);
        });
    };

    const handleCancel = () => {
        if(assetdisdata?.type != 5) {
            request("/api/user/ns/read", "POST", {
                id: assetdisdata?.id,
            }).catch((err) => {
                message.warning(err.message);
            });
            //将message中的对应数据的已读状态置为true,并将该条数据放在message数组的最后
            let data = messages;
            data.filter((item) => item.id === assetdisdata?.id)[0].read = true;
            setMessage(data);
            setOpen(false);
            return true;
        }
        if(assetdisdata?.type === 5){
            if(assetdisdata?.info != null){
                assetdisdata?.info.forEach((item) => {
                    if(assetTypes.filter((item1) => item1.assetname === item.assetname).length === 0) {
                        message.warning("请为所有资产指定类别");
                        return false;
                    }
                });
            }
        }
        assetdisdata.info.forEach((item) => {
            if(assetTypes.filter((item1) => item1.assetname === item.assetname).length === 0) {
                return false;
            }
            let label = assetTypes.filter((item1) => item1.assetname === item.assetname)[0].label;
            request("/api/user/ns/setcat", "POST", {
                assetname: item.assetname,
                label: label,
            }).then((res) => {
                message.success("操作成功");
                request("/api/user/ns/read", "POST", {
                    id: assetdisdata?.id,
                }).catch((err) => {
                    message.warning(err.message);
                });
                setOpen(false);
                let data = messages;
                data.filter((item) => item.id === assetdisdata?.id)[0].read = true;
                //只保留assetTypes中在info中的数据
                let data1 = assetTypes.filter((item1) => {
                    let flag = false;
                    assetdisdata?.info.forEach((item2) => {
                        if(item1.assetname === item2.assetname)
                            flag = true;
                    });
                    return flag;
                });
                setAssetTypes(data1);
                setMessage(data);
            }).catch((err) => {
                message.warning(err.message);
            });
        });
    };

    const checkTBD = () => {
        //对message进行遍历，如果有未读消息则返回true
        let flag = false;
        messages.forEach((item) => {
            if(item.read === false)
                flag = true;
        });
        return flag;
    };

    const columns: ColumnsType<Message> = [
        {
            title: "消息编号",
            dataIndex: "id",
            //显示操作编号的同时使用Tag显示消息是否已读
            render: (text, record) => {
                if(record.read === false){
                    return (
                        <>
                            <Tag color="red">未读</Tag>
                            {text}
                        </>                     
                    );
                } else {
                    return (
                        <> 
                            <Tag color="green">已读</Tag>
                            {text}
                        </>
                    );
                }
            },
        },
        {
            title: "操作类型",
            dataIndex: "type",
            render: (text) => {
                if (text === 1) {
                    return (<Tag color="blue">
                        资产领用
                    </Tag>
                    );
                }
                else if (text === 2) {
                    return (<Tag color="green">
                        资产转移
                    </Tag>
                    );
                }
                else if (text === 3) {
                    return (<Tag color="yellow">
                        资产维保
                    </Tag>
                    );
                }
                else if (text === 4){
                    return (
                        <Tag color="volcano">
                            资产退库
                        </Tag>
                    );
                } else if(text === 5){
                    return (
                        <Tag color="purple">
                            待确认资产
                        </Tag>
                    );
                } else{
                    return (
                        <Tag color="orange">
                            维保结束
                        </Tag>
                    );
                }
            },
        },
        {
            title: "审批结果",
            dataIndex: "status",
            render: (text) => {
                return (
                    text == 2 ? <Tag color="red">未通过</Tag> : <Tag color="green">通过</Tag>
                );
            },
        },
        {
            title: "操作",
            render: (record) => {
                return (
                    <Space>
                        <Button type="primary" onClick={() => {
                            setassetdisData(messages.filter((item) => item.id === record.id)[0]);
                            showModal();
                        }}> 查看</Button> 
                        <Button loading={loading} type="default" danger onClick={() => {
                            setLoading(true);
                            request(`/api/user/ns/deletemsg?id=${record.id}`, "DELETE", {
                            }).then((res) => {
                                message.success("删除成功");
                                setLoading(false);
                                setMessage(messages.filter((item) => item.id !== record.id));
                            }).catch((err) => {
                                message.warning(err.message);
                            });
                        }}>删除</Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <>
            <Tooltip placement="bottomLeft" title={<span>通知消息</span>}>
                <Button type="text" size="large" style={{ marginTop:5,marginBottom:5 }} onClick={showDrawer}>
                    <Badge dot style={{ visibility: (!isTBD) ? "hidden" : "visible" }}>
                        <MessageTwoTone twoToneColor={(!isTBD) ? "#a8a8a8" : "#f82212"} style={{ fontSize: "25px" }} />
                    </Badge>
                </Button>
            </Tooltip>
            <Drawer
                title="消息列表"
                width={"60%"}
                onClose={onClose}
                open={dopen}
            >
                <Table columns={columns} dataSource={messages} />
                <Modal
                    open={open}
                    title="详细信息"
                    closable={true}
                    onCancel={() => setOpen(false)}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            确认
                        </Button>,
                    ]}
                >   
                    <p>消息编号：{assetdisdata?.id}</p>
                    <p>操作类型：{assetdisdata?.type === 1 ? "资产领用" : assetdisdata?.type === 2 ? "资产转移" : assetdisdata?.type === 3 ? "资产维保" : assetdisdata?.type === 4 ? "资产退库" : "待确认资产"}</p>
                    <p>审批结果：{assetdisdata?.status === 2 ? "未通过" : "通过"}</p>
                    <p>审批意见：{assetdisdata?.message}</p>
                    {
                        assetdisdata?.type === 5 ? <Table columns={column} dataSource={assetdisdata?.info} /> : <Table columns={Assetcolumns} dataSource={assetdisdata?.info} />
                    }
                </Modal>
            </Drawer>
        </>
    );
};
export default NSTbdDrawer;
