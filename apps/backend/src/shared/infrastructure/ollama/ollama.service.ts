import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://192.168.0.103:11434';
    this.model = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';
  }

  async generateJson<T>(prompt: string): Promise<T> {
    this.logger.log(`Calling Ollama model=${this.model}`);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          format: 'json',
          stream: false,
          options: { temperature: 0.7, num_predict: 1024 },
        }),
        signal: AbortSignal.timeout(300_000), // 5 min
      });
    } catch (err) {
      this.logger.error(`Ollama unreachable: ${err}`);
      throw new ServiceUnavailableException('Ollama no está disponible');
    }

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Ollama error ${response.status}: ${body}`);
      throw new ServiceUnavailableException('Error en Ollama al generar la rutina');
    }

    const data = await response.json();
    return JSON.parse(data.response) as T;
  }
}
