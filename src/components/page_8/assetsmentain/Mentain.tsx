import React, { useState } from "react";
import { useEffect } from "react";
import { Button, Input, Space, Tag, message, Spin } from "antd";
import { request } from "../../../utils/network";
import { ProColumns, ProList, ProTable } from "@ant-design/pro-components";
import Applysubmit from "./Applysubmit";
import Applydetail from "./Applydetail";
import { Typography } from "antd";
import Buttonwithloading from "../Buttonwithloading";

const { Title } = Typography;
interface asset{
    key:React.Key;
    id:number;
    name:string;
    type:number;
    count:number;
    applycount:number;
    state:string;
}
interface applys{
    key : React.Key;
    id:number;
    reason:string;
    message:string;
    state:number;
}


const Mentainasset=()=>{
    const [useable_assetslist,setuseable_assetlist]=useState<asset[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [IsDialogOpen1,setIsDialogOpen1]=useState<boolean>(false);
    const [assetselected,setassetselected]= useState<asset[]>([]);
    const [applylist,setapplylsit]=useState<applys[]>([]);
    const [isdetalopen,setisdetailopen]=useState<boolean>(false);
    const [detailreason,setdetailreason] =useState<string>("");
    const [datailmessage,setdetailmessage] = useState<string>("");
    const [datailid,setdetailid] =useState<number>(-1);
    const [spinloading, setspinloading] = useState<boolean>(false); 
    const columns: ProColumns<asset> []= [
        {        
            title: "资产名称",
            dataIndex: "name",
        },
        {
            title:"资产编号",
            dataIndex:"id",
        },
        {
            title: "资产类别",
            dataIndex: "type",
            render: (_, row) => {
                return (
                    <Space size={0}>
                        {(row.type===1)?<Tag color="blue" key={row.name}>{"数量型"}</Tag>
                            :<Tag color="blue" key={row.name}>{"条目型"}</Tag>  
                        }
                    </Space>
                );
            },
        },
        {
            title: "资产数量",
            dataIndex: "count",
        },
        {
            title: "申请数量",
            key:"number input",
            render:(_,row)=>{
                return (
                    row.type==1?
                        <Input
                            onChange={(e)=>{handleChange(e,row.name);}}
                            placeholder="请输入一个数字"
                            maxLength={16}
                        />
                        :
                        <a>1</a>
                );
            }
        }
    ];

    useEffect((()=>{
        fetchlist();
        fetchapply();
    }),[]);
    const fetchapply=()=>{
        request("/api/user/ns/getallapply","GET")
            .then((res)=>{
                
                let tmp = res.info.filter(item => (item.type == 3));
                setapplylsit(tmp.map((val)=>{return{
                    id:val.id,
                    reason:val.reason,
                    state:val.status,
                    message:val.message
                };}));
            })
            .catch((err)=>{
                message.warning(err.message);
            });
    };
    const fetchlist=()=>{
        setspinloading(true);
        request("/api/user/ns/possess","GET")
            .then((res)=>{
                let size = res.assets.length;
                let tem :asset[]=[];
                for (let i=0;i<size;i++){
                    let state :object = res.assets[i].state;
                    let statenum="";
                    Object.entries(state).forEach(([k, v]) => {
                        if(v!==0){
                            let tempapply = 1;
                            let tempasset = useable_assetslist.filter((obj)=>{
                                return(
                                    obj.key === ( res.assets[i].name+" "+k+(v as string) )
                                );
                            });
                            if(tempasset.length !== 0){
                                tempapply = tempasset[0].applycount; 
                            }
                            tem.push({
                                key:res.assets[i].name+" "+k+(v as string),
                                id:res.assets[i].id,
                                name:res.assets[i].name,
                                type:res.assets[i].type,
                                count:v,
                                applycount:tempapply,
                                state:k,
                            });
                        }
                    });
                }
                let useable :asset[] = tem.filter(item =>(item.state==="1"));
                setuseable_assetlist(useable);
                setSelectedRowKeys([]);
                setspinloading(false);
            })
            .catch((err)=>{
                setspinloading(false);
                setSelectedRowKeys([]);
                message.warning(err.message);
            });
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    };
    const onChange = (inputvalue:string,name:string)=>{
        let index=useable_assetslist.findIndex((obj)=>{return obj.name === name;});
        if( (+inputvalue) > useable_assetslist[index].count){
            message.warning("数量超额，请重新输入");
        }
        useable_assetslist[index].applycount= + inputvalue;
        
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>,name:string) => {
        const { value: inputValue } = e.target;
        const reg = /^\d*(\d*)?$/;
        if (reg.test(inputValue)) {
            onChange(inputValue,name);
        }else{
            message.warning("数量必须是一个数字");
        }
    };
    const hasSelected = selectedRowKeys.length > 0;
    const handlesubmitsuccess=()=>{
        //在员工成功申请之后，重新刷新页面
        setSelectedRowKeys([]);
        setassetselected([]);
        fetchlist();
        fetchapply();
    };  
    const handledelete=(rowid:number)=>{
        request("/api/user/ns/deleteapplys","DELETE",{id:rowid})
            .then((res)=>{
                fetchapply();
                message.success("删除成功");
            })
            .catch((err)=>{
                message.warning(err.message);
            }
            );
    };
    //检查一遍申请的资产数量
    const checksubmit=()=>{
        let selectasset=useable_assetslist.filter((obj)=>{return selectedRowKeys.find((key)=>{return key==obj.key;}) != null; });
        let i = 0;
        if(selectasset != null){
            let size=selectasset.length;
            let ans = true;
            for(i;i<size;i++){
                if(selectasset[i].applycount<=0 || selectasset[i].applycount>selectasset[i].count){
                    ans=false;
                    break;
                }
            }
            return ans;
        }else{
            return false;
        }
    };
    const handlesubclick=()=>{
        if(checksubmit()){
            setIsDialogOpen1(true);
            setassetselected(useable_assetslist.filter((obj)=>{return selectedRowKeys.find((key)=>{return key==obj.key;}) != null; }));
        }else{
            message.warning("申请的资产数量超额或为0");
        }
    };

    return (
        <div>
            <Spin spinning={spinloading} size="large">
                <Applysubmit isOpen={IsDialogOpen1} onClose={()=>{setIsDialogOpen1(false);}} proassetlist={assetselected} onSuccess={handlesubmitsuccess} ></Applysubmit>
                <Applydetail isOpen={isdetalopen} onClose={()=>{setisdetailopen(false);}} id={datailid} reason={detailreason} message={datailmessage} > </Applydetail>
                <Title  level={3} style={{marginLeft:"2%"}} >
            资产维保
                </Title >
                <ProTable<asset>
                    bordered={true}
                    toolBarRender={() => {
                        return [
                            <Button key="1" type="primary" disabled={!hasSelected} onClick={()=>{handlesubclick();}}>
                                申请资产维保
                            </Button>,                      
                        ];
                    }}
                    pagination={{
                        pageSize: 5,
                    }}
                    columns={columns}
                    search={false}
                    options={false}
                    rowKey="key"
                    headerTitle="您拥有的资产列表"
                    rowSelection={rowSelection}
                    dataSource={useable_assetslist}
                />
                <ProList<applys>
                    style={{border:"1px solid #E6E6E6", margin:25}}
                    pagination={{
                        pageSize: 5,
                        showSizeChanger:false,
                    }}
                    metas={{
                        title: {dataIndex:"id"},
                        description: {
                            render: (_,row) => {
                                return (
                                    <div>
                                        <div>
                                            {"申请原因: "+row.reason}
                                        </div>
                                    </div>
                                );
                            },
                        },
                        subTitle: {
                            render: (_, row) => {
                                return (
                                    <Space size={0}>
                                        {(row.state===2)?<Tag color="red" key={row.id}>{"拒绝"}</Tag>
                                            :((row.state===0)?<Tag color="blue" key={row.id} >{"处理中"}</Tag>:<Tag color="green" key={row.id}>{"通过"}</Tag>)  
                                        }
                                    </Space>
                                );
                            },
                            search: false,
                        },
                        actions: {
                            render: (_,row) => {
                                return (
                                    <div>
                                        <Button onClick={()=>{setdetailid(row.id);setdetailmessage(row.message);setdetailreason(row.reason);setisdetailopen(true);}}>查看详情</Button>
                                        <Buttonwithloading disable={row.state === 0 } onhandleclick={()=>{handledelete(row.id);}} ></Buttonwithloading>
                                    </div>
                                );
                            },
                        },
                    }}
                    rowKey="key"
                    headerTitle="您的维保申请列表"
                    dataSource={applylist}
                />
            </Spin>
        </div>
    );
};

export default Mentainasset;