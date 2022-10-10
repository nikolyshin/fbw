import { Alert, Button, Form, Input, Modal, Space, Spin } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { fetchGoodsBackup } from '../api';

const ModalChangeProduct = ({
  id,
  loading,
  error,
  visible,
  onCancel,
  onFinish,
  fields
}) => {
  const [draft, setDraft] = useState(null);
  const currentDraft = useRef([]);
  const [step, setStep] = useState(0);

  const formItems = (array = [], step) => {
    return array.map((item, i) => (
      <Form.Item
        key={i}
        name={step === 0 ? item.name : item[0]}
        label={step === 0 ? item.label || item.name : item[0]}
      >
        <Input />
      </Form.Item>
    ));
  };

  const layout = {
    labelCol: {
      span: 5
    },
    wrapperCol: {
      span: 19
    }
  };
  const [form] = Form.useForm();

  const getBackup = async () => {
    try {
      const res = await fetchGoodsBackup({ id });
      if (res) {
        setDraft(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      getBackup();
    }
  }, [id]);

  return (
    <Modal
      visible={visible}
      title={step === 0 ? 'Изменение товара' : 'Драфт товара'}
      okText={step === 0 ? 'Изменить' : 'Отправить повторно'}
      cancelText="Отмена"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onFinish(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          {...layout}
          fields={
            step === 0
              ? fields
              : currentDraft.current.map((item) => {
                  return { name: item[0], value: item[1] };
                })
          }
        >
          {formItems(step === 0 ? fields : currentDraft?.current, step)}
        </Form>
        <Space style={{ width: '100%' }} direction="vertical">
          {step === 0 &&
            draft?.map((item, i) => (
              <Alert
                key={i}
                message={item.result}
                description={`${item.description} ${moment(item.run_dt).format(
                  'hh.mm.ss/DD-MM-YYYY'
                )}`}
                type="info"
                onClick={() => {
                  currentDraft.current = Object.entries(item.backup_data);
                  setStep(1);
                }}
              />
            ))}
          {step === 1 && (
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => {
                setStep(0);
              }}
            >
              Вернуться назад
            </Button>
          )}
        </Space>
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </Modal>
  );
};

export default ModalChangeProduct;
