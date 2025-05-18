import axiosClient from "@/utils/axiosClient";

export const getTradeAmount = async (code: any)=>{
    try {
        const temp = await axiosClient.get(`/trade/amount/${code}`)
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const getOrders = async (address: any)=>{
    try {
        const temp = await axiosClient.get(`/trade/orders?token=${address}`,)
        return temp.data.data.orders;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const getOrderBook = async ()=>{
    try {
        const temp = await axiosClient.get("/trade/order-book")
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const getTokenAmount = async (item: any)=>{
    try {
        const temp = await axiosClient.get(`/trade/amount/${item}`)
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const createTrading = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/trade/orders", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}