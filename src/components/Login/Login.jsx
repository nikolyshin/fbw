import { Button, Form, Input } from 'antd';
import React from 'react';
import { fetchToken } from '../../api';
import "./Login.css";

const Login = ({ setAuth }) => {

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const onFinish = async ({ email, password }) => {
    try {
      // setLoader(true);
      const res = await fetchToken({
        email,
        password,
      });
      console.log(res)
      if (res.success) {

      } else {
        // setError(res.error.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      // setLoader(false);
    }
  };

  return (
    <div className='loginWrapper'>
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
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
              message: 'Please input your Email!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
            Войти
          </Button>
        </Form.Item>
      </Form>
    </div>

  );
};

export default Login;