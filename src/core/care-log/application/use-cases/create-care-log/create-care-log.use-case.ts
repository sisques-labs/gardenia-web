import type { ICareLogRepository } from '@/core/care-log/application/ports/care-log.repository.port';
import type { CreateCareLogInput } from '@/core/care-log/application/interfaces/create-care-log-input.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

export class CreateCareLogUseCase {
  constructor(private readonly careLogRepository: ICareLogRepository) {}

  async execute(input: CreateCareLogInput): Promise<CreatedEntity> {
    return this.careLogRepository.create(input);
  }
}
