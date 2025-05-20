// Custom event name constant
export const MARKET_CAP_UPDATE_EVENT = 'marketCapUpdate';

// Custom event type
export interface MarketCapUpdateEvent extends CustomEvent {
  detail: {
    marketCap: number;
    tokenAddress: string;
    timestamp: number;
  }
}

// Function to dispatch market cap update event
export const dispatchMarketCapUpdate = (marketCap: number, tokenAddress: string) => {
  const event = new CustomEvent(MARKET_CAP_UPDATE_EVENT, {
    detail: {
      marketCap,
      tokenAddress,
      timestamp: Date.now()
    }
  }) as MarketCapUpdateEvent;
  
  window.dispatchEvent(event);
};

// Function to subscribe to market cap updates
export const subscribeToMarketCapUpdates = (callback: (event: MarketCapUpdateEvent) => void) => {
  const handler = (event: Event) => callback(event as MarketCapUpdateEvent);
  window.addEventListener(MARKET_CAP_UPDATE_EVENT, handler);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener(MARKET_CAP_UPDATE_EVENT, handler);
  };
}; 