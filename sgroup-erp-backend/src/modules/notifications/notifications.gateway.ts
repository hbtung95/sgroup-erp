import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';

/**
 * NotificationsGateway — WebSocket gateway for real-time notifications.
 *
 * Events emitted to clients:
 *   - 'notification' — general notification { type, title, message, data, timestamp }
 *   - 'inventory:status_changed' — product status changed
 *   - 'deal:updated' — deal stage changed
 *
 * Clients can join rooms:
 *   - 'user:{userId}' — personal notifications
 *   - 'team:{teamId}' — team-level updates
 *   - 'project:{projectId}' — project inventory updates
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients = new Map<string, Socket>();

  afterInit(server: Server) {
    this.logger.log('WebSocket NotificationsGateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedClients.set(userId, client);
      client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${userId} (socket: ${client.id})`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedClients.delete(userId);
      this.logger.log(`Client disconnected: ${userId}`);
    }
  }

  // ── Client subscribes to rooms ──
  @SubscribeMessage('join:team')
  handleJoinTeam(@ConnectedSocket() client: Socket, @MessageBody() data: { teamId: string }) {
    client.join(`team:${data.teamId}`);
    this.logger.debug(`Socket ${client.id} joined team:${data.teamId}`);
  }

  @SubscribeMessage('join:project')
  handleJoinProject(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string }) {
    client.join(`project:${data.projectId}`);
    this.logger.debug(`Socket ${client.id} joined project:${data.projectId}`);
  }

  // ── Internal event listeners → push to clients ──

  @OnEvent('deal.created')
  handleDealCreated(deal: any) {
    this.server.emit('notification', {
      type: 'deal_created',
      title: 'Deal mới',
      message: `Deal ${deal.dealCode || ''} — ${deal.customerName || 'N/A'} (${deal.dealValue || 0} Tỷ)`,
      data: deal,
      timestamp: new Date().toISOString(),
    });
  }

  @OnEvent('deal.status_changed')
  handleDealStatusChanged(payload: { oldDeal: any; newDeal: any }) {
    const { newDeal } = payload;
    if (newDeal.teamId) {
      this.server.to(`team:${newDeal.teamId}`).emit('notification', {
        type: 'deal_updated',
        title: 'Deal cập nhật',
        message: `Deal ${newDeal.dealCode} → ${newDeal.stage}`,
        data: newDeal,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @OnEvent('inventory.status_changed')
  handleInventoryStatusChanged(payload: { productId: string; projectId: string; oldStatus: string; newStatus: string; changedBy?: string }) {
    this.server.to(`project:${payload.projectId}`).emit('inventory:status_changed', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  // ── Public API for other services to push notifications ──

  sendToUser(userId: string, notification: { type: string; title: string; message: string; data?: any }) {
    this.server.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  broadcast(notification: { type: string; title: string; message: string; data?: any }) {
    this.server.emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }
}
