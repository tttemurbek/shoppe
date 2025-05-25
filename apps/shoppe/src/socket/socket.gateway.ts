import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { GeminiService, ChatMessage } from './gemini.service';
import { Member } from '../libs/dto/member/member';
import * as url from 'url';
import { MemberStatus, MemberType } from '../libs/enums/member.enum';
import { ObjectId } from 'mongoose';

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member;
	isAI?: boolean;
	messageId?: string;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member;
	action: string;
}

interface StreamingPayload {
	event: string;
	chunk: string;
	messageId: string;
	isComplete: boolean;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private summaryClient: number = 0;
	private clientsAuthMap = new Map<WebSocket, Member>();
	private messageList: MessagePayload[] = [];
	private conversationHistory: ChatMessage[] = [];
	private readonly maxHistoryLength = 10; // Keep last 10 messages for context

	constructor(
		private authService: AuthService,
		private geminiService: GeminiService,
	) {}

	@WebSocketServer()
	server: Server;

	public afterInit(server: Server) {
		this.logger.verbose(`Websocket Server Initialized && total: [${this.summaryClient}]`);
	}

	private async retriveAuth(req: any): Promise<Member> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			return await this.authService.verifyToken(token as string);
		} catch (err) {
			return null;
		}
	}

	public async handleConnection(client: WebSocket, req: any) {
		const authMember = await this.retriveAuth(req);
		this.summaryClient++;
		this.clientsAuthMap.set(client, authMember);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Connection [${clientNick}] & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'joined',
		};
		this.emitMessage(infoMsg);
		client.send(JSON.stringify({ event: 'getMessages', list: this.messageList }));
	}

	public async handleDisconnect(client: WebSocket) {
		const authMember = this.clientsAuthMap.get(client);
		this.summaryClient--;
		this.clientsAuthMap.delete(client);
		const clientNick: string = authMember?.memberNick ?? 'Guest';

		this.logger.verbose(`Disconnection [${clientNick}] & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'left',
		};
		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: any): Promise<void> {
		const authMember = this.clientsAuthMap.get(client);
		const messageId = this.generateMessageId();
		const newMessage: MessagePayload = {
			event: 'message',
			text: payload,
			memberData: authMember,
			isAI: false,
			messageId,
		};
		const clientNick: string = authMember?.memberNick ?? 'Guest';

		this.logger.verbose(`NEW MESSAGE: [${clientNick}] ${payload}`);

		// Add user message to history
		this.conversationHistory.push({
			role: 'user',
			parts: payload,
		});

		// Store and broadcast user message
		this.messageList.push(newMessage);
		if (this.messageList.length > 10) this.messageList.splice(0, this.messageList.length - 10);
		this.emitMessage(newMessage);

		// Generate AI response
		await this.generateAIResponse(payload);
	}

	@SubscribeMessage('chatbot')
	public async handleChatbotMessage(client: WebSocket, payload: any): Promise<void> {
		const authMember = this.clientsAuthMap.get(client);
		const clientNick: string = authMember?.memberNick ?? 'Guest';

		this.logger.verbose(`CHATBOT MESSAGE: [${clientNick}] ${payload}`);

		// Send only to the requesting client for private AI chat
		await this.generatePrivateAIResponse(client, payload, authMember);
	}

	@SubscribeMessage('streamingChat')
	public async handleStreamingChat(client: WebSocket, payload: any): Promise<void> {
		const authMember = this.clientsAuthMap.get(client);
		const clientNick: string = authMember?.memberNick ?? 'Guest';

		this.logger.verbose(`STREAMING CHAT: [${clientNick}] ${payload}`);

		await this.generateStreamingAIResponse(client, payload, authMember);
	}

	private async generateAIResponse(userMessage: string): Promise<void> {
		try {
			const systemPrompt = 'You are a helpful AI assistant in a chat room. Keep responses concise and friendly.';

			const aiResponse = await this.geminiService.generateChatResponse(
				userMessage,
				this.conversationHistory.slice(-this.maxHistoryLength),
				systemPrompt,
			);

			// Add AI response to history
			this.conversationHistory.push({
				role: 'model',
				parts: aiResponse,
			});

			// Trim conversation history
			if (this.conversationHistory.length > this.maxHistoryLength * 2) {
				this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
			}

			const aiMessage: MessagePayload = {
				event: 'message',
				text: aiResponse,
				memberData: this.createAIMember(),
				isAI: true,
				messageId: this.generateMessageId(),
			};

			// Store and broadcast AI message
			this.messageList.push(aiMessage);
			if (this.messageList.length > 10) this.messageList.splice(0, this.messageList.length - 10);

			// Delay AI response slightly for better UX
			setTimeout(() => {
				this.emitMessage(aiMessage);
			}, 1000);
		} catch (error) {
			this.logger.error('Error generating AI response:', error);

			const errorMessage: MessagePayload = {
				event: 'message',
				text: `Sorry, I encountered an error: ${error.message}`,
				memberData: this.createAIMember(),
				isAI: true,
				messageId: this.generateMessageId(),
			};

			this.emitMessage(errorMessage);
		}
	}

	private async generatePrivateAIResponse(client: WebSocket, userMessage: string, authMember: Member): Promise<void> {
		try {
			const systemPrompt = 'You are a helpful AI assistant. Provide detailed and helpful responses.';

			const aiResponse = await this.geminiService.generateChatResponse(
				userMessage,
				[], // No shared history for private chats
				systemPrompt,
			);

			const aiMessage = {
				event: 'privateChatResponse',
				text: aiResponse,
				memberData: this.createAIMember(),
				isAI: true,
				messageId: this.generateMessageId(),
			};

			client.send(JSON.stringify(aiMessage));
		} catch (error) {
			this.logger.error('Error generating private AI response:', error);

			const errorMessage = {
				event: 'privateChatResponse',
				text: `Sorry, I encountered an error: ${error.message}`,
				memberData: this.createAIMember(),
				isAI: true,
				messageId: this.generateMessageId(),
			};

			client.send(JSON.stringify(errorMessage));
		}
	}

	private async generateStreamingAIResponse(client: WebSocket, userMessage: string, authMember: Member): Promise<void> {
		try {
			const messageId = this.generateMessageId();
			const systemPrompt = 'You are a helpful AI assistant. Provide detailed and helpful responses.';

			const stream = await this.geminiService.generateStreamingResponse(userMessage, [], systemPrompt);

			for await (const chunk of stream) {
				const streamingPayload: StreamingPayload = {
					event: 'streamingResponse',
					chunk,
					messageId,
					isComplete: false,
				};

				client.send(JSON.stringify(streamingPayload));
			}

			// Send completion signal
			const completionPayload: StreamingPayload = {
				event: 'streamingResponse',
				chunk: '',
				messageId,
				isComplete: true,
			};

			client.send(JSON.stringify(completionPayload));
		} catch (error) {
			this.logger.error('Error generating streaming AI response:', error);

			const errorPayload = {
				event: 'streamingError',
				error: error.message,
				messageId: this.generateMessageId(),
			};

			client.send(JSON.stringify(errorPayload));
		}
	}

	private createAIMember(): any {
		return {
			_id: 'ai-assistant',
			memberNick: 'Gemini AI',
		};
	}

	private generateMessageId(): string {
		return Date.now().toString() + Math.random().toString(36).substr(2, 9);
	}

	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}
