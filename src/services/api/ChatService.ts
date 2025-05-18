import axiosClient from "@/utils/axiosClient";


export const getChatAllHistories = async (lang: string)=>{
    try {
        const temp = await axiosClient.get(`/chats/all-histories?lang=${lang}`)
        const data = temp.data.data;
        let last_read = temp.data.last_read;
        if (last_read == null) {
            last_read = new Date().toISOString();
        }
        data.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return { data, last_read };
    } catch (error) {
        console.log(error)
        return { data: [], last_read: null };
    }
}

export const sendAllMessage = async (content: string, lang: string) => {
    try {
        const temp = await axiosClient.post("/chats/send-message/all", { content, lang })
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const sendTokenMessage = async (content: string, tokenAddress: string, lang: string) => {
    try {
        const temp = await axiosClient.post(`/chats/send-message/token/${tokenAddress}`, { content, lang })
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const getTokenHistories = async (tokenAddress: string, lang: string) => {
    try {
        const temp = await axiosClient.get(`/chats/token-histories/${tokenAddress}?lang=${lang}`)
        const data = temp.data.data;
        let last_read = temp.data.last_read;
        if (last_read == null) {
            last_read = new Date().toISOString();
        }
        data.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return { data, last_read };
    } catch (error) {
        console.log(error)
        return { data: [], last_read: null };
    }
}

export const sendGroupMessage = async (content: string, groupId: string, lang: string) => {
    try {
        const temp = await axiosClient.post(`/chats/send-message/group/${groupId}`, { content, lang })
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const getGroupHistories = async (groupId: string, lang: string) => {
    try {
        const temp = await axiosClient.get(`/chats/group-histories/${groupId}?lang=${lang}`)
        const data = temp.data.data;
        let last_read = temp.data.last_read;
        if (last_read == null) {
            last_read = new Date().toISOString();
        }
        data.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return { data, last_read };
    } catch (error) {
        console.log(error)
        return { data: [], last_read: null };
    }
}


export const readAllMessage = async () => {
    try {
        const temp = await axiosClient.post(`/chats/read-all`)
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const readTokenMessage = async (tokenAddress: string) => {
    try {
        const temp = await axiosClient.post(`/chats/read-token/${tokenAddress}`)
        return temp.data.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

