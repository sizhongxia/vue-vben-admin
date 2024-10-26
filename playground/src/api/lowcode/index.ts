import { requestClient } from '#/api/request';

async function getLowcodeMenuPageInfo(menuId: string) {
  return requestClient.post('/lowcode/menupageinfo', { menuId });
}
async function getLowcodeMenuPageData(param: object) {
  return requestClient.post('/lowcode/page', { ...param });
}

export { getLowcodeMenuPageData, getLowcodeMenuPageInfo };
