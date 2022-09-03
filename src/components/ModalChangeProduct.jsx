import { Form, Input, Modal } from "antd";
import React from "react";

const ModalChangeProduct = ({ title, visible, onCreate, onCancel, fields }) => {
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
        // form
        //   .validateFields()
        //   .then((values) => {
        //     form.resetFields();
        //     onCreate(values);
        //   })
        //   .catch((info) => {
        //     console.log('Validate Failed:', info);
        //   });
      }}
    >
      <Form form={form} {...layout} fields={fields}>
        {fields.map(({ name, value }, i) => (
          <Form.Item key={i} name={name} label={name}>
            <Input />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default ModalChangeProduct;
