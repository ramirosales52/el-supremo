import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Order } from './order.entity';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/orders',
})
export class OrderGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  notifyNewOrder(order: Order) {
    this.server.emit('order:created', order);
  }

  notifyStatusChange(order: Order) {
    this.server.emit('order:statusChanged', order);
  }
}
