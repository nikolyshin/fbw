import {
  fetchWarehouses,
  fetchWarehousesCreateIncomesBackup,
  fetchWarehousesOrders,
} from "../api";
import React, { useEffect, useState } from "react";
import { Spin, Table, Alert, InputNumber } from "antd";
import moment from "moment";

const staticColumns = [
  {
    title: "Категории",
    dataIndex: "category",
    key: "category",
    fixed: "left",
  },
  {
    title: "Имя",
    dataIndex: "subject",
    key: "subject",
    fixed: "left",
  },
];

const Stats = ({ currentWbKey, date, planIncomes }) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingBackground, setLoadingBackground] = useState(false);
  const [error, setError] = useState("");
  const [columnsBackground, setColumnsBackground] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [warehousesBackground, setWarehousesBackground] = useState([]);
  const [warehousesOrders, setWarehousesOrders] = useState([]);

  const createIncomesBackup = async (data) => {
    try {
      await fetchWarehousesCreateIncomesBackup({ data });
    } catch (error) {
      console.log(error);
    }
  };

  const getWarehousesOrders = async (pagination) => {
    try {
      setLoadingOrders(true);
      const res = await fetchWarehousesOrders({
        wbKey: currentWbKey,
        offset: (pagination?.current - 1) * pagination?.pageSize || null,
        planIncomes: planIncomes,
        limit: pagination?.pageSize,
        date_from: moment(date[0]).format("YYYY-MM-DD"),
        date_to: moment(date[1]).format("YYYY-MM-DD"),
      });
      if (!res?.detail) {
        setWarehousesOrders(res?.results);
        setPagination((prev) => {
          return {
            ...prev,
            pageSize: pagination?.pageSize,
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
  }, [currentWbKey, date, planIncomes]);

  useEffect(() => {
    getWarehousesBackground();
  }, []);

  useEffect(() => {
    if (!!warehousesBackground.length) {
      const arr = [];
      warehousesBackground.forEach((item) => {
        arr.push({
          title: item.name,
          children: [
            {
              title: "Кол-во",
              dataIndex: `count_${item.id}`,
              key: `count_${item.id}`,
              width: 40,
            },
            {
              title: "Прод.",
              dataIndex: `sales_${item.id}`,
              key: `sales_${item.id}`,
              width: 40,
            },
            {
              title: "План",
              dataIndex: `plane_${item.id}`,
              key: `plane_${item.id}`,
              width: 40,
            },
            {
              title: "Факт",
              dataIndex: `fact_${item.id}`,
              key: `fact_${item.id}`,
              render: (_, record) => (
                <InputNumber
                  min={0}
                  defaultValue={record[`fact_${item.id}`]}
                  onBlur={(e) => {
                    createIncomesBackup({
                      item_id: record.id,
                      quantity: Number(e.target.value),
                      warehouse_id: item.id,
                    });
                    let oldItems =
                      JSON.parse(localStorage.getItem("incomes")) || [];

                    oldItems.push({
                      item_id: record.id,
                      quantity: e.target.value,
                      warehouse_id: item.id,
                    });
                    localStorage.setItem("incomes", JSON.stringify(oldItems));
                  }}
                  onPressEnter={(e) => {
                    createIncomesBackup({
                      item_id: record.id,
                      quantity: Number(e.target.value),
                      warehouse_id: item.id,
                    });

                    let oldItems =
                      JSON.parse(localStorage.getItem("incomes")) || [];

                    oldItems.push({
                      item_id: record.id,
                      quantity: e.target.value,
                      warehouse_id: item.id,
                    });
                    localStorage.setItem("incomes", JSON.stringify(oldItems));
                  }}
                />
              ),
            },
          ],
        });
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
          obj[`plane_${el.warehouse_id}`] = el.incomes_plan;
          obj[`fact_${el.warehouse_id}`] = el.incomes;
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
          size="small"
          tableLayout="fixed"
          bordered
          scroll={{ x: true }}
          sticky={{ offsetHeader: 140 }}
          pagination={pagination}
          onChange={getWarehousesOrders}
          columns={[...staticColumns, ...columnsBackground]}
          dataSource={dataSource}
        />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default Stats;
