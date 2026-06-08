import { Injectable, Logger } from '@nestjs/common';

export interface MailMessage {
  to: string;
  subject: string;
  body: string;
}

/**
 * Interfaz de servicio de correo. Mantiene la firma estable para
 * que el día que enchufemos SMTP/Resend/Brevo la implementación
 * cambie sin tocar nada del worker ni de los use cases.
 */
export abstract class MailerPort {
  abstract send(message: MailMessage): Promise<void>;
}

export const MAILER = Symbol('MAILER');

/**
 * Implementación-stub: solo loguea por consola. Suficiente para
 * desarrollar y validar el flujo de notificaciones sin un proveedor
 * de email real conectado.
 */
@Injectable()
export class LoggingMailer implements MailerPort {
  private readonly logger = new Logger('LoggingMailer');

  send(message: MailMessage): Promise<void> {
    this.logger.log(
      `[STUB EMAIL] to=${message.to} subject="${message.subject}"`,
    );
    this.logger.debug(message.body);
    return Promise.resolve();
  }
}
