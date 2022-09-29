import { Button, Form, Input, Spin, Alert, Space } from 'antd';
import React, { useState } from 'react';
import { fetchRegistration } from '../../api';
import { useCookies } from 'react-cookie';

const Registration = ({ setStep }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cookies, setCookie] = useCookies();

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const onFinish = async ({
    email,
    username,
    first_name,
    last_name,
    middle_name,
    password
  }) => {
    try {
      setLoading(true);
      const res = await fetchRegistration({
        email,
        username,
        first_name,
        last_name,
        middle_name,
        password
      });
      if (res.access) {
        setCookie('token', res.access);
      } else {
        setError(res.email);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        name="registration"
        labelCol={{
          span: 8
        }}
        wrapperCol={{
          span: 16
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'Введите Email!'
            }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="username" name="username">
          <Input />
        </Form.Item>

        <Form.Item
          label="Фамилия"
          name="last_name"
          rules={[
            {
              required: true,
              message: 'Введите фамилия!'
            }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Имя"
          name="first_name"
          rules={[
            {
              required: true,
              message: 'Введите имя!'
            }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Отчество" name="middle_name">
          <Input />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[
            {
              required: true,
              message: 'Введите пароль!'
            }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16
          }}
        >
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => setStep('login')}
            >
              Назад
            </Button>
            <Button type="primary" htmlType="submit">
              Зарегистрироваться
            </Button>
          </Space>
        </Form.Item>
      </Form>
      {!!error && <Alert closable message={error} type="error" />}
    </Spin>
  );
};

export default Registration;
