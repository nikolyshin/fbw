import { fetchGoods, fetchGoodsFilters } from '../api';
import React, { useEffect, useMemo, useState } from 'react';
import { Spin, Table, Alert, Select } from 'antd';
import moment from 'moment';
import ResizableTitle from './ResizableTitle';
import { resize } from './resize';
import FilterRange from './FilterRange';
const { Option } = Select;

const names = {
  category: 'Категории',
  brand: 'Брэнд',
  sales: 'Продаж',
  wb_key: 'Кабинет'
};

const DashBoard = ({ currentWbKey, date }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [filters, setFilters] = useState({});
  const [columns, setColumns] = useState([]);
  const [columnsSelect, setColumnsSelect] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  const arrDates = useMemo(() => {
    var now = date[0].clone(),
      dates = [];

    while (now.isSameOrBefore(date[1])) {
      dates.push(now.format('YYYY-MM-DD'));
      now.add(1, 'days');
    }
    return dates;
  }, [date]);

  const getListFilters = async () => {
    try {
      setLoading(true);
      const res = await fetchGoodsFilters({
        wb_keys: currentWbKey
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

  const getList = async (pagination, filters, sorter) => {
    let ordering;
    if (!!sorter) {
      ordering = sorter.order
        ? `${sorter.order === 'ascend' ? '' : '-'}${sorter.field}`
        : null;
    }
    try {
      setLoading(true);
      const res = await fetchGoods({
        date_from: moment(date[0]).format('YYYY-MM-DD'),
        date_to: moment(date[1]).format('YYYY-MM-DD'),
        wb_keys: currentWbKey,
        ordering,
        limit: pagination?.pageSize,
        offset: (pagination?.current - 1) * pagination?.pageSize || null,
        category: filters?.category,
        wb_key: filters?.wb_key,
        brand: filters?.brand
      });
      if (res.results) {
        const arr = [];
        res.results.forEach((item) => {
          const obj = { ...item };
          item.days.forEach((el) => {
            obj[`${el.date}`] = el.sales;
          });
          arr.push(obj);
        });

        setGoods(arr);
        setPagination((prev) => {
          return {
            ...prev,
            current: pagination?.current,
            total: Math.ceil(res.count),
            pageSize: pagination?.pageSize
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

  useEffect(() => {
    getListFilters();
  }, [currentWbKey]);

  useEffect(() => {
    setColumnsSelect(columns);
  }, [columns]);

  useEffect(() => {
    setColumns([
      {
        title: names.category,
        dataIndex: 'category',
        sorter: true,
        filterSearch: true,
        width: 200,
        fixed: 'left',
        filters: filters?.categories?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.sales,
        dataIndex: 'sales',
        width: 200,
        fixed: 'left',
        sorter: true
      },
      {
        title: names.brand,
        dataIndex: 'brand',
        width: 200,
        sorter: true,
        filterSearch: true,
        filters: filters?.brands?.map((item) => {
          return { text: item, value: item };
        })
      },
      {
        title: names.wb_key,
        dataIndex: 'wb_key',
        width: 200,
        sorter: true,
        filterSearch: true,
        filters: filters?.wb_keys?.map((item) => {
          return { text: item, value: item };
        })
      },
      ...arrDates.map((day) => {
        return {
          title: moment(day).format('DD-MM-YYYY'),
          dataIndex: moment(day).format('YYYY-MM-DD'),
          width: 100
        };
      })
    ]);
  }, [filters, arrDates]);

  return (
    <>
      <Select
        mode="multiple"
        allowClear
        showArrow
        value={columnsSelect.map((item) => item.title)}
        placeholder="Выбрать колонку"
        style={{
          width: 600,
          marginBottom: '24px'
        }}
        onChange={(value) => {
          setColumnsSelect([
            ...columns.filter((item) => value.includes(item.title))
          ]);
        }}
      >
        {columns.map((item) => (
          <Option key={item.title} value={item.title}>
            {item.title}
          </Option>
        ))}
      </Select>
      <Spin spinning={loading}>
        <Table
          size="small"
          scroll={{ x: 0 }}
          bordered
          components={{
            header: {
              cell: ResizableTitle
            }
          }}
          pagination={pagination}
          sticky={{ offsetHeader: 140 }}
          columns={resize({
            columns: columnsSelect,
            setColumns: setColumnsSelect
          })}
          onChange={getList}
          dataSource={goods}
        />
      </Spin>
      {!!error && <Alert closable message={error} type="error" />}
    </>
  );
};

export default DashBoard;
