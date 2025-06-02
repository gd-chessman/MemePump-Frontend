import axiosClient from "@/utils/axiosClient"


export const getMasters = async ()=>{
    try {
        const temp = await axiosClient.get("/master-trading/masters")
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const getMasterById = async (id: any)=>{
    try {
        const temp = await axiosClient.get(`/on-chain/pnl/${id}`)
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}
export const getMyGroups = async ()=>{
    try {
        const temp = await axiosClient.get("/master-trading/get-my-groups")
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const getMyConnects = async ()=>{
    try {
        const temp = await axiosClient.get("/master-trading/get-my-connects")
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const getGroupById = async ()=>{
    try {
        const temp = await axiosClient.get("/master-trading/group/7")
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const checkMaster = async (wallet_address: string)=>{
    try {
        const temp = await axiosClient.post("/master-trading/check-master", { wallet_address })
        return temp.data.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const connectMaster = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/master-trading/connect-master", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const memberSetConnect = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/master-trading/member-set-connect", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const masterSetConnect = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/master-trading/master-set-connect", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const masterCreateGroup = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/master-trading/master-create-group", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const masterSetGroup = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/master-trading/master-set-group", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const masterSetConnectGroup = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/master-trading/master-set-group", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const changeStatusGroup = async (id: any, status: any)=>{
    try {
        const temp = await axiosClient.post(`/master-trading/group/${id}/status`, {status})
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const masterJoinGroup = async (item: { mg_id: number })=>{
    try {
        const temp = await axiosClient.post("/master-trading/master-join-group", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const getDetailCopies = async (wallet_master: any) => {
    try {
        const temp = await axiosClient.get(`/master-trading/detail-copies?wallet_master=${wallet_master}`);
        return temp.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const changeStreamWallet = async (password: string)=>{
    try {
        const temp = await axiosClient.post("/master-trading/change-stream", {password})
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

