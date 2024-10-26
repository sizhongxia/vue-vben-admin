<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref, shallowRef } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { VbenButton } from '@vben-core/shadcn-ui';

import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLowcodeMenuPageData, getLowcodeMenuPageInfo } from '#/api';

const title = ref('页面标题');
const description = ref('页面描述');

const Grid = shallowRef(null);
const GridApi = shallowRef(null);

// const tableFilterData = ref({});
const metaObjectCode = ref('');

const ResetCurrentPage = ref(false);

function getFormatterFunc(formatter: any) {
  if (formatter.func === 'boolFormatter') {
    return (data: any) => {
      // // eslint-disable-next-line no-console
      // console.info(data, formatter.config);
      if (data.cellValue === 'true') {
        return formatter.config.trueValue || '是';
      } else if (data.cellValue === 'false') {
        return formatter.config.falseValue || '否';
      }
      return data.cellValue;
    };
  } else if (formatter.func === 'dateFormatter') {
    return (data: any) => {
      // // eslint-disable-next-line no-console
      // console.info(data, formatter.config);
      if (data.cellValue) {
        // // eslint-disable-next-line no-console
        // console.info(data, dayjs);
        return dayjs(data.cellValue).format(formatter.config.dateFormat);
      }
      return data.cellValue;
    };
  }
  return (data: any) => {
    // console.info(data, formatter.config);
    return data.cellValue;
  };
}

const searchFormSchema = [];

async function loadData(data: any) {
  // // eslint-disable-next-line no-console
  // console.info('data >>>', data);
  const { filters, isReload, page, sort } = data;
  // GridApi.value.setLoading(true);
  // // eslint-disable-next-line no-console
  // console.info(
  //   `query page: ${JSON.stringify(page)}, form: ${JSON.stringify(form)}, filters: ${JSON.stringify(filters)}`,
  // );
  // // eslint-disable-next-line no-console
  // console.info('page', page);
  // // eslint-disable-next-line no-console
  // console.info('sorts', sorts);
  const sortArr = [];
  if (sort && sort.order) {
    if (sort.order === 'asc') {
      sortArr.push({
        field: sort.field,
        order: 'ASC',
      });
    } else if (sort.order === 'desc') {
      sortArr.push({
        field: sort.field,
        order: 'DESC',
      });
    }
  }

  // const filters = tableFilterData.value;
  // // eslint-disable-next-line no-console
  // console.info('filters', filters);
  const conditions: any[] = [];
  if (filters && filters.length > 0) {
    filters.forEach((item) => {
      conditions.push({
        field: item.field,
        type: 'in',
        values: item.values,
      });
    });
  }

  const formValues = GridApi.value.formApi?.form.values;
  // // eslint-disable-next-line no-console
  // console.info('formValues', formValues);
  if (formValues) {
    for (const key in formValues) {
      if (formValues[key]) {
        let val = formValues[key];
        if (Array.isArray(val) && val.length === 0) {
          continue;
        }
        let operator = '';
        searchFormSchema.forEach((item: any) => {
          if (key === item.fieldName) {
            operator = item.operator;
            // // eslint-disable-next-line no-console
            // console.info(operator, item, val);
            if (item.component === 'RangePicker' && val.length === 2) {
              // // eslint-disable-next-line no-console
              // console.info(val[0].format(item.componentProps.format));
              val = [
                val[0].format(item.componentProps.format),
                val[1].format(item.componentProps.format),
              ];
            }
          }
        });
        conditions.push({
          field: key,
          type: operator,
          values: Array.isArray(val) ? val : [val],
        });
      }
    }
  }

  let condition = {};
  if (conditions.length > 0) {
    condition = {
      condition: {
        conditions,
        linkType: 'AND',
      },
    };
  }

  let res = {};
  try {
    res = await getLowcodeMenuPageData({
      condition,
      currentPage: isReload ? 1 : page.currentPage,
      metaObjectCode: metaObjectCode.value,
      pageSize: page.pageSize,
      sorts: sortArr,
    });
  } catch (error) {
    console.error(error);
  } finally {
    // GridApi.value.setLoading(false);
    // GridApi.value?.setGridOptions(res);
  }
  return res;
}

