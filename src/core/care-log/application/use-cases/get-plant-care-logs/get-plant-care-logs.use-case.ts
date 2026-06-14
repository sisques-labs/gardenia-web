import type { ICareLogRepository } from '@/core/care-log/application/ports/care-log.repository.port';
import type { CareLogEntry, LastCareByType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

export class GetPlantCareLogsUseCase {
  constructor(private readonly careLogRepository: ICareLogRepository) {}

  async execute(plantId: string): Promise<LastCareByType> {
    const entries = await this.careLogRepository.findByPlantId(plantId, 50);
    return this.reduceToLastByType(entries);
  }

  private reduceToLastByType(entries: CareLogEntry[]): LastCareByType {
    const result: LastCareByType = {};
    for (const entry of entries) {
      if (!(entry.activityType in result)) {
        result[entry.activityType] = entry;
      }
    }
    return result;
  }
}
