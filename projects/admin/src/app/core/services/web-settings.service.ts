import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from './api/api';
import { AdminWebSettingDto } from '../../shared/data-transfer-objects/admin-web-setting.dto';
import { UpdateWebSettingDto } from '../../shared/data-transfer-objects/update-web-setting.dto';

@Injectable({
  providedIn: 'root'
})
export class WebSettingsService extends Api {

  getWebSettings(): Observable<AdminWebSettingDto[]> {
    return this.get<AdminWebSettingDto[]>(
      'websetting/admin'
    );
  }

  updateWebSetting(
    key: string,
    dto: UpdateWebSettingDto
  ): Observable<void> {
    return this.put<void>(
      `websetting/admin/${key}`,
      dto
    );
  }
}