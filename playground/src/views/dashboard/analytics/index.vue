<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import { onMounted, ref, watch } from 'vue';

import { AnalysisChartsTabs, AnalysisOverview } from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';
import { usePreferences } from '@vben/preferences';

import * as monaco from 'monaco-editor';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisits from './analytics-visits.vue';

const overviewItems: AnalysisOverviewItem[] = [
  {
    icon: SvgCardIcon,
    title: '用户量',
    totalTitle: '总用户量',
    totalValue: 120_000,
    value: 2000,
  },
  {
    icon: SvgCakeIcon,
    title: '访问量',
    totalTitle: '总访问量',
    totalValue: 500_000,
    value: 20_000,
  },
  {
    icon: SvgDownloadIcon,
    title: '下载量',
    totalTitle: '总下载量',
    totalValue: 120_000,
    value: 8000,
  },
  {
    icon: SvgBellIcon,
    title: '使用量',
    totalTitle: '总使用量',
    totalValue: 50_000,
    value: 5000,
  },
];

const chartTabs: TabOption[] = [
  {
    label: '流量趋势',
    value: 'trends',
  },
  {
    label: '月访问量',
    value: 'visits',
  },
];

const { isDark } = usePreferences();
// 定义一个引用来持有编辑器容器的 DOM 元素
const editorContainer = ref(null);

watch(isDark, () => {
  monaco.editor.setTheme(isDark.value ? 'vs-dark' : 'vs');
});

onMounted(() => {
  initEditor();
});

function initEditor() {
  // 确保 DOM 元素已经渲染
  if (editorContainer.value) {
    // eslint-disable-next-line no-console
    console.log(isDark.value);
    // 创建编辑器实例
    const editor = monaco.editor.create(editorContainer.value, {
      language: 'go',
      theme: isDark.value ? 'vs-dark' : 'hc-light',
      value:
        'func Exec(param models.PluginModel) interface{} {sayHi();date := time.Now().Format("2006-01-02 15:04:05");logs.Info(param);return param.Name + " // " + date;}',
    });
    editor.addAction({
      id: 'sayHi',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F2],
      label: 'Say Hi',
      run: (e, args) => {
        // eslint-disable-next-line no-console
        console.log(e.getValue(), args);
      },
    });
    // setInterval(() => {
    //   // eslint-disable-next-line no-console
    //   console.log(editor.getValue());
    // }, 1000);
  }
}
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <!-- <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问数量">
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSales />
      </AnalysisChartCard> -->
      <div ref="editorContainer" class="coder-editor"></div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.coder-editor {
  width: 100%;
  height: 200px;
}
</style>
