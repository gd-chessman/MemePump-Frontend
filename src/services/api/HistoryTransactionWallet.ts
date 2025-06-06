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

export const createTransaction = async ({type, amount, wallet_address_to, google_auth_token}: {type: string, amount: number, wallet_address_to: string, google_auth_token?: string}) => {
    try {
        const requestBody = {
            type,
            amount,
            wallet_address_to,
            ...(google_auth_token && { google_auth_token })
        };
        const response = await axiosClient.post(`/deposit-withdraw`, requestBody);
        return response.data;
    } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
}