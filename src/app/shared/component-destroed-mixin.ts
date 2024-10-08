import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class ComponentDestroyedMixin {
    public destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
