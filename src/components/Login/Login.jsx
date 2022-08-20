import { Button, Form, Input, Spin, Alert } from "antd";
import React, { useState } from "react";
import { fetchToken } from "../../api";
import { useCookies } from 'react-cookie';
import "./Login.css";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cookies, setCookie] = useCookies();

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onFinish = async ({ email, password }) => {
    try {
      setLoading(true);
      const res = await fetchToken({
        email,
        password,
      });
      if (res.access) {
        setCookie("token",res.access)
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
    <div className="loginWrapper">
      <Spin spinning={loading}>
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
                message: "Please input your Email!",
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
                message: "Please input your password!",
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
        {!!error && <Alert closable message={error} type="error" />}
      </Spin>
    </div>
  );
};

export default Login;
