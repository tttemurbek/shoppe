import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';

export interface ChatMessage {
	role: 'user' | 'model';
	parts: string;
}

@Injectable()
export class GeminiService {
	private readonly logger = new Logger(GeminiService.name);
	private genAI: GoogleGenerativeAI;
	private model: GenerativeModel;

	constructor(private configService: ConfigService) {
		const apiKey = this.configService.get<string>('GEMINI_API_KEY');

		if (!apiKey) {
			throw new Error('GEMINI_API_KEY is not configured in environment variables');
		}

		this.genAI = new GoogleGenerativeAI(apiKey);
		this.model = this.genAI.getGenerativeModel({
			model: this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash',
			generationConfig: {
				temperature: parseFloat(this.configService.get<string>('GEMINI_TEMPERATURE')) || 0.7,
				maxOutputTokens: parseInt(this.configService.get<string>('GEMINI_MAX_TOKENS')) || 150,
				topP: 0.8,
				topK: 10,
			},
		});
	}

	async generateChatResponse(
		userMessage: string,
		conversationHistory: ChatMessage[] = [],
		systemPrompt?: string,
	): Promise<string> {
		try {
			let chat: ChatSession;

			if (conversationHistory.length > 0 || systemPrompt) {
				// Convert conversation history to Gemini format
				const history = conversationHistory.map((msg) => ({
					role: msg.role,
					parts: [{ text: msg.parts }],
				}));

				if (systemPrompt) {
					// Add system prompt as the first user message with context
					history.unshift({
						role: 'user',
						parts: [
							{ text: `System instructions: ${systemPrompt}\n\nPlease follow these instructions in your responses.` },
						],
					});
					history.push({
						role: 'model',
						parts: [{ text: 'I understand and will follow these instructions.' }],
					});
				}

				chat = this.model.startChat({
					history: history,
				});
			} else {
				let prompt = userMessage;
				if (systemPrompt) {
					prompt = `${systemPrompt}\n\nUser: ${userMessage}`;
				}

				const result = await this.model.generateContent(prompt);
				const response = await result.response;
				return response.text().trim();
			}

			const result = await chat.sendMessage(userMessage);
			const response = await result.response;

			if (!response) {
				throw new Error('No response generated from Gemini');
			}

			return response.text().trim();
		} catch (error) {
			this.logger.error('Error generating Gemini response:', error);

			if (error.status === 429) {
				throw new Error('Gemini API rate limit exceeded. Please try again in a few moments.');
			} else if (error.status === 400) {
				throw new Error('Invalid request to Gemini API. Please check your message content.');
			} else if (error.status === 403) {
				throw new Error('Gemini API access denied. Please check your API key and billing settings.');
			} else if (error.status === 404) {
				throw new Error('Gemini API endpoint not found. Please check your model configuration.');
			}

			throw new Error(`Gemini API Error: ${error.message || 'Unknown error occurred'}`);
		}
	}

	async generateStreamingResponse(
		userMessage: string,
		conversationHistory: ChatMessage[] = [],
		systemPrompt?: string,
	): Promise<AsyncIterable<string>> {
		try {
			let chat: ChatSession;

			if (conversationHistory.length > 0 || systemPrompt) {
				const history = conversationHistory.map((msg) => ({
					role: msg.role,
					parts: [{ text: msg.parts }],
				}));

				if (systemPrompt) {
					history.unshift({
						role: 'user',
						parts: [
							{ text: `System instructions: ${systemPrompt}\n\nPlease follow these instructions in your responses.` },
						],
					});
					history.push({
						role: 'model',
						parts: [{ text: 'I understand and will follow these instructions.' }],
					});
				}

				chat = this.model.startChat({
					history: history,
				});
			} else {
				let prompt = userMessage;
				if (systemPrompt) {
					prompt = `${systemPrompt}\n\nUser: ${userMessage}`;
				}

				const result = await this.model.generateContentStream(prompt);
				return this.processStream(result.stream);
			}

			const result = await chat.sendMessageStream(userMessage);
			return this.processStream(result.stream);
		} catch (error) {
			this.logger.error('Error generating streaming Gemini response:', error);
			throw new Error('Failed to generate streaming AI response');
		}
	}

	private async *processStream(stream: any): AsyncIterable<string> {
		for await (const chunk of stream) {
			const chunkText = chunk.text();
			if (chunkText) {
				yield chunkText;
			}
		}
	}
}
