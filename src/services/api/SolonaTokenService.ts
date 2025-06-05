import axiosClient from "@/utils/axiosClient";

export const getTokenInforByAddress = async (address: any) => {
  try {
    const temp = await axiosClient.get(`/solana-tokens/address/${address}`);
    return temp.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getSearchTokenInfor = async (keyS: any, page = 1, limit = 30) => {
  if (!keyS) {
    return [];
  }
  try {
    const temp = await axiosClient.get(
      `/solana-tokens/search?query=${keyS}&page=${page}&limit=${limit}`
    );
    return temp.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getTokenPrice = async (address: any) => {
  try {
    const temp = await axiosClient.get(
      `/solana-tokens/token-price?address=${address}`
    );
    return temp.data.data;
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const getPriceSolona = async () => {
  try {
    const temp = await axiosClient.get(
      `/solana-tokens/token-price?address=So11111111111111111111111111111111111111112`
    );
    return temp.data.data;
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const getMyWishlist = async () => {
  try {
    const temp = await axiosClient.get("/solana-tokens/get-my-wishlist");
    return temp.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const toggleWishlist = async (item: any) => {
  try {
    const temp = await axiosClient.post("/solana-tokens/toggle-wishlist", item);
    return temp.data.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getTokenByCategory = async (category: any) => {
  try {
    const temp = await axiosClient.get(`/solana-tokens/list-token-on?category=${category}`);
    return temp.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};


export const getListTokenOnByCategory = async (category: any) => {
  try {
    const temp = await axiosClient.get(`/solana-tokens/list-token-on?category=${category}`);
    return temp.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};
