import { Button, Result } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => (
  <Result
    status="404"
    title="404"
    subTitle="Такая страница не найдена"
    extra={
      <Link to="/">
        <Button type="primary">На главную</Button>
      </Link>
    }
  />
);

export default PageNotFound;
