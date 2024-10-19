import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户授权菜单
 */
export async function getAuthMenuApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/auth/menus');
}
