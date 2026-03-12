/**
 * SalesGateway — WebSocket gateway for real-time sales notifications
 * Events: deal:new, deal:update, booking:approve, booking:reject, notification
 */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/sales',
})
export class SalesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('SalesGateway');

  afterInit() {
    this.logger.log('Sales WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Join a team room for targeted notifications
  @SubscribeMessage('join:team')
  handleJoinTeam(client: Socket, teamId: string) {
    client.join(`team:${teamId}`);
    this.logger.log(`Client ${client.id} joined team:${teamId}`);
  }

  // Join personal room for 1:1 notifications
  @SubscribeMessage('join:user')
  handleJoinUser(client: Socket, userId: string) {
    client.join(`user:${userId}`);
    this.logger.log(`Client ${client.id} joined user:${userId}`);
  }

  // ── Server-side emission methods (called from services) ──

  /** Notify about a new deal */
  emitDealCreated(deal: any) {
    this.server.emit('deal:new', deal);
    if (deal.teamId) {
      this.server.to(`team:${deal.teamId}`).emit('deal:team:new', deal);
    }
  }

  /** Notify about deal stage change */
  emitDealUpdated(deal: any) {
    this.server.emit('deal:update', deal);
    if (deal.staffId) {
      this.server.to(`user:${deal.staffId}`).emit('deal:personal:update', deal);
    }
  }

  /** Notify about booking approval */
  emitBookingApproved(booking: any) {
    this.server.emit('booking:approve', booking);
  }

  /** Notify about booking rejection */
  emitBookingRejected(booking: any) {
    this.server.emit('booking:reject', booking);
  }

  /** Send targeted notification to a user */
  emitNotification(userId: string, notification: { title: string; message: string; type: string }) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  /** Broadcast to all connected clients */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
