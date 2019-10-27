export interface DataMessage {
  times: Date[];
  limit: number;
  name: string;
  service: 'WMS';
  legendUrl: string;
}
