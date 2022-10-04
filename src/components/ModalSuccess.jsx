import { Button, Modal, Result } from 'antd';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

const ModalSuccess = ({ show, setShow, title = '', subtitle = '' }) => {
  const handleOk = () => {
    setShow(false);
  };

  const handleCancel = () => {
    setShow(false);
  };

  return (
    <>
      <Modal
        footer={null}
        visible={show}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Result
          status="success"
          title={title}
          subTitle={subtitle}
          // extra={[
          //   <Button type="primary" key="console">
          //     Go Console
          //   </Button>,
          //   <Button key="buy"></Button>
          // ]}
        />
      </Modal>
    </>
  );
};

export default ModalSuccess;
