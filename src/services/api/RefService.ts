import axiosClient from "@/utils/axiosClient";


export const getListMembers = async ()=>{
    try {
        const temp = await axiosClient.get("/referent/get-list-members")
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}

export const getRewards = async ()=>{
    try {
        const temp = await axiosClient.get("/referent/rewards")
        return temp.data;
    } catch (error) {
        console.log(error)
        return {};
    }
}