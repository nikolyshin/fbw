import { fetchGoodsList } from "../api";
import React, { useEffect, useState } from "react";
import {
  Spin,
  Table,
  Alert,
  Segmented,
  Divider,
  Input,
  Button,
  Space,
} from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import ModalChangeProduct from "./ModalChangeProduct";
const { Search } = Input;

// const sortingTabs = [
//   { value: "subject", label: "subject" },
//   { value: "-subject", label: "-subject" },
//   { value: "category", label: "category" },
//   { value: "-category", label: "-category" },
//   { value: "price", label: "Сначала недорогие" },
//   { value: "-price", label: "Сначала дорогие" },
//   { value: "discount", label: "discount" },
//   { value: "-discount", label: "-discount" },
// ];

const GoodList = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(null);
  const [error, setError] = useState("");
  const [goods, setGoods] = useState([]);
  // const [currentOrdering, setCurrentOrdering] = useState(null);
  const [modalData, setModalData] = useState({
    data: [],
    visible: false,
  });
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [priceFilter, setPriceFilter] = useState(null);
  const [discountFilter, setDiscountFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    showSizeChanger: false,
  });

  const onCreate = () => {
    setModalData((prev) => {
      return { ...prev, visible: false };
    });
  };

  const getGoodsList = async (pagination, filters, sorter) => {
    let ordering;
    if (!!sorter) {
      ordering = sorter.order
        ? `${sorter.order === "ascend" ? "" : "-"}${sorter.field}`
        : null;
    }

    try {
      setLoading(true);
      const res = await fetchGoodsList({
        wbKey: currentWbKey,
        ordering,
        search,
        page: pagination?.current,
        category: categoryFilter,
        price: priceFilter,
        discount: discountFilter,
      });
      if (res.results) {
        setGoods(res.results);
        setPagination((prev) => {
          return {
            ...prev,
            current: pagination?.current,
            total: Math.ceil(res.count),
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
  }, [
    currentWbKey,
    // currentOrdering,
    search,
    categoryFilter,
    priceFilter,
    discountFilter,
  ]);

  const columns = [
    {
      title: "",
      dataIndex: "edit",
      key: "edit",
      render: (_, record) => (
        <a
          onClick={() => {
            setModalData({
              visible: true,
              data: Object.entries(record).map((item) => {
                return { name: item[0], value: item[1] };
              }),
            });
          }}
        >
          Изменить {record.name}
        </a>
      ),
    },
    {
      title: "Категории",
      dataIndex: "category",
      key: "category",
      sorter: true,
      onCell: (record) => {
        return {
          onDoubleClick: () => {
            setCategoryFilter(record.category);
          },
        };
      },
    },
    {
      title: "Имя",
      dataIndex: "subject",
      key: "subject",
      sorter: true,
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
      sorter: true,
      key: "discount",
      onCell: (record) => {
        return {
          onDoubleClick: () => {
            setDiscountFilter(record.discount);
          },
        };
      },
    },
    {
      title: "Цена",
      dataIndex: "price",
      sorter: true,
      key: "price",
      onCell: (record) => {
        return {
          onDoubleClick: () => {
            setPriceFilter(record.price);
          },
        };
      },
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
      <Space>
        {!!categoryFilter && (
          <Button
            icon={<CloseCircleOutlined />}
            onClick={() => setCategoryFilter(null)}
          >
            {categoryFilter}
          </Button>
        )}
        {!!discountFilter && (
          <Button
            icon={<CloseCircleOutlined />}
            onClick={() => setDiscountFilter(null)}
          >
            {discountFilter}
          </Button>
        )}
        {!!priceFilter && (
          <Button
            icon={<CloseCircleOutlined />}
            onClick={() => setPriceFilter(null)}
          >
            {priceFilter}
          </Button>
        )}
      </Space>

      <Divider />
      {/* <Segmented
        options={sortingTabs}
        value={currentOrdering}
        onChange={setCurrentOrdering}
      />
      <Divider /> */}

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={goods}
          pagination={pagination}
          onChange={getGoodsList}
          onRow={(record) => {
            return {
              onContextMenu: (e) => {
                setModalData({
                  visible: true,
                  data: Object.entries(record).map((item) => {
                    return { name: item[0], value: item[1] };
                  }),
                });
              },
            };
          }}
        />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
      <ModalChangeProduct
        title={"Изменение товара"}
        visible={modalData.visible}
        fields={modalData.data}
        onCreate={onCreate}
        onCancel={() => {
          setModalData((prev) => {
            return { ...prev, visible: false };
          });
        }}
      />
    </>
  );
};

export default GoodList;
