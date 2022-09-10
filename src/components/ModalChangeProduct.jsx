import { Alert, Form, Input, Modal, Spin } from "antd";
import React from "react";

const ModalChangeProduct = ({
  title,
  loading,
  error,
  visible,
  onCancel,
  onFinish,
  fields,
}) => {
  const layout = {
    labelCol: {
      span: 5,
    },
    wrapperCol: {
      span: 19,
    },
  };

  const [form] = Form.useForm();

  return (
    <Modal
      visible={visible}
      title={title}
      okText="Изменить"
      cancelText="Отмена"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onFinish(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
    >
      <Spin spinning={loading}>
        <Form form={form} {...layout} fields={fields}>
          {fields.map(({ name }, i) => (
            <Form.Item
              key={i}
              name={name}
              label={name}
              rules={[
                {
                  required: true,
                  message: `Введите ${name}!`,
                },
              ]}
            >
              <Input />
            </Form.Item>
          ))}
        </Form>
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </Modal>
  );
};

export default ModalChangeProduct;
