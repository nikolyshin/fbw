import { fetchGoods, fetchGoodsFilters } from '../api';
import React, { useEffect, useMemo, useState } from 'react';
import { Spin, Table } from 'antd';
import moment from 'moment';
import ResizableTitle from './ResizableTitle';
import { resize } from './resize';
import { dateFormat, dateFormatReverse, names } from './helpers';
import SelectColumns from './SelectColumns';
import ModalError from './ModalError';

const nameOfStoreColumns = 'dashboardColumns';

const DashBoard = ({ currentWbKey, date }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goods, setGoods] = useState([]);
  const [filters, setFilters] = useState(null);
  const [columns, setColumns] = useState([]);
  const [columnsSelect, setColumnsSelect] = useState(
    JSON.parse(localStorage.getItem(nameOfStoreColumns)) || []
  );
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true
  });

  const arrDates = useMemo(() => {
    var now = date[0].clone(),
      dates = [];

    while (now.isSameOrBefore(date[1])) {
      dates.push(now.format(dateFormat));
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
        date_from: moment(date[0]).format(dateFormat),
        date_to: moment(date[1]).format(dateFormat),
        wb_keys: currentWbKey,
        ordering,
        limit: pagination?.pageSize,
        offset: (pagination?.current - 1) * pagination?.pageSize || null,

        // filters
        category__in: filters?.category,
        wb_key__in: filters?.wb_key,
        brand__in: filters?.brand,
        subject__in: filters?.subject
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
    if (!columnsSelect.length) {
      setColumnsSelect(columns);
    }
  }, [columns]);

  useEffect(() => {
    if (filters) {
      setColumns([
        {
          title: names.wb_key,
          dataIndex: 'wb_key',
          width: 200,
          sorter: true,
          filterSearch: true,
          fixed: 'left',
          filters: filters?.wb_keys?.map((item) => {
            return { text: item, value: item };
          })
        },
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
          title: names.subject,
          dataIndex: 'subject',
          sorter: true,
          filterSearch: true,
          width: 200,
          fixed: 'left',
          filters: filters?.subjects?.map((item) => {
            return { text: item, value: item };
          })
        },
        {
          title: names.brand,
          dataIndex: 'brand',
          width: 200,
          sorter: true,
          filterSearch: true,
          fixed: 'left',
          filters: filters?.brands?.map((item) => {
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
        ...arrDates.map((day, i) => {
          return {
            key: i,
            title: moment(day).format(dateFormatReverse),
            dataIndex: moment(day).format(dateFormat),
            width: 100
          };
        })
      ]);
    }
  }, [filters, arrDates]);

  return (
    <>
      <SelectColumns
        type={nameOfStoreColumns}
        columnsAll={columns}
        columnsSelect={columnsSelect}
        setColumnsSelect={setColumnsSelect}
      />
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
      <ModalError
        show={!!error}
        setShow={setError}
        title="Произошла ошибка"
        subtitle={error}
      />
    </>
  );
};

export default DashBoard;
