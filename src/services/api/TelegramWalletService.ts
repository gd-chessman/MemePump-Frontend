import axiosClient from "@/utils/axiosClient";

export const login = async (item: any) => {
    try {
        const temp = await axiosClient.post(`/telegram-wallets/connect-wallets`, item,);
        return temp.data;
    } catch (e) {
        console.log(e)
        throw new Error("Error Login")
    }
}

export const getInforWallet = async ()=>{
    try {
        const temp = await axiosClient.get("/telegram-wallets/info")
        return temp.data.data;
    } catch (error: any) {
        console.log(error)
        return error;
    }
}

export const getPrivate = async ()=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/private-keys")
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const getWalletBalanceByAddress = async (address: any)=>{
    try {   
        const temp = await axiosClient.get(`/telegram-wallets/get-wallet-balance?wallet_address=${address}`)
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}


export const getMyWallets = async ()=>{
    try {
        const temp = await axiosClient.get("/telegram-wallets/get-my-wallets")
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const getListBuyToken = async ()=>{
    try {
        const temp = await axiosClient.get("/telegram-wallets/get-list-buy-tokens")
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const addWallet = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/add-wallet", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const useWallet = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/use-wallet", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const changeName = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/update-wallet", item)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const deleteWallet = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/delete-wallet", item)
        return temp.data.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const createToken = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/create-token", item, { headers : {'Content-Type': 'multipart/form-data',}})
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const getMyTokens = async ()=>{
    try {
        const temp = await axiosClient.get("/telegram-wallets/get-my-tokens")
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const getTokenCategorys = async ()=>{
    try {   
        const temp = await axiosClient.get(`/telegram-wallets/token-categories`) 
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return [];
    }
}

export const getWalletInfoByPrivateKey = async (privateKey: string) => {
    try {
        const temp = await axiosClient.get(`/telegram-wallets/get-info/${privateKey}`)
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}
