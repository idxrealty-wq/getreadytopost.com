export type SettingType =
  | 'text'
  | 'number'
  | 'email'
  | 'url';

export interface AdminSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  settingType: SettingType;
  description?: string;
  updatedBy?: string;
  updatedAt: Date;
}
