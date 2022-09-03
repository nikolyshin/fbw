import { Alert, Form, Input, InputNumber, Modal, Space, Spin } from "antd";
import React from "react";
import { useState } from "react";
import { fetchWarehousesCreateIncomes } from "../api";

const ModalOtgruzka = ({ title, visible, onCancel, fields }) => {
  const [loading, setLoading] = useState(false);
  const layout = {
    labelCol: {
      span: 5,
    },
    wrapperCol: {
      span: 19,
    },
  };

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await fetchWarehousesCreateIncomes([values]);
      console.log(res);
      // if (res.access) {
      //   setCookie("token", res.access);
      // } else {
      //   setError(res.detail);
      // }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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
            // form.resetFields();
            onFinish(values);
            onCancel();
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
    >
      <Spin spinning={loading}>
        <Form form={form} {...layout} fields={fields}>
          {fields.map(({ name, value, disabled }, i) => (
            <Form.Item key={i} name={name} label={name}>
              <Input disabled={disabled} min={0} />
            </Form.Item>
          ))}
        </Form>
      </Spin>
    </Modal>
  );
};

export default ModalOtgruzka;
