import { Modal } from 'antd';
import React from 'react';
import { useCookies } from 'react-cookie';

const ModalLogout = ({ show, setShow }) => {
  const [cookie, setCookie, removeCookie] = useCookies(['token']);

  const handleOk = () => {
    setShow(false);
    localStorage.clear();
    removeCookie('token');
  };

  const handleCancel = () => {
    setShow(false);
  };

  return (
    <>
      <Modal
        title="Выход из профиля"
        visible={show}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Вы уверены, что хотите выйти?</p>
      </Modal>
    </>
  );
};

export default ModalLogout;
