import { Button, Form, Input, Spin, Alert, Space } from 'antd';
import React, { useState } from 'react';
import { fetchToken } from '../../api';
import { useCookies } from 'react-cookie';

const Login = ({ setStep }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cookies, setCookie] = useCookies();

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const onFinish = async ({ email, password }) => {
    try {
      setLoading(true);
      const res = await fetchToken({
        email,
        password
      });
      if (res.access) {
        setCookie('token', res.access);
      } else {
        setError(res.detail);
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
        name="login"
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
            <Button type="primary" htmlType="submit">
              Войти
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => setStep('registration')}
            >
              Перейти к регистрации
            </Button>
          </Space>
        </Form.Item>
      </Form>
      {!!error && <Alert closable message={error} type="error" />}
    </Spin>
  );
};

export default Login;
