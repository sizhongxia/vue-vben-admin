<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { VbenButton } from '@vben-core/shadcn-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLowcodeMenuPageData, getLowcodeMenuPageInfo } from '#/api';

const Grid = ref(null);

// console.info(Grid, gridApi);

const title = ref('标题');
const description = ref('描述');

async function getPageInfo(menuId) {
  const pageInfo = await getLowcodeMenuPageInfo(menuId);
  title.value = pageInfo?.title;
  description.value = pageInfo?.description;
}

onMounted(() => {
  const route = useRoute();
  const query = route.meta.query;
  // const pageInfo = await getLowcodeMenuPageInfo(query.menuId);
  // console.info(pageInfo);
  getPageInfo(query.menuId);

  const gridOptions: VxeGridProps<any> = {
    checkboxConfig: {
      highlight: true,
      labelField: 'name',
    },
    columns: [],
    height: 'auto',
    keepSource: true,
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          return await getLowcodeMenuPageData({
            menuId: '',
            page: page.currentPage,
            pageSize: page.pageSize,
          });
        },
      },
      autoLoad: true,
      enabled: true,
      filter: true,
      sort: true,
    },
  };
  const gridEvents: VxeGridListeners<RowType> = {
    cellClick: ({ row }) => {
      // eslint-disable-next-line no-console
      console.info(`cell-click: ${row.name}`);
    },
    proxyQuery: ({ data }) => {
      // eslint-disable-next-line no-console
      console.info(`proxy-query: ${data}`);
    },
  };

  const [G] = useVbenVxeGrid({ gridEvents, gridOptions });
  // gridApi.query(); gridApi
  Grid.value = G;
});
</script>

<template>
  <Page :description="description" :title="title" auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <VbenButton
          class="mx-4"
          size="sm"
          variant="default"
          @click="() => gridApi.query()"
        >
          刷新当前页面
        </VbenButton>
        <VbenButton
          class="mx-4"
          size="sm"
          variant="default"
          @click="() => gridApi.reload()"
        >
          刷新并返回第一页
        </VbenButton>
      </template>
    </Grid>
  </Page>
</template>
