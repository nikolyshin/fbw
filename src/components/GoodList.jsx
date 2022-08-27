import { fetchGoodsList } from "../api";
import React, { useEffect, useState } from "react";
import { Spin, Table, Alert, Segmented, Divider, Input } from "antd";
const { Search } = Input;

const sortingTabs = [
  { value: "subject", label: "subject" },
  { value: "-subject", label: "-subject" },
  { value: "category", label: "category" },
  { value: "-category", label: "-category" },
  { value: "price", label: "Сначала недорогие" },
  { value: "-price", label: "Сначала дорогие" },
  { value: "discount", label: "discount" },
  { value: "-discount", label: "-discount" },
];

const GoodList = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(null);
  const [error, setError] = useState("");
  const [goods, setGoods] = useState([]);
  const [currentOrdering, setCurrentOrdering] = useState(null);

  const getGoodsList = async () => {
    try {
      setLoading(true);
      const res = await fetchGoodsList({
        wbKey: currentWbKey,
        ordering: currentOrdering,
        search,
      });
      if (!res.detail) {
        setGoods(res);
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
  }, [currentWbKey, currentOrdering, search]);

  const columns = [
    {
      title: "Категории",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Имя",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Артикул WB",
      dataIndex: "article_wb",
      key: "article_wb",
    },
    {
      title: "Артикул 1С",
      dataIndex: "article_1c",
      key: "article_1c",
    },
    {
      title: "БарКод",
      dataIndex: "barcode",
      key: "barcode",
    },
    {
      title: "Остаток на складе",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "discount",
      dataIndex: "discount",
      key: "discount",
    },
    {
      title: "Цена",
      dataIndex: "price",
      key: "price",
    },
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
        <Table columns={columns} dataSource={goods} />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default GoodList;
