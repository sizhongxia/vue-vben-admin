import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 */
export const overridesPreferences = defineOverridesPreferences({
  app: {
    accessMode: 'backend',
  },
  theme: {
    builtinType: 'default',
    radius: '0.75',
  },
});
