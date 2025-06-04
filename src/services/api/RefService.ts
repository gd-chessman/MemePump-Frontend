import axiosClient from "@/utils/axiosClient";


export const createTokenMemePump = async (item: any)=>{
    try {
        const temp = await axiosClient.post("/telegram-wallets/create-token-memepump", item, { headers : {'Content-Type': 'multipart/form-data',}})
        return temp.data;
    } catch (error) {
        console.log(error)
        throw error;
    }
}
