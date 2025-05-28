import axiosClient from "@/utils/axiosClient";

export const getTransactionHistory = async () => {
    try {
        const response = await axiosClient.get(`/deposit-withdraw/history`);
        return response.data;
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return [];
    }
}

export const createTransaction = async ({type, amount, wallet_address_to}: {type: string, amount: number, wallet_address_to: string}) => {
    try {
        const response = await axiosClient.post(`/deposit-withdraw`, { type, amount, wallet_address_to });
        return response.data;
    } catch (error) {
        console.error("Error creating transaction:", error);
        return [];
    }
}