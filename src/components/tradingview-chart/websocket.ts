export class TransactionWebSocket {
  private ws: WebSocket | null = null;
  private tokenAddress: string;
  private apiKey: string = '335a9615-dbcd-4684-8155-6298a93b0e44';
  public onMessage: ((data: any) => void) | null = null;

  constructor(tokenAddress: string) {
    this.tokenAddress = tokenAddress;
  }

  connect() {
    try {
      this.ws = new WebSocket(`wss://datastream.solanatracker.io/${this.apiKey}`);

      this.ws.onopen = () => {
        console.log('WebSocket kết nối thành công');
        // Send join message
        const joinMessage = {
          type: 'join',
          room: `transaction:${this.tokenAddress}`
        };
        this.ws?.send(JSON.stringify(joinMessage));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message' && this.onMessage) {
            this.onMessage(data);
          }
        } catch (error) {
          console.error('Lỗi khi xử lý dữ liệu WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Lỗi WebSocket:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket đã đóng kết nối');
      };
    } catch (error) {
      console.error('Lỗi khi kết nối WebSocket:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 