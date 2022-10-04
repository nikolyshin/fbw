import { Button, Modal, Result } from 'antd';
import React from 'react';

const ModalError = ({ show, setShow, title = '', subtitle = '' }) => {
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
          status="error"
          title={title}
          subTitle={subtitle}
          // extra={[
          //   <Button type="primary" key="console">
          //     Go Console
          //   </Button>,
          //   <Button key="buy">Buy Again</Button>
          // ]}
        />
      </Modal>
    </>
  );
};

export default ModalError;