onMounted(async () => {
  const route = useRoute();
  const query: any = route.meta.query;
  const pageInfo = await getLowcodeMenuPageInfo(query.menuId);

  title.value = pageInfo?.title;
  description.value = pageInfo?.description;
  metaObjectCode.value = pageInfo?.metaObjectCode;

  const columns = pageInfo?.columns;
  columns.forEach((item: any) => {
    if (item.formatter) {
      item.formatter = getFormatterFunc(item.formatter);
    }
    if (item.filters) {
      item.filterMultiple = !!item.filterMultiple;
      item.filterMethod = () => true;
    }
    item.visible = !!item.visible;
  });

  const formOptionConfig = pageInfo.formOption;
  let formOptions: VbenFormProps = {};
  if (formOptionConfig) {
    formOptionConfig.items?.forEach((item: any) => {
      let rules = '';
      if (item.isRequired) {
        rules =
          item.component === 'VbenInput' ||
          item.component === 'Input' ||
          item.component === 'InputNumber'
            ? 'required'
            : 'selectRequired';
      }
      let options = {};
      if (item.component === 'Select' || item.component === 'VbenSelect') {
        options = {
          allowClear: item.allowClear || false,
          options: item.options || [],
          showSearch: item.showSearch || false,
        };
      }
      if (item.component === 'RangePicker') {
        options = {
          format: item.format || 'YYYY-MM-DD HH:mm:ss',
          showTime: item.showTime || false,
        };
      }
      searchFormSchema.push({
        // 组件需要在 #/adapter.ts内注册，并加上类型
        component: item.component,
        // 对应组件的参数
        componentProps: {
          placeholder: item.placeholder || '请输入',
          ...options,
        },
        defaultValue: item.defaultValue,
        disabled: false,
        // 字段名
        fieldName: item.fieldName,
        help: item.help || '',
        // 界面显示的label
        label: item.label,
        operator: item.operator || 'eq',
        rules,
      });
    });

    // // eslint-disable-next-line no-console
    // console.info('searchFormSchema', searchFormSchema);

    formOptions = {
      // 垂直布局，label和input在不同行，值为vertical
      // 水平布局，label和input在同一行，值为horizontal
      layout: formOptionConfig.layout || 'vertical',
      resetButtonOptions: {
        content: '重置',
        show: true,
      },
      schema: searchFormSchema,
      showCollapseButton: formOptionConfig.showCollapseButton || false,
      showDefaultActions: true,
      submitButtonOptions: {
        content: '检索',
        show: true,
      },
      submitOnEnter: formOptionConfig.submitOnEnter || false,
      wrapperClass:
        formOptionConfig.wrapperClass ||
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };
  }

  const gridOptions: VxeGridProps<any> = {
    checkboxConfig: {
      highlight: true,
      labelField: 'name',
    },
    columns,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      background: true,
      pagerCount: 6,
      pageSizes: [10, 20, 50, 100, 200],
      size: 'mini' as const,
    },
    proxyConfig: {
      ajax: {
        query: loadData,
      },
      autoLoad: true,
      enabled: true,
      filter: true,
      sort: true,
    },
  };
  const gridEvents: VxeGridListeners<any> = {
    // cellClick: (data: any) => {
    //   // eslint-disable-next-line no-console
    //   console.info('cellClick', data);
    // },
    filterChange: (/* { field, values }: any */) => {
      // // eslint-disable-next-line no-console
      // console.info('filterChange', field, values);
      // tableFilterData.value = {
      //   [field]: values,
      // };
      // // eslint-disable-next-line no-console
      // console.info('tableFilterData', tableFilterData.value);
      ResetCurrentPage.value = true;
      GridApi.value.query();
    },
    // pageChange: ({ currentPage, pageSize, type }: any) => {
    //   // eslint-disable-next-line no-console
    //   console.info('pageChange', type, currentPage, pageSize);
    // },
    // proxyQuery: (data: any) => {
    //   // eslint-disable-next-line no-console
    //   console.info('proxyQuery', data);
    // },
    sortChange: (/* { field, order }: any */) => {
      // // eslint-disable-next-line no-console
      // console.info('sortChange', field, order);
      GridApi.value.query();
    },
  };

  const [VxeGrid, VxeGridApi] = useVbenVxeGrid({
    formOptions,
    gridEvents,
    gridOptions,
  });
  // // eslint-disable-next-line no-console
  // console.info('VxeGridApi', VxeGridApi);

  Grid.value = VxeGrid;
  GridApi.value = VxeGridApi;
});
</script>

<template>
  <Page
    v-if="Grid"
    :description="description"
    :title="title"
    auto-content-height
  >
    <Grid>
      <template #toolbar-tools>
        <VbenButton
          class="mx-4"
          size="sm"
          variant="default"
          @click="() => GridApi.query()"
        >
          刷新当前页面
        </VbenButton>
        <VbenButton
          class="mx-4"
          size="sm"
          variant="default"
          @click="() => GridApi.reload()"
        >
          刷新并返回第一页
        </VbenButton>
      </template>
    </Grid>
  </Page>
</template>
