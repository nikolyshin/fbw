import {
  fetchEditProduct,
  fetchGoodsList,
  fetchGoodsListFilters,
} from "../api";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Spin, Table, Alert, Divider, Input } from "antd";
import ModalChangeProduct from "./ModalChangeProduct";
const { Search } = Input;

const GoodList = ({ currentWbKey }) => {
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [errorEdit, setErrorEdit] = useState(null);
  const [search, setSearch] = useState(null);
  const [error, setError] = useState("");
  const [goods, setGoods] = useState([]);
  const [filters, setFilters] = useState({});
  const idRef = useRef(null);
  const [modalData, setModalData] = useState({
    data: [],
    visible: false,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const onFinish = async (data) => {
    try {
      setLoadingEdit(true);
      const res = await fetchEditProduct(idRef.current, data);
      if (!res.detail) {
        setModalData((prev) => {
          return { ...prev, visible: false };
        });
      } else {
        setErrorEdit(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingEdit(false);
    }
  };

  const getGoodsListFilters = async () => {
    try {
      setLoading(true);
      const res = await fetchGoodsListFilters({
        wbKey: currentWbKey,
      });
      if (!res.detail) {
        setFilters(res);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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
        limit: pagination?.pageSize,
        offset: (pagination?.current - 1) * pagination?.pageSize || null,
        category: filters?.category,
        price: filters?.price,
        discount: filters?.discount,
      });
      if (res.results) {
        setGoods(res.results);
        setPagination((prev) => {
          return {
            ...prev,
            pageSize: pagination?.pageSize,
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
    getGoodsListFilters();
  }, [currentWbKey]);

  useEffect(() => {
    getGoodsList();
  }, [currentWbKey, search]);

  const columns = useMemo(() => {
    if (Object.keys(filters).length) {
      return [
        {
          title: "Категории",
          dataIndex: "category",
          key: "category",
          filters: filters?.categories?.map((item) => {
            return { text: item, value: item };
          }),
          sorter: true,
        },
        {
          title: "Группа товара",
          dataIndex: "subject",
          key: "subject",
          sorter: true,
        },
        {
          title: "brand",
          dataIndex: "brand",
          key: "brand",
        },
        {
          title: "Арт. WB",
          dataIndex: "article_wb",
          key: "article_wb",
        },
        {
          title: "Арт. 1С",
          dataIndex: "article_1c",
          key: "article_1c",
        },
        {
          title: "БарКод",
          dataIndex: "barcode",
          key: "barcode",
        },
        {
          title: "Остаток",
          dataIndex: "stock",
          key: "stock",
        },
        {
          title: "discount",
          dataIndex: "discount",
          sorter: true,
          key: "discount",
          filters: filters?.discounts?.map((item) => {
            return { text: item, value: item };
          }),
        },
        {
          title: "Цена",
          dataIndex: "price",
          sorter: true,
          key: "price",
          filters: filters?.prices?.map((item) => {
            return { text: item, value: item };
          }),
        },
      ];
    }
  }, [filters]);

  return (
    <>
      <Search
        style={{ width: "50%" }}
        placeholder="Поиск"
        loading={loading}
        enterButton
        allowClear
        onSearch={setSearch}
      />
      <Divider />
      <Spin spinning={loading}>
        <Table
          size="small"
          bordered
          columns={columns}
          scroll={{ x: true }}
          dataSource={goods}
          sticky={{ offsetHeader: 140 }}
          pagination={pagination}
          onChange={getGoodsList}
          onRow={(record) => {
            return {
              onDoubleClick: () => {
                idRef.current = record.id;
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
        loading={loadingEdit}
        error={errorEdit}
        fields={modalData.data}
        onFinish={onFinish}
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
