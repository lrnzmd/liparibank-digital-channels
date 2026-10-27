/**
 * EventBus - Interfaccia per publish di Domain Events
 * 
 * Uso: Comunicazione loosely-coupled tra moduli
 * Implementazioni:
 * - InMemoryEventBus (MVP): Logga a console/Pino
 * - KafkaEventBus (Futuro): Publish a Kafka topics
 * - RabbitMQEventBus (Futuro): Publish a RabbitMQ exchanges
 */

/**
 * Domain Event generico.
 * Tutti gli eventi che attraversano il sistema devono implementare questa interfaccia.
 */
export interface DomainEvent {
  type: string;
  aggregateId: string;
  timestamp: Date;
  version?: number;
  [key: string]: any;
}

/**
 * Evento emesso quando un trasferimento è completato.
 */
export interface PaymentCompletedEvent extends DomainEvent {
  type: "PaymentCompleted";
  transferId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  executedAt: Date;
}

/**
 * Evento emesso quando un account è creato.
 */
export interface AccountCreatedEvent extends DomainEvent {
  type: "AccountCreated";
  accountId: string;
  customerId: string;
  iban: string;
  accountType: string;
  status: string;
}

/**
 * EventBus - Interfaccia per publish di eventi.
 * Permette implementazioni pluggable (in-memory, Kafka, RabbitMQ, ecc.)
 */
export interface EventBus {
  /**
   * Pubblica un evento nel bus.
   * @param event DomainEvent da propagare
   */
  publish(event: DomainEvent): Promise<void>;

  /**
   * Sottoscrive a un tipo di evento.
   * @param eventType Tipo di evento (es. "PaymentCompleted")
   * @param handler Callback da eseguire quando l'evento è pubblicato
   */
  subscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>
  ): void;
}

/**
 * InMemoryEventBus - Implementazione in-memory per MVP.
 * 
 * Usa Pino per structured logging.
 * Non persiste gli eventi (perduti al restart).
 * Per produzione: migrare a Kafka/RabbitMQ.
 */
export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, ((event: DomainEvent) => Promise<void>)[]> =
    new Map();

  constructor(private logger?: any) {}

  async publish(event: DomainEvent): Promise<void> {
    // Log l'evento come evento di dominio strutturato
    if (this.logger) {
      this.logger.info(
        {
          eventType: event.type,
          aggregateId: event.aggregateId,
          timestamp: event.timestamp,
          payload: event,
        },
        "Domain Event Published"
      );
    } else {
      console.log(`[EventBus] Published event: ${event.type}`, event);
    }

    // Esegui handler sincronamente (o asincroni ma fire-and-forget)
    const eventHandlers = this.handlers.get(event.type) || [];
    for (const handler of eventHandlers) {
      try {
        await handler(event);
      } catch (error) {
        if (this.logger) {
          this.logger.error(
            { error, eventType: event.type },
            "Error handling domain event"
          );
        } else {
          console.error(`Error handling ${event.type}:`, error);
        }
      }
    }
  }

  subscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
}

/**
 * Placeholder per EventBus basato su Kafka.
 * Implementazione futura.
 */
export class KafkaEventBus implements EventBus {
  // TODO: Implementare con kafkajs
  async publish(event: DomainEvent): Promise<void> {
    throw new Error("KafkaEventBus not implemented yet");
  }

  subscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>
  ): void {
    throw new Error("KafkaEventBus not implemented yet");
  }
}

/**
 * Placeholder per EventBus basato su RabbitMQ.
 * Implementazione futura.
 */
export class RabbitMQEventBus implements EventBus {
  // TODO: Implementare con amqplib
  async publish(event: DomainEvent): Promise<void> {
    throw new Error("RabbitMQEventBus not implemented yet");
  }

  subscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>
  ): void {
    throw new Error("RabbitMQEventBus not implemented yet");
  }
}
