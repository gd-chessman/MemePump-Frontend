import axiosClient from "@/utils/axiosClient";


export const getCopyTrades = async ()=>{
    try {
        const temp = await axiosClient.get("/copy-trade")
        return temp.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const getCopyTradeById = async (id: any)=>{
    try {
        const temp = await axiosClient.get(`/copy-trade/${id}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}


export const createCopyTrade = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/copy-trade", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const updateCopyTrade = async (item: any)=>{
    try {
        const temp = await axiosClient.put("/copy-trade", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const changeStatusCopyTrade = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/copy-trade/change-status", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const getDetailCopyTrade = async (code: any)=>{
    try {
        const temp = await axiosClient.get(`/copy-trade/details/${code}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}