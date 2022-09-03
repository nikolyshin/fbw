import {
  fetchWarehouses,
  fetchWarehousesBackground,
  fetchWarehousesOrders,
} from "../api";
import React, { useEffect, useMemo, useState } from "react";
import { Spin, Table, Alert } from "antd";
import moment from "moment";
import ModalChangeProduct from "./ModalChangeProduct";
import ModalOtgruzka from "./ModalOtgruzka";

const staticColumns = [
  {
    title: "Категории",
    dataIndex: "category",
    key: "category",
    fixed: "left",
    width: 150,
  },
  {
    title: "Имя",
    dataIndex: "subject",
    key: "subject",
    fixed: "left",
    width: 150,
  },
  {
    title: "Артикул WB",
    dataIndex: "article_wb",
    key: "article_wb",
    fixed: "left",
    width: 150,
  },
];

const Stats = ({ currentWbKey, date }) => {
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingBackground, setLoadingBackground] = useState(false);
  const [error, setError] = useState("");
  const [columnsBackground, setColumnsBackground] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [warehousesBackground, setWarehousesBackground] = useState([]);
  const [warehousesOrders, setWarehousesOrders] = useState([]);
  const [modalData, setModalData] = useState({
    data: [],
    visible: false,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    showSizeChanger: false,
  });

  const onCreate = (values) => {
    console.log("Received values of form: ", values);
    // setVisible(false);
  };

  const getWarehousesOrders = async (pagination, filters, sorter) => {
    let ordering;
    if (!!sorter) {
      ordering = sorter.order
        ? `${sorter.order === "ascend" ? "" : "-"}${sorter.field}`
        : null;
    }
    try {
      setLoadingOrders(true);
      const res = await fetchWarehousesOrders({
        wbKey: currentWbKey,
        page: pagination?.current,
        date_from: moment(date[0]).format("YYYY-MM-DD"),
        date_to: moment(date[1]).format("YYYY-MM-DD"),
        ordering,
      });
      if (!res?.detail) {
        setWarehousesOrders(res?.results);
        setPagination((prev) => {
          return {
            ...prev,
            current: pagination?.current,
            total: Math.ceil(res.count),
          };
        });
      } else {
        setError(res?.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getWarehousesBackground = async () => {
    try {
      setLoadingBackground(true);
      const res = await fetchWarehouses({
        wbKey: currentWbKey,
      });
      if (!res.detail) {
        setWarehousesBackground(res);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingBackground(false);
    }
  };

  useEffect(() => {
    getWarehousesOrders();
  }, [currentWbKey, date]);

  useEffect(() => {
    getWarehousesBackground();
  }, []);

  useEffect(() => {
    if (!!warehousesBackground.length) {
      const arr = [];
      warehousesBackground.forEach((item) => {
        arr.push(
          {
            title: `Кол-во на складе ${item.name}`,
            dataIndex: `count_${item.id}`,
            key: `count_${item.id}`,
            width: 150,
            onCell: (record) => {
              return {
                onClick: () => {
                  setModalData({
                    visible: true,
                    data: [
                      {
                        name: "Имя",
                        value: record.subject,
                        disabled: true,
                      },
                      {
                        name: "item_id",
                        value: record.id,
                        disabled: true,
                      },
                      {
                        name: "warehouse_id",
                        value: record.stocks.filter(
                          (stock) => stock.warehouse_id === item.id
                        )[0]?.warehouse_id,
                        disabled: true,
                      },
                      {
                        name: "warehouse_name",
                        value: record.stocks.filter(
                          (stock) => stock.warehouse_id === item.id
                        )[0]?.warehouse_name,
                        disabled: true,
                      },
                      {
                        name: "quantity",
                        value: record.stocks.filter(
                          (stock) => stock.warehouse_id === item.id
                        )[0]?.incomes_plan,
                      },
                      { name: "Факт поставки" },
                    ],
                  });
                },
              };
            },
          },
          {
            title: `Продаж на складе ${item.name}`,
            dataIndex: `sales_${item.id}`,
            key: `sales_${item.id}`,
            width: 150,
            onCell: (record) => {
              return {
                onClick: () => {
                  setModalData({
                    visible: true,
                    data: [
                      {
                        name: "Имя",
                        value: record.subject,
                        disabled: true,
                      },
                      {
                        name: "item_id",
                        value: record.id,
                        disabled: true,
                      },
                      {
                        name: "warehouse_id",
                        value: record.stocks.filter(
                          (stock) => stock.warehouse_id === item.id
                        )[0]?.warehouse_id,
                        disabled: true,
                      },
                      {
                        name: "warehouse_name",
                        value: record.stocks.filter(
                          (stock) => stock.warehouse_id === item.id
                        )[0]?.warehouse_name,
                        disabled: true,
                      },
                      {
                        name: "quantity",
                        value: record.stocks.filter(
                          (stock) => stock.warehouse_id === item.id
                        )[0]?.incomes_plan,
                      },
                      { name: "Факт поставки" },
                    ],
                  });
                },
              };
            },
          }
        );
      });

      setColumnsBackground(arr);
    }
  }, [warehousesBackground]);

  useEffect(() => {
    if (!!warehousesOrders.length) {
      const arr = [];
      warehousesOrders.forEach((item) => {
        const obj = { ...item };
        item.stocks.map((el) => {
          obj[`sales_${el.warehouse_id}`] = el.orders;
          obj[`count_${el.warehouse_id}`] = el.quantity;
        });
        arr.push(obj);
      });
      setDataSource(arr);
    }
  }, [warehousesOrders]);

  return (
    <>
      <Spin spinning={loadingOrders}>
        <Table
          scroll={{ x: true }}
          pagination={pagination}
          onChange={getWarehousesOrders}
          columns={[...staticColumns, ...columnsBackground]}
          dataSource={dataSource}
        />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
      <ModalOtgruzka
        title={"Задача на отгрузку"}
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

export default Stats;
