import { requestClient } from '#/api/request';

async function getLowcodeMenuPageInfo(menuId: string) {
  return requestClient.post('/lowcode/menupageinfo', { menuId });
}
async function getLowcodeMenuPageData(param: object) {
  // eslint-disable-next-line no-console
  console.info(param);
  return requestClient.post('/lowcode/menupagedata', { ...param });
}

export { getLowcodeMenuPageData, getLowcodeMenuPageInfo };
