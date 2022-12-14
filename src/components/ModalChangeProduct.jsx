import { Alert, Button, Form, Input, Modal, Space, Spin } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { fetchGoodsBackup } from '../api';
import { dateTimeFormat, names } from './helpers';
const { TextArea } = Input;

const ModalChangeProduct = ({
  id,
  loading,
  error,
  visible,
  onCancel,
  onFinish,
  fields,
  characteristics
}) => {
  const [draft, setDraft] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const currentDraft = useRef([]);
  const [step, setStep] = useState(0);

  const formItems = (array = [], step) => {
    return array.map(
      (item, i) =>
        item &&
        !['characteristics', 'id', 'link', 'stock_color'].includes(item[0]) && (
          <Form.Item
            key={i}
            name={step === 0 ? item.name : item[0]}
            label={
              step === 0
                ? names[item.name] || item.name
                : names[item[0]] || item[0]
            }
          >
            {(item.name || item[0]) !== 'Описание' ? (
              <Input
                disabled={
                  ![
                    'Описание',
                    'Наименование',
                    'price',
                    'discount_price',
                    'multiplicity',
                    'discount'
                  ].includes(item.name || item[0])
                }
              />
            ) : (
              <TextArea
                style={{
                  height: 120
                }}
              />
            )}
          </Form.Item>
        )
    );
  };

  const layout = {
    labelCol: {
      span: 5
    },
    wrapperCol: {
      span: 20
    }
  };
  const [form] = Form.useForm();
  const [form2] = Form.useForm();

  const getBackup = async () => {
    try {
      const res = await fetchGoodsBackup({ id });
      if (res.status === 200) {
        setDraft(res.data);
      } else {
        console.log(...Object.values(res.data));
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
      width={'70%'}
      visible={visible}
      title={step === 0 ? 'Изменение товара' : 'Драфт товара'}
      okText={step === 0 ? 'Изменить' : 'Отправить повторно'}
      cancelText="Отмена"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form2
              .validateFields()
              .then((values2) => {
                onFinish({
                  ...values,
                  characteristics: Object.entries(values2).map((item) => {
                    let obj = {};
                    obj[item[0]] = item[1];
                    return obj;
                  })
                });
              })
              .catch((info) => {
                console.log('Validate Failed:', info);
              });
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
              : Object.entries(currentDraft?.current?.backup_data).map(
                  (item) => {
                    return { name: item[0], value: item[1] };
                  }
                )
          }
        >
          {formItems(
            step === 0
              ? fields
              : Object.entries(currentDraft?.current?.backup_data),
            step
          )}
        </Form>

        <Form
          form={form2}
          {...layout}
          fields={
            step === 0
              ? characteristics
              : currentDraft?.current?.backup_data?.characteristics?.map(
                  (item) => {
                    return {
                      name: Object.keys(item)[0],
                      value: Object.values(item)[0]
                    };
                  }
                )
          }
        >
          <p style={{ fontSize: '24px', textAlign: 'center' }}>
            Характеристики
          </p>
          {formItems(
            step === 0
              ? characteristics
              : currentDraft?.current?.backup_data?.characteristics?.map(
                  (item) => {
                    return {
                      name: Object.keys(item)[0],
                      value: Object.values(item)[0]
                    };
                  }
                ),
            0
          )}
        </Form>
        <Space style={{ width: '100%' }} direction="vertical">
          {step === 0 && (
            <>
              {showAll
                ? draft?.map((item) => (
                    <Alert
                      key={item.id}
                      message={moment(item.run_dt).format(dateTimeFormat)}
                      type="info"
                      onClick={() => {
                        currentDraft.current = item;
                        setStep(1);
                      }}
                    />
                  ))
                : draft?.slice(0, 3).map((item) => (
                    <Alert
                      key={item.id}
                      message={moment(item.run_dt).format(dateTimeFormat)}
                      type="info"
                      onClick={() => {
                        currentDraft.current = item;
                        setStep(1);
                      }}
                    />
                  ))}
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? 'Скрыть' : 'Показать все'}
              </Button>
            </>
          )}
          {step === 1 && currentDraft.current.description && (
            <Alert message={currentDraft.current.description} type="warning" />
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
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </Modal>
  );
};

export default ModalChangeProduct;
