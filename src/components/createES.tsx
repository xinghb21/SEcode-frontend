import { useState } from "react";
import { Modal, Input } from 'antd';

interface User{
    id:number;
    username:string;
    password:string;
    entity:string;
  }

interface DialogProps{
    isOpen: boolean;
    onClose: () => void;
    onCreateUser: (user: User) => void;
  }

const CreateES=(props: DialogProps) =>{
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [entity, setEntity] = useState("");

  const handleCreateUser = () => {
    const user: User = {
      id: Date.now(),
      username,
      password,
      entity,
    };
    props.onCreateUser(user);
    setUsername("");
    setPassword("");
    setEntity("");
  };

  return (
    <Modal  title="Basic Modal" open={props.isOpen} onOk={handleCreateUser} onCancel={props.onClose} >
      <div>
        <label>用户名:</label>
        <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>密码:</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label>所属业务实体:</label>
        <Input type="entity" value={entity} onChange={(e) => setEntity(e.target.value)} />
      </div>
    </Modal>
  );
}
export default CreateES;
