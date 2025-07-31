import { Logger } from '@nestjs/common';
import { Logger as TypeOrmLogger } from 'typeorm';

export class DatabaseLogger implements TypeOrmLogger {
  private readonly logger = new Logger('DatabaseLogger');

  logQuery(query: string, parameters?: any[]) {
    const sql = this.formatQuery(query, parameters);
    this.logger.log(`🔍 QUERY: ${sql}`);
  }

  logQueryError(error: string | Error, query: string, parameters?: any[]) {
    const sql = this.formatQuery(query, parameters);
    this.logger.error(`❌ QUERY ERROR: ${error}`);
    this.logger.error(`📝 SQL: ${sql}`);
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    const sql = this.formatQuery(query, parameters);
    this.logger.warn(`🐌 SLOW QUERY (${time}ms): ${sql}`);
  }

  logSchemaBuild(message: string) {
    this.logger.log(`🏗️  SCHEMA: ${message}`);
  }

  logMigration(message: string) {
    this.logger.log(`🔄 MIGRATION: ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: any) {
    switch (level) {
      case 'info':
        this.logger.log(`ℹ️  INFO: ${message}`);
        break;
      case 'warn':
        this.logger.warn(`⚠️  WARN: ${message}`);
        break;
      default:
        this.logger.log(`📄 LOG: ${message}`);
    }
  }

  private formatQuery(query: string, parameters?: any[]): string {
    if (!parameters || parameters.length === 0) {
      return query;
    }

    let formattedQuery = query;
    parameters.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      const value = typeof param === 'string' ? `'${param}'` : String(param);
      formattedQuery = formattedQuery.replace(placeholder, value);
    });

    return formattedQuery;
  }
}
