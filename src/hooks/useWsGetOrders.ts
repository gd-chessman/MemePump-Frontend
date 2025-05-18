import { useEffect, useState } from "react";

export function useWsGetOrders() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [orderMessages, setOrderMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws`);

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket server - useWsGetOrders");
      ws.send(JSON.stringify({ method: "getOrders" }));
    };

    ws.onmessage = (event) => {
      setOrderMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = () => {
      console.log("❌ Disconnected from WebSocket server - useWsGetOrders");
    };

    ws.onerror = (error) => {
      console.error("⚠️ WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws.close();
    };
  }, []);

  const sendMessage = (message: object) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ WebSocket is not open. Message not sent. - useWsGetOrders");
    }
  };

  // Hàm gửi request lấy orders
  const getOrdersWs = (params: {
    token_address: any;
    limit?: number;
    offset?: number;
    trade_type?: "buy" | "sell";
    status?: "pending" | "executed" | "canceled" | "failed";
    order_type?: "market" | "limit";
  }) => {
    sendMessage({
      method: "getOrders",
      params,
    });
  };

  // Hàm hủy đăng ký nhận cập nhật orders
  const unGetOrders = () => {
    sendMessage({
      method: "unGetOrders"
    });
  };

  return { socket, orderMessages, sendMessage, getOrdersWs, unGetOrders };
}
