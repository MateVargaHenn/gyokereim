import { Injectable } from '@angular/core';
import { WebSettingDto } from '@shared/data-transfer-objects/web-setting.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Api } from './api/api';

@Injectable({
  providedIn: 'root',
})
export class WebSettingsService extends Api {
    getWebSetting(key: string): Observable<WebSettingDto | undefined> {
        return this.get<WebSettingDto>(`websetting/queue/${key}`);
    }

    getWebSettingString(key: string): Observable<string | undefined> {
        return this.get<WebSettingDto>(`websetting/queue/${key}`).pipe(
            map((webSetting) => webSetting?.value)
        );
    }
}
