<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

defineOptions({
  name: 'CreateFormModel',
});

function onSubmit(values: Record<string, any>) {
  message.info(JSON.stringify(values)); // 只会执行一次
}

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'field1',
      label: '字段1',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'field2',
      label: '字段2',
      rules: '',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
        ],
        placeholder: '请输入',
      },
      fieldName: 'field3',
      label: '字段3',
      rules: '',
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  cancelText: '取消',
  class: 'w-[680px]',
  closable: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  confirmLoading: true,
  confirmText: '确认',
  description: '内嵌表单示例',
  draggable: true,
  footer: true,
  fullscreenButton: true,
  loading: true,
  modal: true,
  onBeforeClose() {
    // 关闭前的回调，返回 false 可以阻止关闭
    return true;
  },
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formApi.submitForm();
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // 获取弹窗父级传参数据
      const { title, values } = modalApi.getData<Record<string, any>>();
      // eslint-disable-next-line no-console
      console.log(title);
      modalApi.setState({ title });
      if (values) {
        formApi.setValues(values);

        setTimeout(() => {
          modalApi.setState({ confirmLoading: false, loading: false });
        }, 2000);
      }
    }
  },
  title: '数据新增',
});
</script>
<template>
  <Modal><Form /></Modal>
</template>
