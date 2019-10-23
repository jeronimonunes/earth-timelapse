export interface DataMessage {
  times: Date[];
  limit: number;
  name: string;
  title: string;
  service: 'WMS';
  legendUrl: string;
}
