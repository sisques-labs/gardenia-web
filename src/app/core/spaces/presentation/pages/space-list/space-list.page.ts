import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SpacesStateService } from '@/core/spaces/application/services/spaces-state/spaces-state.service';

@Component({
  selector: 'app-space-list-page',
  standalone: true,
  imports: [],
  template: `
    <main class="p-6">
      <h1 class="text-2xl font-semibold mb-4">Spaces</h1>
      @if (spacesState.availableSpaces().length === 0) {
        <p class="text-gray-500">No spaces yet.</p>
      } @else {
        <ul class="flex flex-col gap-2">
          @for (space of spacesState.availableSpaces(); track space.id) {
            <li class="p-4 border rounded-md">
              <span class="font-medium">{{ space.name }}</span>
            </li>
          }
        </ul>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceListPage {
  protected readonly spacesState = inject(SpacesStateService);
}
