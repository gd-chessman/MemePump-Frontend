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

export const getPrivate = async (password: string)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/private-keys", {password})
        console.log("API Response:", temp.data); // Log full API response
        if (!temp.data.data) {
            throw new Error("No data received from API");
        }
        return temp.data.data;
    } catch (error: any) {
        console.error("Error in getPrivate:", error.response?.data || error.message);
        // Throw the error instead of returning empty object
        throw error.response?.data || error;
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

export const createTokenPumpFun = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/create-token-pumpfun", item, { headers : {'Content-Type': 'multipart/form-data',}})
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const createTokenMemePump = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/create-token-memepump", item, { headers : {'Content-Type': 'multipart/form-data',}})
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
        const temp = await axiosClient.get(`/solana-tokens/token-categories`) 
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

export const setPassword = async (password: string)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/set-password", {password})
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const sendVerificationCode = async ()=>{
    try {
        const temp = await axiosClient.get("/telegram-wallets/send-code-reset-password")
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const addGoogleAuthenticator = async (password: string)=>{
    try {
        const body = password ? { password } : {};
        const temp = await axiosClient.post("/telegram-wallets/add-gg-auth", body)
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}   

export const verifyGoogleAuthenticator = async (token: string)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/verify-gg-auth", {token})
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const removeGoogleAuthenticator = async (password: string)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/remove-gg-auth", {password})
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}