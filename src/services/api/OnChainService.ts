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

export const getOrderHistories = async (item: any) => {
  try {
    const temp = await axiosClient.get(`/on-chain/histories?address=${item.address}&offset=${item.offset}&limit=${item.limit}&sort_by=${item.sort_by}&sort_type=${item.sort_type}&tx_type=${item.tx_type}`);
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
