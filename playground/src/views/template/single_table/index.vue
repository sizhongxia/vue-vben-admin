<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { VbenButton } from '@vben-core/shadcn-ui';

import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLowcodeMenuPageData, getLowcodeMenuPageInfo } from '#/api';

import CreateFormModal from '../models/create-form.vue';

const title = ref('页面标题');
const description = ref('页面描述');

const tableSearchFormOptionSchema: any = [];

let metaObjectCode = '';
let isFirstPage = false;

const [BasicCreateFormModal, basicCreateFormModalApi] = useVbenModal({
  connectedComponent: CreateFormModal,
});

const [VxeGrid, VxeGridApi] = useVbenVxeGrid({
  gridEvents: {
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
      // isFirstPage = true;
      VxeGridApi.query({
        page: {
          currentPage: 1,
        },
      });
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
      VxeGridApi.query();
    },
  },
  gridOptions: {
    proxyConfig: {
      ajax: {
        query: loadTableData,
      },
      autoLoad: false,
      enabled: true,
      filter: true,
      sort: true,
    },
  },
});

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

async function loadTableData(data: any) {
  // eslint-disable-next-line no-console
  console.info('data >>>', data);
  const { filters, page, sort } = data;
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
    filters.forEach((item: any) => {
      conditions.push({
        field: item.field,
        type: 'in',
        values: item.values,
      });
    });
  }

  const formValues = VxeGridApi.formApi?.form.values;
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
        tableSearchFormOptionSchema.forEach((item: any) => {
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

  const currentPage = isFirstPage ? 1 : page.currentPage;

  const result = await getLowcodeMenuPageData({
    condition,
    currentPage,
    metaObjectCode,
    pageSize: page.pageSize,
    sorts: sortArr,
  });

  // if (isFirstPage && page.currentPage > 1) {
  //   VxeGridApi.setState({
  //     gridOptions: {
  //       pagerConfig: {
  //         currentPage: result.currentPage,
  //         size: result.pageSize,
  //       },
  //     },
  //   });
  // }
  if (isFirstPage) {
    isFirstPage = false;
  }
  return result;
}

function openBasicCreateFormModal() {
  basicCreateFormModalApi.setData({
    title: '新增数据',
    values: { field1: 'abc' },
  });
  basicCreateFormModalApi.open();
}

onMounted(async () => {
  const route = useRoute();
  const query: any = route.meta.query;
  const pageInfo = await getLowcodeMenuPageInfo(query.menuId);

  title.value = pageInfo?.title;
  description.value = pageInfo?.description;

  metaObjectCode = pageInfo?.metaObjectCode;

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
      tableSearchFormOptionSchema.push({
        // 组件需要在 #/adapter.ts内注册，并加上类型
        component: item.component,
        // 对应组件的参数
        componentProps: {
          placeholder: item.placeholder || '',
          ...options,
        },
        defaultValue: item.defaultValue,
        description: item.description || '',
        disabled: false,
        // 字段名
        fieldName: item.fieldName,
        help: item.help || '',
        // 界面显示的label
        label: item.label,
        labelWidth: item.labelWidth || 100,
        operator: item.operator || 'eq',
        rules,
      });
    });

    // // eslint-disable-next-line no-console
    // console.info('tableSearchFormOptionSchema', tableSearchFormOptionSchema);
  }

  VxeGridApi.setState({
    formOptions: {
      // 垂直布局，label和input在不同行，值为vertical
      // 水平布局，label和input在同一行，值为horizontal
      layout: formOptionConfig.layout || 'vertical',
      resetButtonOptions: {
        content: '重置',
        show: true,
      },
      schema: tableSearchFormOptionSchema,
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
    },
    gridOptions: {
      checkboxConfig: {
        highlight: true,
        labelField: 'checkbox',
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
    },
  });

  VxeGridApi.reload();
});
</script>

<template>
  <Page :description="description" :title="title" auto-content-height>
    <BasicCreateFormModal />
    <VxeGrid>
      <template #toolbar-tools>
        <VbenButton
          class="mx-4"
          size="sm"
          variant="default"
          @click="openBasicCreateFormModal"
        >
          新增
        </VbenButton>
        <!-- <VbenButton
          class="mx-4"
          size="sm"
          variant="default"
          @click="() => GridApi.reload()"
        >
          刷新并返回第一页
        </VbenButton> -->
      </template>
    </VxeGrid>
  </Page>
</template>
