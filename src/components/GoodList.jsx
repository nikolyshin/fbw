import { fetchGoodsList } from '../api';
import React, { useEffect, useState } from 'react';
import {
  Spin,
  Table,
  Alert,
  Segmented,
  Divider,
  Input,
  Modal,
  Button,
  Form,
  InputNumber
} from 'antd';
const { Search } = Input;

const sortingTabs = [
  { value: 'subject', label: 'subject' },
  { value: '-subject', label: '-subject' },
  { value: 'category', label: 'category' },
  { value: '-category', label: '-category' },
  { value: 'price', label: 'Сначала недорогие' },
  { value: '-price', label: 'Сначала дорогие' },
  { value: 'discount', label: 'discount' },
  { value: '-discount', label: '-discount' }
];

const GoodList = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(null);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [currentOrdering, setCurrentOrdering] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [priceFilter, setPriceFilter] = useState(null);
  const [discountFilter, setDiscountFilter] = useState(null);
  const [currentRowData, setCurrentRowData] = useState([]);

  const layout = {
    labelCol: {
      span: 5
    },
    wrapperCol: {
      span: 19
    }
  };

  const getGoodsList = async () => {
    try {
      setLoading(true);
      const res = await fetchGoodsList({
        wbKey: currentWbKey,
        ordering: currentOrdering,
        search,
        category: categoryFilter,
        price: priceFilter,
        discount: discountFilter
      });
      if (res.results) {
        setGoods(res.results);
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
  }, [
    currentWbKey,
    currentOrdering,
    search,
    categoryFilter,
    priceFilter,
    discountFilter
  ]);

  const onFinish = (values) => {
    console.log(values);
  };

  const columns = [
    {
      title: 'Категории',
      dataIndex: 'category',
      key: 'category',
      onCell: (record) => {
        return {
          onDoubleClick: () => {
            setCategoryFilter(record.category);
          }
        };
      }
    },
    {
      title: 'Имя',
      dataIndex: 'subject',
      key: 'subject'
    },
    {
      title: 'Артикул WB',
      dataIndex: 'article_wb',
      key: 'article_wb'
    },
    {
      title: 'Артикул 1С',
      dataIndex: 'article_1c',
      key: 'article_1c'
    },
    {
      title: 'БарКод',
      dataIndex: 'barcode',
      key: 'barcode'
    },
    {
      title: 'Остаток на складе',
      dataIndex: 'stock',
      key: 'stock'
    },
    {
      title: 'discount',
      dataIndex: 'discount',
      key: 'discount',
      onCell: (record) => {
        return {
          onDoubleClick: () => {
            setDiscountFilter(record.discount);
          }
        };
      }
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      onCell: (record) => {
        return {
          onDoubleClick: () => {
            setPriceFilter(record.price);
          }
        };
      }
    }
  ];

  return (
    <>
      <Search
        placeholder="введите значение(пока не знаю по какому полю ищем) просто параметр search"
        loading={loading}
        enterButton
        allowClear
        onSearch={setSearch}
      />
      <Divider />
      <Segmented
        options={sortingTabs}
        value={currentOrdering}
        onChange={setCurrentOrdering}
      />
      <Divider />

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={goods}
          onRow={(record) => {
            return {
              onContextMenu: (e) => {
                setCurrentRowData(Object.entries(record));
                setIsModalVisible(true);
              }
            };
          }}
        />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
      <Modal
        title="Изменение товара"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form {...layout} onFinish={onFinish}>
          {currentRowData.map((item) => (
            <Form.Item name={item[0]} label={item[0]}>
              <Input defaultValue={item[1]} />
            </Form.Item>
          ))}

          <Form.Item
            wrapperCol={{
              offset: 5,
              span: 19
            }}
          >
            <Button type="primary" htmlType="submit">
              Применить
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GoodList;
