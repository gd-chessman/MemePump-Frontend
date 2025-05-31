import axiosClient from "@/utils/axiosClient";



// export const getTopCoins = async (item: any) => {
//   try {
//     const temp = await axiosClient.get(`/on-chain/top-coins?sort_by=${item.sort_by}&sort_type=${item.sort_type}&offset=${item.offset}&limit=${item.limit}`);
//     return temp.data.data.items;
//   } catch (error) {
//     console.log(error);
//     return [];
//   }
// };

  export const getTopCoins = async (item: any) => {
    try {
      const temp = await axiosClient.get(`/on-chain/top-coins`);
      return temp.data.data.items;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  export const getNewCoins = async (item: any) => {
    try {
      const temp = await axiosClient.get(`/on-chain/latest-coins`);
      return temp.data.data.items;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

export const getOrderHistories = async (item: any) => {
  try {
    const temp = await axiosClient.get(`/on-chain/histories?address=${item.address}&offset=${item.offset}&limit=${item.limit}`);
    return temp.data.data.items;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getOrderHistoriesByOwner = async (item: any) => {
  try {
    const temp = await axiosClient.get(`/on-chain/histories?address=${item.address}&offset=${item.offset}&limit=${item.limit}&sort_by=${item.sort_by}&sort_type=${item.sort_type}&tx_type=${item.tx_type}&owner=${item.owner}`);
    return temp.data.data.items;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getChartData = async (address: string, timeframe: string, timeFrom: number, timeTo: number) => {
  try {
    const temp = await axiosClient.get(`/on-chain/chart/${address}?timeframe=${timeframe}&time_from=${timeFrom}&time_to=${timeTo}`);
    return temp.data.data;
  } catch (error) {
    console.log(error);
    return [];  
  }
}

export const getOrderMyHistories = async (address: string, walletAddress: string) => {
  try {
    const temp = await axiosClient.get(`/on-chain/my-histories/${address}?walletAddress=${walletAddress}`);
    return temp.data.data.items;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export const getOrdersMyWallet = async (walletAddress: string, page: number = 1) => {
  try {
    console.log("API Request URL:", `/on-chain/wallet/${walletAddress}/trades?limit=50&page=${page}`);
    const temp = await axiosClient.get(`/on-chain/wallet/${walletAddress}/trades?limit=50&page=${page}`);
    console.log("API Response:", temp.data);
    return temp.data;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

export const getSearchTokenInfor = async (query: string) => {
  try {
    console.log("Calling API with query:", query);
    const temp = await axiosClient.get(`/on-chain/search?query=${query}`);
    return temp.data.data;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

export const getStatsToken = async (address: any) => {
  try {
    const temp = await axiosClient.get(`/on-chain/stats-token/${address}`);
    return temp.data.data;
  } catch (error) {
    console.log(error);
    return {};
  }
};