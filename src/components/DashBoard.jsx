import { fetchGoods } from "../api";
import React, { useEffect, useState } from "react";
import { Spin, Table, Alert, Segmented, Divider } from "antd";
import moment from "moment";

// const sortingTabs = [
//   { value: "sales", label: "sales" },
//   { value: "-sales", label: "-sales" },
// ];

const DashBoard = ({ currentWbKey, date }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [goods, setGoods] = useState([]);
  // const [currentOrdering, setCurrentOrdering] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    showSizeChanger: false,
  });

  const getList = async (pagination, filters, sorter) => {
    let ordering;
    if (!!sorter) {
      ordering = sorter.order
        ? `${sorter.order === "ascend" ? "" : "-"}${sorter.field}`
        : null;
    }
    try {
      setLoading(true);
      const res = await fetchGoods({
        date_from: moment(date[0]).format("YYYY-MM-DD"),
        date_to: moment(date[1]).format("YYYY-MM-DD"),
        wbKey: currentWbKey,
        ordering,
        page: pagination?.current,
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
    if (date) {
      getList();
    }
  }, [currentWbKey, date]);

  const columns = [
    {
      title: "Категории",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Количество покупок",
      dataIndex: "sales",
      sorter: true,
      key: "sales",
    },
  ];

  return (
    <>
      {/* <Segmented
        options={sortingTabs}
        value={currentOrdering}
        onChange={setCurrentOrdering}
      />
      <Divider /> */}
      <Spin spinning={loading}>
        <Table
          pagination={pagination}
          columns={columns}
          onChange={getList}
          dataSource={goods}
        />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default DashBoard;
