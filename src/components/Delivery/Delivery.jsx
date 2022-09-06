import {
  fetchGetGoodsIncomes,
  fetchGoodsIncomes,
  fetchSetStatus
} from '../../api';
import React, { useEffect, useState } from 'react';
import './Delivery.css';
import { Spin, Table, Alert, Input, Select } from 'antd';

import ModalChangeProduct from '../ModalChangeProduct';
import { useRef } from 'react';

const Delivery = ({ currentWbKey }) => {
  const { Option } = Select;
  const idRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [detail, setDetail] = useState([]);
  const [modalData, setModalData] = useState({
    data: [],
    visible: false
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    showSizeChanger: false
  });

  const statuses = ['Заказано поставщику', 'В пути на WB', 'Принято на склад'];

  const onCreate = () => {
    setModalData((prev) => {
      return { ...prev, visible: false };
    });
  };

  const getGetGoodsList = async (id) => {
    try {
      setLoading(true);
      const res = await fetchGetGoodsIncomes(id);
      if (res.incomes) {
        setDetail(res.incomes);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (data) => {
    try {
      setLoading(true);
      const res = await fetchSetStatus(idRef.current, { status: data });
      if (res.incomes) {
        setDetail(res.incomes);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getGoodsList = async (pagination) => {
    try {
      setLoading(true);
      const res = await fetchGoodsIncomes({
        wbKey: currentWbKey,
        page: pagination?.current
      });
      if (res.results) {
        setGoods(res.results);
        setPagination((prev) => {
          return {
            ...prev,
            current: pagination?.current,
            total: Math.ceil(res.count)
          };
        });
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGoodsList();
  }, [currentWbKey]);

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Склад',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name'
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Номер поставки',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, record) => (
        <Input placeholder="Номер поставки" defaultValue={record.number} />
      )
    }
  ];

  const columnsDetail = [
    {
      title: 'article',
      dataIndex: 'article',
      key: 'article'
    },
    {
      title: 'status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Select
          defaultValue={record.status}
          placeholder="Выберите статус"
          onChange={(value) => {
            setStatus(value);
          }}
          style={{
            width: 150
          }}
        >
          {statuses?.map((item, i) => (
            <Option key={i} value={item}>
              {item}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'item_name',
      dataIndex: 'item_name',
      key: 'item_name'
    },
    {
      title: 'quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    }
  ];

  return (
    <div className="table">
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={goods}
          pagination={pagination}
          onChange={getGoodsList}
          onRow={(record) => {
            return {
              onDoubleClick: (e) => {
                idRef.current = record.id;
                getGetGoodsList(record.id);
              }
            };
          }}
        />
      </Spin>
      <Spin spinning={loading}>
        <Table columns={columnsDetail} dataSource={detail} pagination={false} />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
      <ModalChangeProduct
        title={'Изменение товара'}
        visible={modalData.visible}
        fields={modalData.data}
        onCreate={onCreate}
        onCancel={() => {
          setModalData((prev) => {
            return { ...prev, visible: false };
          });
        }}
      />
    </div>
  );
};

export default Delivery;
