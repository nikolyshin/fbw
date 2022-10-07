import { Alert, Button, Form, Input, Modal, Space, Spin } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
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
  const [draftDate, setDraftDate] = useState(null);
  const [draftError, setDraftError] = useState(null);
  const [step, setStep] = useState(0);

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
      if (res.backup_data) {
        setDraft(res.backup_data);
        setDraftError(res.description);
        setDraftDate(res.run_dt);
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
              : Object.entries(draft).map((item) => {
                  return { name: item[0], value: item[1] };
                })
          }
        >
          {fields.map(({ name, label }, i) => (
            <Form.Item key={i} name={name} label={label || name}>
              <Input />
            </Form.Item>
          ))}
        </Form>
        <Space style={{ width: '100%' }} direction="vertical">
          {!!draftDate && step === 1 && (
            <>
              <Alert
                message={moment(draftDate).format('YYYY-MM-DD')}
                type="info"
                closable={false}
              />
            </>
          )}
          {!!draftError && step === 1 && (
            <Alert message={draftError} type="error" />
          )}
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
        {!!draft && step === 0 && (
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => {
              setStep(1);
            }}
          >
            Показать драфт
          </Button>
        )}
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </Modal>
  );
};

export default ModalChangeProduct;
